"""
누락 건 수동 다운로드 스크립트
산업 estimate에서 특정 ordno suffix를 찾아 다운로드 → 파싱 → Google Sheets 업로드
"""
import sys
import os
import time
import socket
import re
from pathlib import Path
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from datetime import date, timedelta

from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from bs4 import BeautifulSoup

from config import config
from logging_config import logger
from state_manager import state_manager
from google_sheet_hub import GoogleSheetHub
import local_file_processor

# ─── 설정 ──────────────────────────────────────
TARGET_SUFFIXES = {"320", "346", "441"}
YOUNGLIM_GUBUN = "산업"
LIST_URL = "http://door.yl.co.kr/oms/estimate_list.jsp?search_action=&younglim_gubun=%EC%82%B0%EC%97%85"
LOOKBACK_DAYS = 14  # 넉넉하게 14일
DOC_TYPE = "estimate"
SAVE_DIR = config.DOWNLOADS_DIR / DOC_TYPE
MAX_ROWS_PER_UPLOAD = 300


def connect_browser():
    port = config.BROWSER_DEBUG_PORT
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    if result != 0:
        print(f"[ERROR] Edge가 포트 {port}에서 실행되고 있지 않습니다.")
        sys.exit(1)

    options = EdgeOptions()
    options.add_experimental_option("debuggerAddress", f"127.0.0.1:{port}")
    try:
        driver = webdriver.Edge(options=options)
    except Exception as exc:
        cache_root = Path.home() / ".cache" / "selenium" / "msedgedriver" / "win64"
        candidates = sorted(cache_root.glob("*/msedgedriver.exe")) if cache_root.exists() else []
        if not candidates:
            raise
        service = EdgeService(executable_path=str(candidates[-1]))
        driver = webdriver.Edge(service=service, options=options)

    print(f"[OK] Edge 연결 완료 (포트 {port})")
    return driver


def apply_date_window(url):
    parsed = urlparse(url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    end_date = date.today()
    start_date = end_date - timedelta(days=LOOKBACK_DAYS)
    query["start_date"] = [start_date.isoformat()]
    query["end_date"] = [end_date.isoformat()]
    encoded = urlencode(
        [(k, v) for k, vals in query.items() for v in vals],
        doseq=True
    )
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", encoded, ""))


def find_and_download(driver):
    url = apply_date_window(LIST_URL)
    print(f"[1/4] 목록 페이지 접속: {url}")
    driver.get(url)
    time.sleep(3)

    current_url = driver.current_url
    if "login.jsp" in current_url:
        print("[ERROR] 로그인 페이지로 리다이렉트됨. Edge에서 영림 OMS에 로그인해주세요.")
        sys.exit(1)

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    # 목록에서 ordno 추출
    found = {}
    for row in soup.select("tr"):
        buttons = row.find_all("button", class_="estimate_link")
        for btn in buttons:
            ordno = btn.get("ordno", "")
            if not ordno:
                continue
            # ordno suffix 매칭 (예: 260604-320 → suffix=320)
            suffix = ordno.split("-")[-1] if "-" in ordno else ordno
            if suffix in TARGET_SUFFIXES:
                cols = row.find_all("td")
                order_no = cols[0].get_text(strip=True) if cols else "unknown"
                found[suffix] = {
                    "ordno": ordno,
                    "order_no": order_no,
                    "detail_url": f"http://door.yl.co.kr/oms/estimate_doc.jsp?ordno={ordno}&younglim_gubun=%EC%82%B0%EC%97%85"
                }

    if not found:
        print(f"[WARN] 목록에서 suffix {TARGET_SUFFIXES}에 해당하는 ordno를 찾지 못했습니다.")
        print(f"       현재 페이지 URL: {current_url}")
        print(f"       발견된 행 수: {len(soup.select('tr'))}")

        # 모든 ordno 출력
        all_ordnos = []
        for row in soup.select("tr"):
            for btn in row.find_all("button", class_="estimate_link"):
                o = btn.get("ordno", "")
                if o:
                    all_ordnos.append(o)
        print(f"       전체 ordno 목록: {all_ordnos}")
        return []

    print(f"[2/4] {len(found)}건 발견:")
    for suffix, info in sorted(found.items()):
        print(f"       ordno={info['ordno']}, order_no={info['order_no']}")

    # 다운로드
    downloaded_keys = []
    for suffix, info in sorted(found.items()):
        ordno = info["ordno"]
        order_no = info["order_no"]
        history_key = f"{order_no}_{ordno}_{YOUNGLIM_GUBUN}"
        filepath = SAVE_DIR / f"{history_key}.html"

        print(f"[3/4] 다운로드: {info['detail_url']}")
        driver.get(info["detail_url"])
        time.sleep(3)
        detail_html = driver.page_source

        if len(detail_html) < 1000:
            print(f"       [WARN] HTML 크기 부족 ({len(detail_html)}B), FAILED 처리")
            state_manager.update_state(DOC_TYPE, history_key, state_manager.STATUS_FAILED, "HTML too small")
            continue

        filepath.write_text(detail_html, encoding="utf-8")
        state_manager.update_state(DOC_TYPE, history_key, state_manager.STATUS_DOWNLOADED)
        state_manager.update_state(DOC_TYPE, history_key, state_manager.STATUS_READY)
        print(f"       [OK] 저장: {filepath.name} ({len(detail_html)}B) → READY")
        downloaded_keys.append(history_key)

    # 목록 페이지로 복귀
    driver.get(url)
    time.sleep(2)

    return downloaded_keys


def upload_keys(keys):
    if not keys:
        print("[4/4] 업로드할 파일 없음")
        return

    print(f"[4/4] {len(keys)}건 Google Sheets 업로드 시작...")
    hub = GoogleSheetHub()
    hub.connect()

    rows = []
    processed = []
    for key in keys:
        html_file = SAVE_DIR / f"{key}.html"
        if not html_file.exists():
            print(f"       [WARN] 파일 없음: {html_file}")
            continue
        try:
            html_content = html_file.read_text(encoding="utf-8")
            erp_data = local_file_processor.process_html_content(
                html_content, file_path_hint=html_file.name, target_type=DOC_TYPE
            )
            if erp_data:
                rows.extend(erp_data)
                processed.append(key)
                print(f"       [OK] 파싱: {key} → {len(erp_data)}행")
            else:
                print(f"       [WARN] 파싱 결과 0행: {key}")
        except Exception as e:
            print(f"       [ERROR] 파싱 실패 {key}: {e}")

    if not rows:
        print("       업로드할 데이터 없음")
        return

    try:
        result = hub.stage_and_copy(DOC_TYPE, rows, processed)
        if result.get("row_count", 0) > 0 and not result.get("skipped_duplicate"):
            hub.complete(force_clear=False)

        # history/state 업데이트
        history_path = config.HISTORY_FILE
        import json
        history = {"ledger": [], "estimate": []}
        if history_path.exists():
            try:
                history = json.loads(history_path.read_text(encoding="utf-8"))
            except Exception:
                pass

        for key in processed:
            state_manager.update_state(DOC_TYPE, key, state_manager.STATUS_COMPLETED)
            if key not in history.get(DOC_TYPE, []):
                history[DOC_TYPE].append(key)

        history_path.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"       [OK] {result['row_count']}행 / {result['file_count']}파일 → Google Sheets 완료")
    except Exception as e:
        print(f"       [ERROR] 업로드 실패: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("=" * 50)
    print(f"누락 건 수동 다운로드 (산업 ordno suffix: {TARGET_SUFFIXES})")
    print("=" * 50)

    driver = connect_browser()
    try:
        keys = find_and_download(driver)
        upload_keys(keys)
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()

    print("\n완료.")
