"""
V10 Console Server
영림 자동 다운로드 → Google Sheets 자동 업로드
Flask/대시보드 없음 - 콘솔 전용
"""
import os
import sys
import time
import signal
import socket
import subprocess
import threading
import json
import hashlib
import re
from pathlib import Path
from html import unescape

from config import config
from logging_config import logger
from state_manager import state_manager
from google_sheet_hub import GoogleSheetHub
import local_file_processor

from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs, urljoin, urlunparse, urlencode

# ─── 전역 ──────────────────────────────────────────────────
MAX_ROWS_PER_UPLOAD = 300
browser_lock = threading.Lock()
running = True
driver = None
sheet_hub = GoogleSheetHub()
PAGINATION_PARAM_KEYS = (
    "page", "pageNum", "pageno", "page_no", "cpage",
    "currentPage", "currPage", "curPage", "nowPage", "nowpage"
)


# ─── 브라우저 ───────────────────────────────────────────────
def connect_browser():
    global driver
    port = config.BROWSER_DEBUG_PORT

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()

    if result != 0:
        logger.info("[Browser] Edge not running on port %s. Launching...", port)
        subprocess.Popen(
            ["cmd", "/c", "start_edge_debug.bat"],
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        time.sleep(5)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        if result != 0:
            raise ConnectionError(f"Edge 포트 {port} 연결 실패")

    options = EdgeOptions()
    options.add_experimental_option("debuggerAddress", f"127.0.0.1:{port}")
    driver = webdriver.Edge(options=options)
    logger.info("[Browser] ✅ Edge 연결 완료 (포트 %s)", port)


def is_browser_alive():
    try:
        _ = driver.current_url
        return True
    except Exception:
        return False


def load_history():
    default_history = {"ledger": [], "estimate": []}
    if config.HISTORY_FILE.exists():
        try:
            with open(config.HISTORY_FILE, "r", encoding="utf-8") as handle:
                data = json.load(handle)
            if isinstance(data, list):
                return {"ledger": data, "estimate": []}
            return data
        except Exception as exc:
            logger.warning("[History] Failed to load history fallback: %s", exc)
    return default_history


def save_history(history_dict):
    try:
        with open(config.HISTORY_FILE, "w", encoding="utf-8") as handle:
            json.dump(history_dict, handle, ensure_ascii=False, indent=2)
    except Exception as exc:
        logger.error("[History] Failed to save history: %s", exc)


def _normalize_url(url):
    parsed = urlparse(url)
    query_items = parse_qs(parsed.query, keep_blank_values=True)
    normalized_query = urlencode(sorted(
        (key, value)
        for key, values in query_items.items()
        for value in values
    ))
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", normalized_query, ""))


def _build_paged_url(base_url, page_key, page_number):
    parsed = urlparse(base_url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    query[page_key] = [str(page_number)]
    encoded = urlencode(
        [(key, value) for key, values in query.items() for value in values],
        doseq=True
    )
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", encoded, ""))


def _extract_pagination_urls(base_url, current_url, soup, html_source):
    base_parsed = urlparse(base_url)
    base_params = parse_qs(base_parsed.query, keep_blank_values=True)
    expected_gubun = base_params.get("younglim_gubun", [""])[0]
    candidates = {_normalize_url(current_url)}
    snippets = [html_source]

    for tag in soup.find_all(["a", "button"]):
        for attr_name in ("href", "onclick", "data-href"):
            attr_val = tag.get(attr_name)
            if attr_val:
                snippets.append(str(attr_val))

        href = tag.get("href")
        if href and not href.lower().startswith("javascript:"):
            candidate = urljoin(current_url, href)
            parsed = urlparse(candidate)
            if parsed.path == base_parsed.path:
                if parse_qs(parsed.query, keep_blank_values=True).get("younglim_gubun", [""])[0] == expected_gubun:
                    candidates.add(_normalize_url(candidate))

    page_key = next((key for key in PAGINATION_PARAM_KEYS if key in base_params), None)
    for snippet in snippets:
        text = unescape(str(snippet))
        for match in re.findall(rf"{re.escape(Path(base_parsed.path).name)}[^\"'<>\\s]+", text):
            candidate = urljoin(current_url, match)
            parsed = urlparse(candidate)
            if parsed.path != base_parsed.path:
                continue
            if parse_qs(parsed.query, keep_blank_values=True).get("younglim_gubun", [""])[0] != expected_gubun:
                continue
            candidates.add(_normalize_url(candidate))

        for key in PAGINATION_PARAM_KEYS:
            for page_no in re.findall(rf"{key}\D{{0,5}}(\d+)", text, flags=re.IGNORECASE):
                candidates.add(_normalize_url(_build_paged_url(base_url, key, page_no)))
                page_key = page_key or key

    if page_key:
        for tag in soup.find_all(["a", "button"], string=re.compile(r"^\s*\d+\s*$")):
            page_no = tag.get_text(strip=True)
            if page_no.isdigit():
                candidates.add(_normalize_url(_build_paged_url(base_url, page_key, page_no)))

    return sorted(candidates)


def _build_fallback_key(order_no, row, button_col):
    raw = f"{order_no}|{row.get_text(' ', strip=True)}|{button_col}"
    return f"{order_no}_ROW{hashlib.sha1(raw.encode('utf-8', errors='ignore')).hexdigest()[:10]}"


def _extract_button_reference(order_no, row, button_col, younglim_gubun):
    fallback_key = _build_fallback_key(order_no, row, button_col)
    candidates = []

    estimate_button = button_col.find("button", class_="estimate_link")
    if estimate_button:
        candidates.append(("estimate", estimate_button))
    ledger_button = button_col.find("button", class_="trans_link")
    if ledger_button:
        candidates.append(("ledger", ledger_button))

    for element in button_col.find_all(["button", "a"]):
        if element not in [candidate[1] for candidate in candidates]:
            candidates.append((None, element))

    direct_url = None
    button_type = None
    button_id = None

    for inferred_type, element in candidates:
        attrs_to_scan = [element.get("ordno"), element.get("chulhano"), element.get("href"), element.get("onclick")]
        attrs_to_scan.extend(str(value) for value in element.attrs.values() if value)
        attrs_to_scan.append(str(element))

        for value in attrs_to_scan:
            if not value:
                continue
            text = unescape(str(value))

            estimate_url = re.search(r"(estimate_doc\.jsp\?[^\"'\s<>]+)", text)
            ledger_url = re.search(r"(trans_doc\.jsp\?[^\"'\s<>]+)", text)
            if estimate_url:
                direct_url = urljoin(config.YOUNGRIM_URL, estimate_url.group(1))
                button_type = "estimate"
            elif ledger_url:
                direct_url = urljoin(config.YOUNGRIM_URL, ledger_url.group(1))
                button_type = "ledger"

            ordno_match = re.search(r"(?:\bordno\b|[?&]ordno=)\s*=?['\"]?([A-Za-z0-9_-]+)", text)
            if ordno_match:
                button_id = ordno_match.group(1)
                button_type = "estimate"
            chulhano_match = re.search(r"(?:\bchulhano\b|[?&]chulhano=)\s*=?['\"]?([A-Za-z0-9_-]+)", text)
            if chulhano_match:
                button_id = chulhano_match.group(1)
                button_type = "ledger"

            if inferred_type and not button_type:
                button_type = inferred_type

            if button_id and button_type:
                break

        if button_id and button_type:
            break

    if direct_url and not button_id:
        parsed = urlparse(direct_url)
        params = parse_qs(parsed.query, keep_blank_values=True)
        button_id = (params.get("ordno") or params.get("chulhano") or [None])[0]
        if params.get("ordno"):
            button_type = "estimate"
        elif params.get("chulhano"):
            button_type = "ledger"

    if button_id and not direct_url:
        if button_type == "ledger":
            direct_url = f"http://door.yl.co.kr/oms/trans_doc.jsp?chulhano={button_id}&younglim_gubun={younglim_gubun}"
        else:
            direct_url = f"http://door.yl.co.kr/oms/estimate_doc.jsp?ordno={button_id}&younglim_gubun={younglim_gubun}"

    key_suffix = button_id or fallback_key.split("_", 1)[1]
    return {
        "button_type": button_type or "estimate",
        "button_id": button_id,
        "history_key": f"{order_no}_{key_suffix}",
        "detail_url": direct_url,
    }


# ─── 다운로드 ───────────────────────────────────────────────
def download_from_page(list_url, save_dir, doc_type):
    logger.info("[Download] %s", list_url.split("gubun=")[-1])
    return _download_from_page_impl(list_url, save_dir, doc_type)
    completed_keys = set(state_manager.get_keys_by_status(doc_type, state_manager.STATUS_COMPLETED))
    history_keys = set(load_history().get(doc_type, []))
    queue = [list_url]
    visited = set()
    downloaded = 0
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 3:
            continue

        order_no = cols[0].get_text(strip=True)
        if not order_no:
            continue

        # 이미 완료된 항목 스킵
        # 버튼 찾기
        button_col = cols[-1]
        button = button_col.find("button", class_="estimate_link")
        button_type = "estimate"
        if not button:
            button = button_col.find("button", class_="trans_link")
            button_type = "ledger"
        if not button:
            continue

        button_id = button.get("ordno") or button.get("chulhano", "")
        if not button_id:
            continue

        history_key = f"{order_no}_{button_id}"

        if history_key in completed_keys:
            continue

        if button_type == "ledger":
            detail_url = f"http://door.yl.co.kr/oms/trans_doc.jsp?chulhano={button_id}&younglim_gubun={younglim_gubun}"
        else:
            detail_url = f"http://door.yl.co.kr/oms/estimate_doc.jsp?ordno={button_id}&younglim_gubun={younglim_gubun}"

        try:
            with browser_lock:
                driver.get(detail_url)
                time.sleep(3)
                detail_html = driver.page_source
                driver.get(list_url)
                time.sleep(2)

            filepath = save_dir / f"{history_key}.html"
            filepath.write_text(detail_html, encoding='utf-8')

            state_manager.update_state(doc_type, history_key, state_manager.STATUS_DOWNLOADED)
            if len(detail_html) > 1000:
                state_manager.update_state(doc_type, history_key, state_manager.STATUS_READY)
                logger.info("[Download] ✅ %s", filepath.name)
                downloaded += 1
            else:
                state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, "HTML too small")

        except Exception as e:
            logger.error("[Download] Error %s: %s", order_no, e)

    return downloaded


# ─── 업로드 ────────────────────────────────────────────────
def _download_from_page_impl(list_url, save_dir, doc_type):
    completed_keys = set(state_manager.get_keys_by_status(doc_type, state_manager.STATUS_COMPLETED))
    history_keys = set(load_history().get(doc_type, []))
    queue = [list_url]
    visited = set()
    downloaded = 0

    while queue:
        current_list_url = queue.pop(0)
        normalized_url = _normalize_url(current_list_url)
        if normalized_url in visited:
            continue
        visited.add(normalized_url)

        with browser_lock:
            driver.get(current_list_url)
            time.sleep(2)
            current_url = driver.current_url
            html_source = driver.page_source

        soup = BeautifulSoup(html_source, 'html.parser')
        rows = soup.select("table tbody tr")
        logger.info("[Download] %s rows found (%s)", len(rows), current_url)

        for next_url in _extract_pagination_urls(list_url, current_url, soup, html_source):
            if next_url not in visited and next_url not in queue:
                queue.append(next_url)

        parsed = urlparse(current_url)
        younglim_gubun = parse_qs(parsed.query).get('younglim_gubun', [''])[0]

        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue

            order_no = cols[0].get_text(strip=True)
            if not order_no:
                continue

            button_ref = _extract_button_reference(order_no, row, cols[-1], younglim_gubun)
            history_key = button_ref["history_key"]
            if history_key in completed_keys or history_key in history_keys:
                continue

            if not button_ref["detail_url"]:
                logger.warning("[Download] Missing detail URL for %s, fallback key=%s", order_no, history_key)
                state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, "Missing detail URL / button reference")
                continue

            try:
                with browser_lock:
                    driver.get(button_ref["detail_url"])
                    time.sleep(3)
                    detail_html = driver.page_source
                    driver.get(current_list_url)
                    time.sleep(2)

                filepath = save_dir / f"{history_key}.html"
                filepath.write_text(detail_html, encoding='utf-8')

                state_manager.update_state(doc_type, history_key, state_manager.STATUS_DOWNLOADED)
                if len(detail_html) > 1000:
                    state_manager.update_state(doc_type, history_key, state_manager.STATUS_READY)
                    logger.info("[Download] ??%s", filepath.name)
                    downloaded += 1
                else:
                    state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, "HTML too small")

            except Exception as e:
                logger.error("[Download] Error %s (%s): %s", order_no, history_key, e)
                state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, str(e)[:200])

    return downloaded


def auto_upload(doc_type="estimate"):
    ready_keys = sorted(state_manager.get_keys_by_status(doc_type, state_manager.STATUS_READY))
    if not ready_keys:
        logger.info("[Upload] READY 파일 없음")
        return

    logger.info("[Upload] READY 파일 %s개 업로드 시작...", len(ready_keys))

    doc_dir = config.DOWNLOADS_DIR / doc_type
    rows = []
    processed = []

    for key in ready_keys:
        html_file = doc_dir / f"{key}.html"
        if not html_file.exists():
            continue
        try:
            html_content = html_file.read_text(encoding='utf-8')
            erp_data = local_file_processor.process_html_content(
                html_content, file_path_hint=html_file.name, target_type=doc_type
            )
            if erp_data:
                if len(rows) + len(erp_data) > MAX_ROWS_PER_UPLOAD:
                    logger.info("[Upload] %s행 제한 도달. 나머지는 다음 사이클에 업로드.", MAX_ROWS_PER_UPLOAD)
                    break
                rows.extend(erp_data)
                processed.append(key)
        except Exception as e:
            logger.error("[Upload] 파싱 오류 %s: %s", key, e)

    if not rows:
        logger.info("[Upload] 업로드할 데이터 없음")
        return

    try:
        result = sheet_hub.stage_and_copy(doc_type, rows, processed)
        history = load_history()
        for key in processed:
            state_manager.update_state(doc_type, key, state_manager.STATUS_COMPLETED)
            if key not in history.get(doc_type, []):
                history[doc_type].append(key)
        logger.info("[Upload] ✅ %s행 / %s파일 → Google Sheets 완료", result['row_count'], result['file_count'])
        save_history(history)
    except Exception as e:
        logger.error("[Upload] Google Sheets 업로드 실패: %s", e)


# ─── 메인 사이클 ────────────────────────────────────────────
def run_cycle():
    logger.info("[Cycle] ── 사이클 시작 ──────────────────")

    if not is_browser_alive():
        logger.warning("[Cycle] 브라우저 연결 끊김. 재연결 시도...")
        try:
            connect_browser()
        except Exception as e:
            logger.error("[Cycle] 브라우저 재연결 실패: %s", e)
            return

    # 세션 유지
    with browser_lock:
        driver.get(config.YOUNGRIM_URL)
        time.sleep(3)

    # 다운로드 (Estimate만)
    total_new = 0
    if config.ENABLE_ESTIMATE:
        for idx, url in enumerate(config.YOUNGRIM_ESTIMATE_URLS, 1):
            logger.info("[Cycle] Estimate 페이지 %s/%s", idx, len(config.YOUNGRIM_ESTIMATE_URLS))
            total_new += download_from_page(url, config.DOWNLOADS_DIR / "estimate", "estimate")

    logger.info("[Cycle] 다운로드 완료: 신규 %s건", total_new)

    # 자동 업로드
    ready_count = len(state_manager.get_keys_by_status("estimate", state_manager.STATUS_READY))
    if ready_count > 0:
        logger.info("[Cycle] READY %s건 → 자동 업로드", ready_count)
        try:
            sheet_hub.connect()
            auto_upload("estimate")
        except Exception as e:
            logger.error("[Cycle] 업로드 오류: %s", e)
    else:
        logger.info("[Cycle] READY 파일 없음. 업로드 스킵.")

    logger.info("[Cycle] ── 완료. %s분 후 다음 사이클 ──", config.DOWNLOAD_INTERVAL_SEC // 60)


# ─── 진입점 ────────────────────────────────────────────────
def shutdown(sig=None, frame=None):
    global running
    logger.info("[System] 종료 중...")
    running = False
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    logger.info("=" * 50)
    logger.info("V10 Console Server 시작")
    logger.info("Interval: %s분 | Estimate: %s", config.DOWNLOAD_INTERVAL_SEC // 60, config.ENABLE_ESTIMATE)
    logger.info("=" * 50)

    # 브라우저 연결
    try:
        connect_browser()
    except Exception as e:
        logger.error("[Startup] 브라우저 연결 실패: %s", e)
        logger.error("Edge를 디버그 모드로 실행 후 재시작하세요 (start_edge_debug.bat)")
        sys.exit(1)

    # Google Sheets 연결
    try:
        sheet_hub.connect()
        logger.info("[Startup] ✅ Google Sheets 연결 완료")
    except Exception as e:
        logger.error("[Startup] Google Sheets 연결 실패: %s", e)

    # 메인 루프
    while running:
        try:
            run_cycle()
        except Exception as e:
            logger.error("[Main] 오류: %s", e)

        for _ in range(config.DOWNLOAD_INTERVAL_SEC):
            if not running:
                break
            time.sleep(1)
