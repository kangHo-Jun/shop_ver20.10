"""
V10 Console Server
?????袁⑤뜳??????????嚥싲갭큔???癲??嶺???ル맪????Google Sheets ????????????Flask/?????꿔꺂????????????⑤뜤??- ?????밸븶????????諛몃마??
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
import atexit
import faulthandler
from pathlib import Path
from html import unescape
from datetime import date, timedelta, datetime

from config import config
from logging_config import logger
from state_manager import state_manager
from google_sheet_hub import GoogleSheetHub
import local_file_processor

from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs, urljoin, urlunparse, urlencode

# ?????? ?????諛몃마??????????????????????????????????????????????????????????????????????????????????????????????????????
MAX_ROWS_PER_UPLOAD = 300
browser_lock = threading.Lock()
running = True
driver = None
sheet_hub = GoogleSheetHub()
PAGINATION_PARAM_KEYS = (
    "page", "pageNum", "pageno", "page_no", "cpage",
    "currentPage", "currPage", "curPage", "nowPage", "nowpage"
)
DEFAULT_LOOKBACK_DAYS = 7
PID_FILE = config.LOGS_DIR / "run_server.pid"
EDGE_PID_FILE = config.LOGS_DIR / "edge_9333.pid"
LOCK_FILE = config.LOGS_DIR / "v11.lock"
SHEET_RESET_DATE_FILE = config.LOGS_DIR / "sheet_reset_date.txt"
SINGLE_INSTANCE_PORT = int(os.getenv("RUN_SERVER_LOCK_PORT", "5081"))
instance_lock_socket = None
sleep_loop_counter = 0
last_cycle_completed_at = None
faulthandler_log_handle = None


def _write_pid_file():
    try:
        PID_FILE.write_text(str(os.getpid()), encoding="utf-8")
    except Exception as exc:
        logger.warning("[System] Failed to write PID file %s: %s", PID_FILE, exc)


def _cleanup_pid_file():
    try:
        if PID_FILE.exists():
            content = PID_FILE.read_text(encoding="utf-8").strip()
            if content == str(os.getpid()):
                PID_FILE.unlink()
    except Exception as exc:
        logger.warning("[System] Failed to clean PID file %s: %s", PID_FILE, exc)


def _write_edge_pid_file(pid_text):
    try:
        EDGE_PID_FILE.write_text(str(pid_text).strip(), encoding="utf-8")
    except Exception as exc:
        logger.warning("[System] Failed to write Edge PID file %s: %s", EDGE_PID_FILE, exc)


def _get_listener_pid(port):
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
    except Exception as exc:
        logger.warning("[System] Failed to query listener PID on port %s: %s", port, exc)
        return None

    for line in (result.stdout or "").splitlines():
        if f":{port}" not in line:
            continue
        if "LISTENING" not in line.upper():
            continue
        parts = line.split()
        if parts:
            return parts[-1].strip()
    return None


def _record_edge_pid_from_listener(port):
    pid_text = _get_listener_pid(port)
    if pid_text:
        _write_edge_pid_file(pid_text)
    else:
        logger.warning("[Browser] Could not determine Edge PID for port %s", port)
    return pid_text


def _is_pid_running(pid_text):
    try:
        pid = int(str(pid_text).strip())
    except Exception:
        return False

    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def _cleanup_lock_file():
    try:
        if LOCK_FILE.exists():
            content = LOCK_FILE.read_text(encoding="utf-8").strip()
            if content == str(os.getpid()):
                LOCK_FILE.unlink()
    except Exception as exc:
        logger.warning("[System] Failed to clean lock file %s: %s", LOCK_FILE, exc)


def _cleanup_faulthandler_log():
    global faulthandler_log_handle
    if faulthandler_log_handle is not None:
        try:
            faulthandler_log_handle.flush()
            faulthandler_log_handle.close()
        except Exception:
            pass
        faulthandler_log_handle = None


def _setup_runtime_diagnostics():
    global faulthandler_log_handle

    dump_path = config.LOGS_DIR / f"faulthandler_{date.today().strftime('%Y%m%d')}.log"
    try:
        faulthandler_log_handle = open(dump_path, "a", encoding="utf-8")
        faulthandler.enable(file=faulthandler_log_handle, all_threads=True)
        logger.info("[Diag] faulthandler enabled -> %s", dump_path)
    except Exception as exc:
        logger.warning("[Diag] Failed to enable faulthandler: %s", exc)


def _log_sleep_heartbeat(second_index):
    global sleep_loop_counter

    sleep_loop_counter += 1
    if second_index == 0:
        logger.info(
            "[Sleep] Entering wait loop: interval=%ss, last_cycle_completed_at=%s",
            config.DOWNLOAD_INTERVAL_SEC,
            last_cycle_completed_at,
        )
        return

    if second_index % 60 == 0:
        logger.info(
            "[Sleep] Heartbeat: slept=%ss/%ss (loop=%s, running=%s)",
            second_index,
            config.DOWNLOAD_INTERVAL_SEC,
            sleep_loop_counter,
            running,
        )


def acquire_single_instance_lock():
    global instance_lock_socket

    if instance_lock_socket is not None:
        return True

    if LOCK_FILE.exists():
        existing_pid = LOCK_FILE.read_text(encoding="utf-8", errors="ignore").strip()
        if _is_pid_running(existing_pid):
            logger.error("[System] Another run_server.py instance is already running (lock file %s, pid=%s)", LOCK_FILE, existing_pid)
            return False
        try:
            LOCK_FILE.unlink()
            logger.warning("[System] Removed stale lock file %s", LOCK_FILE)
        except Exception as exc:
            logger.error("[System] Failed to remove stale lock file %s: %s", LOCK_FILE, exc)
            return False

    try:
        fd = os.open(str(LOCK_FILE), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(str(os.getpid()))
        with open("logs/run_server.pid", "w", encoding="utf-8") as f:
            f.write(str(os.getpid()))
    except FileExistsError:
        existing_pid = LOCK_FILE.read_text(encoding="utf-8", errors="ignore").strip()
        logger.error("[System] Another run_server.py instance is already running (lock file %s, pid=%s)", LOCK_FILE, existing_pid)
        return False
    except Exception as exc:
        logger.error("[System] Failed to create lock file %s: %s", LOCK_FILE, exc)
        return False

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("127.0.0.1", SINGLE_INSTANCE_PORT))
        sock.listen(1)
        instance_lock_socket = sock
        logger.info("[System] Single-instance lock acquired on 127.0.0.1:%s", SINGLE_INSTANCE_PORT)
        return True
    except OSError:
        sock.close()
        _cleanup_lock_file()
        logger.error("[System] Another run_server.py instance is already running (lock port %s)", SINGLE_INSTANCE_PORT)
        return False


def release_single_instance_lock():
    global instance_lock_socket
    if instance_lock_socket is not None:
        try:
            instance_lock_socket.close()
        except Exception:
            pass
        instance_lock_socket = None


def ensure_daily_sheet_reset(today_str=None, reset_file=None, hub=None):
    reset_file = Path(reset_file) if reset_file else SHEET_RESET_DATE_FILE
    hub = hub or sheet_hub
    today_str = today_str or date.today().isoformat()

    last_reset = ""
    if reset_file.exists():
        try:
            last_reset = reset_file.read_text(encoding="utf-8").strip()
        except Exception as exc:
            logger.warning("[SheetReset] Failed to read %s: %s", reset_file, exc)

    if last_reset == today_str:
        logger.info("[SheetReset] Sheet10/11 already reset for %s", today_str)
        return False

    hub.connect()
    hub.clear_unmapped_sheets()
    reset_file.write_text(today_str, encoding="utf-8")
    logger.info("[SheetReset] Reset Sheet10/11 for %s and updated %s", today_str, reset_file)
    return True


def _normalize_gubun(younglim_gubun):
    value = (younglim_gubun or "").strip()
    if value in ("\uc0b0\uc5c5", "\uc784\uc5c5"):
        return value
    if "\uc0b0\uc5c5" in value and "\uc784\uc5c5" not in value:
        return "\uc0b0\uc5c5"
    if "\uc784\uc5c5" in value and "\uc0b0\uc5c5" not in value:
        return "\uc784\uc5c5"
    return value or "\ubbf8\ubd84\ub958"


def _build_history_key(order_no, key_suffix, younglim_gubun):
    return f"{order_no}_{key_suffix}_{_normalize_gubun(younglim_gubun)}"


# ?????? ????????щⅨ???? ??????????????????????????????????????????????????????????????????????????????????????????????
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
            raise ConnectionError(f"Edge debug port {port} is not available")
        _record_edge_pid_from_listener(port)

    options = EdgeOptions()
    options.add_experimental_option("debuggerAddress", f"127.0.0.1:{port}")
    driver = _create_edge_driver(options)
    _record_edge_pid_from_listener(port)
    logger.info("[Browser] Edge connected on port %s", port)


def _find_local_msedgedriver():
    cache_root = Path.home() / ".cache" / "selenium" / "msedgedriver" / "win64"
    if not cache_root.exists():
        return None

    candidates = sorted(cache_root.glob("*/msedgedriver.exe"))
    if not candidates:
        return None
    return candidates[-1]


def _create_edge_driver(options):
    try:
        return webdriver.Edge(options=options)
    except Exception as exc:
        local_driver = _find_local_msedgedriver()
        if not local_driver:
            raise

        logger.warning("[Browser] Selenium Manager failed, retrying with local EdgeDriver: %s (%s)", local_driver, exc)
        service = EdgeService(executable_path=str(local_driver))
        return webdriver.Edge(service=service, options=options)


def is_browser_alive():
    try:
        _ = driver.current_url
        return True
    except Exception:
        return False


def _is_no_such_window_error(exc):
    message = str(exc).lower()
    return "no such window" in message or "target window already closed" in message or "web view not found" in message


def _is_recoverable_webdriver_error(exc):
    message = str(exc).lower()
    if _is_no_such_window_error(exc):
        return True
    return (
        "read timed out" in message
        or "httpconnectionpool" in message
        or "max retries exceeded" in message
        or "failed to establish a new connection" in message
        or ("localhost" in message and "timed out" in message)
    )


def reconnect_and_retry(action, description, max_retries=2):
    last_exc = None
    for attempt in range(max_retries + 1):
        try:
            return action()
        except Exception as exc:
            last_exc = exc
            if not _is_recoverable_webdriver_error(exc):
                raise
            if attempt >= max_retries:
                logger.error(
                    "[Browser] %s failed after %s reconnect attempt(s): %s",
                    description,
                    max_retries,
                    exc,
                )
                raise
            logger.warning(
                "[Browser] %s hit a recoverable browser/driver error. Reconnecting now (%s/%s)...",
                description,
                attempt + 1,
                max_retries,
            )
            connect_browser()
    raise last_exc


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


def _apply_date_window(list_url, lookback_days=DEFAULT_LOOKBACK_DAYS):
    parsed = urlparse(list_url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    end_date = date.today()
    start_date = end_date - timedelta(days=lookback_days)
    query["start_date"] = [start_date.isoformat()]
    query["end_date"] = [end_date.isoformat()]
    encoded = urlencode(
        [(key, value) for key, values in query.items() for value in values],
        doseq=True
    )
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", encoded, ""))


def _extract_list_rows(soup):
    actionable_rows = []

    for row in soup.select("tr"):
        if "jsgrid-nodata-row" in (row.get("class") or []):
            continue
        if row.find("button", class_="estimate_link") or row.find("button", class_="trans_link"):
            actionable_rows.append(row)
            continue

        button_col = row.find_all("td")
        if not button_col:
            continue
        row_html = str(row)
        if "estimate_doc.jsp" in row_html or "trans_doc.jsp" in row_html:
            actionable_rows.append(row)
            continue
        if re.search(r"\bordno\b|\bchulhano\b", row_html):
            actionable_rows.append(row)

    return actionable_rows


def _read_filter_values(soup):
    filters = {}
    for name in ("start_date", "end_date", "younglim_gubun"):
        field = soup.find(attrs={"name": name})
        if not field:
            continue
        filters[name] = field.get("value") or field.get_text(" ", strip=True)
    return filters


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
        "history_key": _build_history_key(order_no, key_suffix, younglim_gubun),
        "detail_url": direct_url,
    }


# ?????? ???嚥싲갭큔???癲??嶺???ル맪????????????????????????????????????????????????????????????????????????????????????????????????
def download_from_page(list_url, save_dir, doc_type):
    logger.info("[Download] %s", list_url.split("gubun=")[-1])
    return _download_from_page_impl(list_url, save_dir, doc_type)


# ?????? ???????????????????????????????????????????????????????????????????????????????????????????????????????
def _download_from_page_impl(list_url, save_dir, doc_type):
    completed_keys = set(state_manager.get_keys_by_status(doc_type, state_manager.STATUS_COMPLETED))
    history_keys = set(load_history().get(doc_type, []))
    queue = [_apply_date_window(list_url)]
    visited = set()
    downloaded = 0

    while queue:
        current_list_url = queue.pop(0)
        normalized_url = _normalize_url(current_list_url)
        if normalized_url in visited:
            continue
        visited.add(normalized_url)

        with browser_lock:
            def load_list_page():
                driver.get(current_list_url)
                time.sleep(2)
                return driver.current_url, driver.page_source

            current_url, html_source = reconnect_and_retry(
                load_list_page,
                f"Load list page {current_list_url}",
            )

        soup = BeautifulSoup(html_source, 'html.parser')
        rows = _extract_list_rows(soup)
        filters = _read_filter_values(soup)
        logger.info("[Download] %s actionable rows found (%s) filters=%s", len(rows), current_url, filters)

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
                    def load_detail_page():
                        driver.get(button_ref["detail_url"])
                        time.sleep(3)
                        html = driver.page_source
                        driver.get(current_list_url)
                        time.sleep(2)
                        return html

                    detail_html = reconnect_and_retry(
                        load_detail_page,
                        f"Load detail page {button_ref['detail_url']}",
                    )

                filepath = save_dir / f"{history_key}.html"
                filepath.write_text(detail_html, encoding='utf-8')

                state_manager.update_state(doc_type, history_key, state_manager.STATUS_DOWNLOADED)
                if len(detail_html) > 1000:
                    state_manager.update_state(doc_type, history_key, state_manager.STATUS_READY)
                    logger.info("[Download] Saved %s", filepath.name)
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
        logger.info("[Upload] READY files not found")
        return

    logger.info("[Upload] READY %s files found. Starting Google Sheets upload...", len(ready_keys))

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
                    logger.info("[Upload] Reached MAX_ROWS_PER_UPLOAD=%s. Remaining files will be uploaded in the next batch.", MAX_ROWS_PER_UPLOAD)
                    break
                rows.extend(erp_data)
                processed.append(key)
        except Exception as e:
            logger.error("[Upload] Failed to process file %s: %s", key, e)

    if not rows:
        logger.info("[Upload] No rows collected for upload")
        return

    try:
        result = sheet_hub.stage_and_copy(doc_type, rows, processed)
        if result.get('row_count', 0) <= 0:
            for key in processed:
                state_manager.update_state(doc_type, key, state_manager.STATUS_FAILED, "No mapped rows for Google Sheets")
            logger.warning("[Upload] 0 mapped rows for %s file(s); marked FAILED instead of COMPLETED", len(processed))
            return
        if not result.get("skipped_duplicate"):
            sheet_hub.complete(force_clear=False)
        history = load_history()
        for key in processed:
            state_manager.update_state(doc_type, key, state_manager.STATUS_COMPLETED)
            if key not in history.get(doc_type, []):
                history[doc_type].append(key)
        logger.info("[Upload] %s rows / %s files -> Google Sheets complete", result['row_count'], result['file_count'])
        save_history(history)
    except Exception as e:
        logger.error("[Upload] Google Sheets upload failed: %s", e)


# Main cycle
def run_cycle():
    global last_cycle_completed_at
    try:
        ensure_daily_sheet_reset()
    except Exception as e:
        logger.error("[Cycle] Sheet10/11 daily reset failed: %s", e)
    logger.info("[Cycle] Starting cycle")

    if not is_browser_alive():
        logger.warning("[Cycle] Browser connection appears dead. Reconnecting now...")
        try:
            connect_browser()
        except Exception as e:
            logger.error("[Cycle] Browser reconnect failed: %s", e)
            return

    # ??轅붽틓????????
    with browser_lock:
        reconnect_and_retry(
            lambda: (driver.get(config.YOUNGRIM_URL), time.sleep(3)),
            f"Keep session on {config.YOUNGRIM_URL}",
        )

    # Download estimate documents
    total_new = 0
    if config.ENABLE_ESTIMATE:
        for idx, url in enumerate(config.YOUNGRIM_ESTIMATE_URLS, 1):
            logger.info("[Cycle] Estimate page %s/%s", idx, len(config.YOUNGRIM_ESTIMATE_URLS))
            total_new += download_from_page(url, config.DOWNLOADS_DIR / "estimate", "estimate")

    logger.info("[Cycle] Download complete: new %s docs", total_new)

    # Upload READY files
    ready_count = len(state_manager.get_keys_by_status("estimate", state_manager.STATUS_READY))
    if ready_count > 0:
        logger.info("[Cycle] READY %s docs found. Starting upload.", ready_count)
        try:
            sheet_hub.connect()
            auto_upload("estimate")
        except Exception as e:
            logger.error("[Cycle] Upload error: %s", e)
    else:
        logger.info("[Cycle] No READY files. Upload skipped.")

    logger.info("[Cycle] Completed. Next cycle in %s minutes", config.DOWNLOAD_INTERVAL_SEC // 60)


# ?????? ?饔낅떽???????????????????????????????????????????????????????????????????????????????????????????????????????
def shutdown(sig=None, frame=None):
    global running
    logger.info("[System] Shutdown requested. sig=%s pid=%s time=%s", sig, os.getpid(), datetime.now().isoformat())
    running = False
    _cleanup_pid_file()
    _cleanup_lock_file()
    _cleanup_faulthandler_log()
    release_single_instance_lock()
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    atexit.register(_cleanup_pid_file)
    atexit.register(_cleanup_lock_file)
    atexit.register(_cleanup_faulthandler_log)
    atexit.register(release_single_instance_lock)

    if not acquire_single_instance_lock():
        sys.exit(0)

    _write_pid_file()
    _setup_runtime_diagnostics()

    logger.info("=" * 50)
    logger.info("V10 Console Server starting")
    logger.info("Interval: %s min | Estimate: %s", config.DOWNLOAD_INTERVAL_SEC // 60, config.ENABLE_ESTIMATE)
    logger.info("=" * 50)

    # Browser startup
    try:
        connect_browser()
    except Exception as e:
        logger.error("[Startup] Browser startup failed: %s", e)
        logger.error("Edge browser is not ready. Please verify the debug browser and retry.")
        sys.exit(1)

    # Google Sheets startup
    try:
        sheet_hub.connect()
        logger.info("[Startup] Google Sheets connected")
    except Exception as e:
        logger.error("[Startup] Google Sheets connection failed: %s", e)

    # Main loop
    while running:
        try:
            run_cycle()
        except Exception as e:
            logger.error("[Main] Unhandled error: %s", e)

        wait_started_at = datetime.now().isoformat()
        for second_index in range(config.DOWNLOAD_INTERVAL_SEC):
            _log_sleep_heartbeat(second_index)
            if not running:
                break
            time.sleep(1)
        logger.info("[Sleep] Wait loop finished: started_at=%s, ended_at=%s, running=%s", wait_started_at, datetime.now().isoformat(), running)
