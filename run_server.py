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
from pathlib import Path

from config import config
from logging_config import logger
from state_manager import state_manager
from google_sheet_hub import GoogleSheetHub
import local_file_processor

from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs

# ─── 전역 ──────────────────────────────────────────────────
MAX_ROWS_PER_UPLOAD = 300
browser_lock = threading.Lock()
running = True
driver = None
sheet_hub = GoogleSheetHub()


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


# ─── 다운로드 ───────────────────────────────────────────────
def download_from_page(list_url, save_dir, doc_type):
    logger.info("[Download] %s", list_url.split("gubun=")[-1])

    with browser_lock:
        driver.get(list_url)
        time.sleep(2)
        html_source = driver.page_source

    soup = BeautifulSoup(html_source, 'html.parser')
    rows = soup.select("table tbody tr")
    logger.info("[Download] %s rows found", len(rows))

    parsed = urlparse(list_url)
    younglim_gubun = parse_qs(parsed.query).get('younglim_gubun', [''])[0]
    completed_keys = state_manager.get_keys_by_status(doc_type, state_manager.STATUS_COMPLETED)

    downloaded = 0
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 3:
            continue

        order_no = cols[0].get_text(strip=True)
        if not order_no:
            continue

        # 이미 완료된 항목 스킵
        if order_no in completed_keys or any(k.startswith(order_no) for k in completed_keys):
            continue

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
        logger.info("[Upload] ✅ %s행 / %s파일 → Google Sheets 완료", result['row_count'], result['file_count'])
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
