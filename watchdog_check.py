import argparse
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
LOGS_DIR = BASE_DIR / "logs"
STATE_FILE = BASE_DIR / "v10_state.json"
PID_FILE = LOGS_DIR / "run_server.pid"
LOCK_FILE = LOGS_DIR / "v11.lock"
HEALTH_STATUS_FILE = LOGS_DIR / "health_status.json"
WATCHDOG_STATE_FILE = LOGS_DIR / "watchdog_alert_state.json"
WATCHDOG_RECOVERY_STATE_FILE = LOGS_DIR / "watchdog_recovery_state.json"
RESTART_CLEAN_BAT = BASE_DIR / "RESTART_CLEAN.bat"
ALERT_EMAIL_SCRIPT = BASE_DIR / "send_alert_email.py"
ATTACH_PROBE_SCRIPT = BASE_DIR / "edge_attach_probe.py"

SERVER_PORT = int(os.getenv("RUN_SERVER_LOCK_PORT", "5081"))
EDGE_PORT = int(os.getenv("BROWSER_DEBUG_PORT", "9333"))
APP_LOG_STALE_MIN = int(os.getenv("WATCHDOG_APP_LOG_STALE_MIN", "15"))
HEALTH_STALE_MIN = int(os.getenv("WATCHDOG_HEALTH_STALE_MIN", "10"))
READY_STALE_MIN = int(os.getenv("WATCHDOG_READY_STALE_MIN", "10"))
ALERT_COOLDOWN_MIN = int(os.getenv("WATCHDOG_ALERT_COOLDOWN_MIN", "30"))
AUTO_RECOVER = os.getenv("WATCHDOG_AUTO_RECOVER", "true").lower() == "true"
RECOVERY_COOLDOWN_MIN = int(os.getenv("WATCHDOG_RECOVERY_COOLDOWN_MIN", "30"))
RECOVERY_START_HOUR = int(os.getenv("WATCHDOG_RECOVERY_START_HOUR", "6"))
RECOVERY_START_MINUTE = int(os.getenv("WATCHDOG_RECOVERY_START_MINUTE", "5"))
RECOVERY_END_HOUR = int(os.getenv("WATCHDOG_RECOVERY_END_HOUR", "16"))
RECOVERY_END_MINUTE = int(os.getenv("WATCHDOG_RECOVERY_END_MINUTE", "45"))
OUTSIDE_WINDOW_AUTOSTART = os.getenv("WATCHDOG_OUTSIDE_WINDOW_AUTOSTART", "true").lower() == "true"
MONITOR_WEBAPP_URL = os.getenv(
    "MONITOR_WEBAPP_URL",
    "https://script.google.com/macros/s/AKfycbw2u655TMN5MHz4udSKBFW9n69joOofTxPhbxCg6aJFIPqRR70SWJJMxzDSkQVvnNB0_g/exec",
)
RESTART_CLEAN_TIMEOUT_SEC = int(os.getenv("WATCHDOG_RESTART_CLEAN_TIMEOUT_SEC", "420"))
ATTACH_FAILURE_THRESHOLD = int(os.getenv("WATCHDOG_ATTACH_FAILURE_THRESHOLD", "3"))
SERVER_DOWN_RESTART_MIN = int(os.getenv("WATCHDOG_SERVER_DOWN_RESTART_MIN", "10"))
HALF_ALIVE_RESTART_MIN = int(os.getenv("WATCHDOG_HALF_ALIVE_RESTART_MIN", "15"))
OUTSIDE_WINDOW_ATTACH_FAIL_GRACE = int(os.getenv("WATCHDOG_OUTSIDE_WINDOW_ATTACH_FAIL_GRACE", "2"))

LOGIN_URL_TOKENS = (
    "/oms/login.jsp",
    "login.jsp?returl=",
)
LOGGED_IN_URL_TOKENS = (
    "/oms/main.jsp",
    "/oms/estimate_list.jsp",
    "/oms/estimate_doc.jsp",
    "/oms/trans_doc.jsp",
)
APPROVAL_TEXT_PATTERNS = (
    "새로운 기기에서 접속했습니다",
    "기기 승인",
    "관리자 승인",
    "승인 요청",
    "본인 확인",
)
APPROVAL_TITLE_PATTERNS = (
    "기기 승인",
    "본인확인",
    "승인",
)
HEALTH_EXTENSION_FIELDS = (
    "browser_attach_ok",
    "browser_last_attach_ok_at",
    "browser_last_attach_fail_at",
    "browser_consecutive_attach_failures",
    "browser_login_state",
    "browser_approval_state",
    "browser_last_probe_url",
    "browser_last_probe_title",
    "half_alive_since",
    "server_down_since",
)


def now():
    return datetime.now()


def read_text(path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    except Exception:
        return ""


def parse_iso(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        return None


def iso_or_none(dt):
    return dt.isoformat() if isinstance(dt, datetime) else None


def run_command(args, timeout_sec=10):
    try:
        return subprocess.run(args, capture_output=True, text=True, timeout=timeout_sec, check=False)
    except Exception as exc:
        return subprocess.CompletedProcess(args, 1, "", str(exc))


def is_pid_alive(pid_text):
    try:
        pid = int(str(pid_text).strip())
    except Exception:
        return False
    result = run_command(
        ["powershell", "-NoProfile", "-Command", f"if (Get-Process -Id {pid} -ErrorAction SilentlyContinue) {{ exit 0 }} else {{ exit 1 }}"]
    )
    return result.returncode == 0


def listener_pid(port):
    result = run_command(["netstat", "-ano"])
    for line in (result.stdout or "").splitlines():
        if f":{port}" not in line or "LISTENING" not in line.upper():
            continue
        parts = line.split()
        if parts:
            return parts[-1]
    return None


def file_age_minutes(path):
    if not path.exists():
        return None
    modified = datetime.fromtimestamp(path.stat().st_mtime)
    return (now() - modified).total_seconds() / 60


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def ready_stale_items():
    state = load_json(STATE_FILE) or {}
    stale = []
    cutoff = now() - timedelta(minutes=READY_STALE_MIN)
    for key, item in state.get("estimate", {}).items():
        if item.get("status") != "READY":
            continue
        ready_at = parse_iso((item.get("timestamps") or {}).get("READY"))
        if ready_at and ready_at < cutoff:
            stale.append({"key": key, "ready_at": ready_at.isoformat()})
    return stale


def is_recovery_window(current=None):
    current = current or now()
    if current.weekday() >= 6:
        return False
    start = current.replace(hour=RECOVERY_START_HOUR, minute=RECOVERY_START_MINUTE, second=0, microsecond=0)
    end = current.replace(hour=RECOVERY_END_HOUR, minute=RECOVERY_END_MINUTE, second=0, microsecond=0)
    return start <= current <= end


def minutes_since(start_ts, current=None):
    current = current or now()
    if not start_ts:
        return None
    return round((current - start_ts).total_seconds() / 60, 1)


def fetch_json(url, timeout_sec=5):
    with urllib.request.urlopen(url, timeout=timeout_sec) as response:
        return json.loads(response.read().decode("utf-8", errors="replace"))


def probe_edge_devtools_state(port=EDGE_PORT):
    state = {
        "port_open": False,
        "devtools_ok": False,
        "tabs": [],
        "youngrim_tabs": [],
        "error": None,
    }

    owner_pid = listener_pid(port)
    if not owner_pid:
        state["error"] = f"port {port} not listening"
        return state

    state["port_open"] = True
    try:
        version = fetch_json(f"http://127.0.0.1:{port}/json/version", timeout_sec=5)
        tabs = fetch_json(f"http://127.0.0.1:{port}/json/list", timeout_sec=5)
        if not isinstance(tabs, list):
            state["error"] = "json/list did not return a list"
            return state
        browser = str(version.get("Browser") or "")
        websocket_url = str(version.get("webSocketDebuggerUrl") or "")
        if not websocket_url or ("edge" not in browser.lower() and "edg/" not in browser.lower()):
            state["error"] = f"unexpected browser payload: {browser or 'missing Browser'}"
            return state

        state["tabs"] = [
            {"url": str(tab.get("url") or ""), "title": str(tab.get("title") or "")}
            for tab in tabs
        ]
        state["youngrim_tabs"] = [
            tab for tab in state["tabs"]
            if "door.yl.co.kr/oms/" in tab["url"]
        ]
        state["devtools_ok"] = True
        return state
    except Exception as exc:
        state["error"] = str(exc)
        return state


def check_login_status(devtools_state):
    youngrim_urls = [tab["url"] for tab in devtools_state.get("youngrim_tabs", [])]
    login_required = any(any(token in url for token in LOGIN_URL_TOKENS) for url in youngrim_urls)
    logged_in_candidate = any(any(token in url for token in LOGGED_IN_URL_TOKENS) for url in youngrim_urls)

    if login_required and not logged_in_candidate:
        return {
            "login_required": True,
            "browser_login_state": "login_page_only",
            "reason": "only login-style Youngrim tabs found",
        }
    if logged_in_candidate:
        return {
            "login_required": False,
            "browser_login_state": "logged_in_candidate",
            "reason": "main/list/doc Youngrim tab found",
        }
    return {
        "login_required": False,
        "browser_login_state": "unknown",
        "reason": "no decisive Youngrim tab pattern",
    }


def check_approval_status_via_attach(port=EDGE_PORT):
    if not ATTACH_PROBE_SCRIPT.exists():
        return {
            "attach_ok": False,
            "approval_required_suspected": False,
            "login_required": False,
            "probe_url": None,
            "probe_title": None,
            "matched_text": None,
            "error": f"missing {ATTACH_PROBE_SCRIPT.name}",
        }

    result = run_command(
        [
            sys.executable,
            str(ATTACH_PROBE_SCRIPT),
            "--port",
            str(port),
            "--timeout-sec",
            "10",
            "--retries",
            "1",
            "--sleep-sec",
            "1",
            "--require-youngrim",
            "--dump-json",
        ],
        timeout_sec=20,
    )
    if result.returncode != 0:
        return {
            "attach_ok": False,
            "approval_required_suspected": False,
            "login_required": False,
            "probe_url": None,
            "probe_title": None,
            "matched_text": None,
            "error": (result.stdout or result.stderr or "attach probe failed").strip()[:500],
        }

    try:
        payload = json.loads((result.stdout or "").strip())
    except Exception as exc:
        return {
            "attach_ok": False,
            "approval_required_suspected": False,
            "login_required": False,
            "probe_url": None,
            "probe_title": None,
            "matched_text": None,
            "error": f"invalid attach json: {exc}",
        }

    current_url = str(payload.get("current_url") or "")
    title = str(payload.get("title") or "")
    page_text = str(payload.get("page_text_excerpt") or "")

    matched_text = None
    approval_required_suspected = False
    for token in APPROVAL_TEXT_PATTERNS:
        if token in page_text:
            matched_text = token
            approval_required_suspected = True
            break
    if not approval_required_suspected:
        for token in APPROVAL_TITLE_PATTERNS:
            if token in title:
                matched_text = token
                approval_required_suspected = True
                break

    login_required = any(token in current_url for token in LOGIN_URL_TOKENS)

    return {
        "attach_ok": bool(payload.get("ok")),
        "approval_required_suspected": approval_required_suspected,
        "login_required": login_required,
        "probe_url": current_url or None,
        "probe_title": title or None,
        "matched_text": matched_text,
        "error": None,
    }


def is_half_alive(runtime_state):
    return bool(runtime_state.get("edge_listener_pid")) and not bool(runtime_state.get("server_listener_pid"))


def collect_runtime_state():
    current = now()
    today = current.strftime("%Y%m%d")
    app_log = LOGS_DIR / f"app_{today}.json"
    pid_text = read_text(PID_FILE)
    pid_alive = is_pid_alive(pid_text) if pid_text else False
    return {
        "now_ts": current,
        "today": today,
        "app_log_path": str(app_log),
        "app_log_name": app_log.name,
        "app_log_exists": app_log.exists(),
        "app_log_age_min": file_age_minutes(app_log) if app_log.exists() else None,
        "pid_file": pid_text,
        "pid_alive": pid_alive,
        "server_listener_pid": listener_pid(SERVER_PORT),
        "edge_listener_pid": listener_pid(EDGE_PORT),
        "lock_file": read_text(LOCK_FILE),
        "health": load_json(HEALTH_STATUS_FILE) or {},
        "in_recovery_window": is_recovery_window(current),
    }


def merge_runtime_and_browser_state(runtime_state, browser_probe, login_state, approval_state):
    merged = dict(runtime_state)
    merged.update(
        {
            "devtools_ok": browser_probe.get("devtools_ok", False),
            "devtools_error": browser_probe.get("error"),
            "browser_tabs": browser_probe.get("tabs", []),
            "youngrim_tabs": browser_probe.get("youngrim_tabs", []),
            "browser_attach_ok": approval_state.get("attach_ok", False),
            "browser_login_state": login_state.get("browser_login_state", "unknown"),
            "login_required": bool(login_state.get("login_required") or approval_state.get("login_required")),
            "approval_required_suspected": approval_state.get("approval_required_suspected", False),
            "browser_last_probe_url": approval_state.get("probe_url"),
            "browser_last_probe_title": approval_state.get("probe_title"),
            "browser_probe_matched_text": approval_state.get("matched_text"),
            "browser_attach_error": approval_state.get("error"),
        }
    )
    return merged


def update_timers(merged_state):
    previous = merged_state.get("health") if isinstance(merged_state.get("health"), dict) else {}
    current = merged_state["now_ts"]

    previous_server_down_since = parse_iso(previous.get("server_down_since"))
    previous_half_alive_since = parse_iso(previous.get("half_alive_since"))
    previous_attach_failures = int(previous.get("browser_consecutive_attach_failures") or 0)
    previous_attach_ok = previous.get("browser_attach_ok")

    if merged_state.get("server_listener_pid"):
        server_down_since = None
    else:
        server_down_since = previous_server_down_since or current

    if is_half_alive(merged_state):
        half_alive_since = previous_half_alive_since or current
    else:
        half_alive_since = None

    if merged_state.get("browser_attach_ok"):
        attach_failures = 0
        last_attach_ok_at = current
        last_attach_fail_at = parse_iso(previous.get("browser_last_attach_fail_at"))
    else:
        if previous_attach_ok is False:
            attach_failures = previous_attach_failures + 1
        else:
            attach_failures = 1
        last_attach_ok_at = parse_iso(previous.get("browser_last_attach_ok_at"))
        last_attach_fail_at = current

    merged_state["server_down_since"] = server_down_since
    merged_state["half_alive_since"] = half_alive_since
    merged_state["server_down_minutes"] = minutes_since(server_down_since, current)
    merged_state["half_alive_minutes"] = minutes_since(half_alive_since, current)
    merged_state["browser_consecutive_attach_failures"] = attach_failures
    merged_state["browser_last_attach_ok_at"] = last_attach_ok_at
    merged_state["browser_last_attach_fail_at"] = last_attach_fail_at


def persist_health_extensions(merged_state):
    base = load_json(HEALTH_STATUS_FILE) or {}
    base.update(
        {
            "browser_attach_ok": merged_state.get("browser_attach_ok"),
            "browser_last_attach_ok_at": iso_or_none(merged_state.get("browser_last_attach_ok_at")),
            "browser_last_attach_fail_at": iso_or_none(merged_state.get("browser_last_attach_fail_at")),
            "browser_consecutive_attach_failures": merged_state.get("browser_consecutive_attach_failures"),
            "browser_login_state": merged_state.get("browser_login_state"),
            "browser_approval_state": "suspected" if merged_state.get("approval_required_suspected") else "clear",
            "browser_last_probe_url": merged_state.get("browser_last_probe_url"),
            "browser_last_probe_title": merged_state.get("browser_last_probe_title"),
            "half_alive_since": iso_or_none(merged_state.get("half_alive_since")),
            "server_down_since": iso_or_none(merged_state.get("server_down_since")),
        }
    )
    HEALTH_STATUS_FILE.write_text(json.dumps(base, ensure_ascii=False, indent=2), encoding="utf-8")


def collect_failures_from_merged_state(merged_state):
    failures = []
    pid_text = merged_state.get("pid_file")
    server_listener = merged_state.get("server_listener_pid")
    edge_listener = merged_state.get("edge_listener_pid")
    app_log_age = merged_state.get("app_log_age_min")
    health = merged_state.get("health") if isinstance(merged_state.get("health"), dict) else {}

    if not pid_text:
        failures.append("run_server.pid missing")
    elif not merged_state.get("pid_alive"):
        failures.append(f"run_server.pid stale: pid={pid_text}")

    if not server_listener:
        failures.append(f"server port {SERVER_PORT} not listening")

    if is_half_alive(merged_state):
        failures.append(f"half-alive state: Edge port {EDGE_PORT} pid={edge_listener}, server port {SERVER_PORT} down")

    lock_text = merged_state.get("lock_file")
    if lock_text and not is_pid_alive(lock_text):
        failures.append(f"v11.lock stale: pid={lock_text}")

    if not merged_state.get("app_log_exists"):
        failures.append(f"missing app log: {merged_state['app_log_name']}")
    elif app_log_age is not None and app_log_age > APP_LOG_STALE_MIN:
        failures.append(f"app log stale: {merged_state['app_log_name']} age={app_log_age:.1f}min")

    health_time = parse_iso(health.get("timestamp"))
    if not health:
        if not server_listener or app_log_age is None or app_log_age > APP_LOG_STALE_MIN:
            failures.append("health_status.json missing or invalid")
    elif health_time and merged_state["now_ts"] - health_time > timedelta(minutes=HEALTH_STALE_MIN):
        age_min = (merged_state["now_ts"] - health_time).total_seconds() / 60
        failures.append(f"health_status stale: age={age_min:.1f}min status={health.get('status')}")

    if health.get("status") in {"upload_started", "upload_error"}:
        remaining_ready = int(health.get("remaining_ready_count") or health.get("ready_count") or 0)
        if remaining_ready > 0:
            failures.append(f"upload not completed: status={health.get('status')} remaining_ready={remaining_ready}")

    for page in health.get("download_pages") or []:
        actionable = int(page.get("actionable_rows") or 0)
        accounted = int(page.get("downloaded") or 0) + int(page.get("skipped_existing") or 0) + int(page.get("missing_detail_url") or 0)
        if actionable > accounted:
            failures.append(f"unaccounted actionable rows: url={page.get('url')} actionable={actionable} accounted={accounted}")

    if merged_state.get("login_required"):
        failures.append("login_required: Youngrim browser is on login.jsp/returl")

    if merged_state.get("approval_required_suspected"):
        failures.append("approval_required_suspected: possible new-device/admin approval page")

    if edge_listener and not merged_state.get("browser_attach_ok"):
        failures.append(f"edge attach probe failed: port {EDGE_PORT} unreachable for Selenium attach")

    stale_ready = ready_stale_items()
    if stale_ready:
        sample = ", ".join(item["key"] for item in stale_ready[:5])
        failures.append(f"READY files stale: count={len(stale_ready)} sample={sample}")

    return failures


def should_block_force_restart(login_state, approval_state):
    if login_state.get("login_required"):
        return True, "login_required"
    if approval_state.get("approval_required_suspected"):
        return True, "approval_required_suspected"
    return False, ""


def should_force_restart(merged_state):
    if merged_state.get("browser_consecutive_attach_failures", 0) < ATTACH_FAILURE_THRESHOLD:
        return False, "attach_failures_below_threshold"
    if (merged_state.get("server_down_minutes") or 0) < SERVER_DOWN_RESTART_MIN:
        return False, "server_down_too_short"
    if is_half_alive(merged_state) and (merged_state.get("half_alive_minutes") or 0) < HALF_ALIVE_RESTART_MIN:
        return False, "half_alive_too_short"
    return True, "force_restart_threshold_met"


def is_recoverable_failure(failures):
    prefixes = (
        "run_server.pid missing",
        "run_server.pid stale",
        f"server port {SERVER_PORT} not listening",
        "half-alive state",
        "v11.lock stale",
        "missing app log",
        "health_status stale",
        "READY files stale",
        "upload not completed",
        "edge attach probe failed",
    )
    return any(item.startswith(prefixes) for item in failures)


def recovery_cooldown_active():
    state = load_json(WATCHDOG_RECOVERY_STATE_FILE) or {}
    last_attempt = parse_iso(state.get("last_attempt_at"))
    if not last_attempt:
        return False
    return now() - last_attempt < timedelta(minutes=RECOVERY_COOLDOWN_MIN)


def decide_recovery_action(merged_state, failures, block_force_restart, block_reason):
    if not AUTO_RECOVER:
        return {"action": "alert_only", "reason": "disabled"}
    if not is_recoverable_failure(failures):
        return {"action": "alert_only", "reason": "not_recoverable"}
    if recovery_cooldown_active():
        return {"action": "alert_only", "reason": "cooldown"}
    if block_force_restart:
        return {"action": "alert_only", "reason": block_reason}

    if merged_state.get("server_listener_pid") and merged_state.get("browser_attach_ok"):
        return {"action": "noop", "reason": "healthy"}

    if not merged_state.get("in_recovery_window"):
        if merged_state.get("server_listener_pid") and not merged_state.get("browser_attach_ok"):
            if merged_state.get("browser_consecutive_attach_failures", 0) <= OUTSIDE_WINDOW_ATTACH_FAIL_GRACE:
                return {"action": "noop_with_counter", "reason": "outside_window_attach_fail_grace"}
            return {"action": "alert_only", "reason": "outside_window_attach_fail_persistent"}

        if OUTSIDE_WINDOW_AUTOSTART and not merged_state.get("server_listener_pid"):
            return {"action": "outside_window_autostart", "reason": "outside_window_server_down"}
        return {"action": "alert_only", "reason": "outside_window_no_safe_action"}

    if not merged_state.get("server_listener_pid") and merged_state.get("browser_attach_ok"):
        return {"action": "restart_server_only", "reason": "edge_ok_server_down"}

    allow_force_restart, force_reason = should_force_restart(merged_state)
    if allow_force_restart:
        return {"action": "force_restart_edge", "reason": force_reason}

    if is_half_alive(merged_state):
        return {"action": "full_restart_clean", "reason": "half_alive_recoverable"}

    if not merged_state.get("server_listener_pid"):
        return {"action": "full_restart_clean", "reason": "server_down_recoverable"}

    return {"action": "alert_only", "reason": "unclassified_failure"}


def save_recovery_state(ok, reason, returncode=None):
    WATCHDOG_RECOVERY_STATE_FILE.write_text(
        json.dumps(
            {
                "last_attempt_at": now().isoformat(),
                "ok": ok,
                "reason": reason,
                "returncode": returncode,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def attempt_recovery(decision):
    reason = decision["reason"]
    action = decision["action"]
    append_log(f"recovery_start action={action} reason={reason}")

    if action in {"outside_window_autostart", "restart_server_only"}:
        fallback = run_command(["C:\\Windows\\System32\\schtasks.exe", "/Run", "/TN", "V10_AutoStart"])
        append_log(
            f"{action} returncode={fallback.returncode} stdout={fallback.stdout[-500:]} stderr={fallback.stderr[-500:]}"
        )
        ok = fallback.returncode == 0
        save_recovery_state(ok, reason, fallback.returncode)
        return ok

    if action in {"full_restart_clean", "force_restart_edge"}:
        result = run_command(["cmd", "/c", str(RESTART_CLEAN_BAT)], timeout_sec=RESTART_CLEAN_TIMEOUT_SEC)
        append_log(f"recovery_done returncode={result.returncode} stdout={result.stdout[-500:]} stderr={result.stderr[-500:]}")
        if result.returncode == 0:
            save_recovery_state(True, reason, result.returncode)
            return True

        fallback = run_command(["C:\\Windows\\System32\\schtasks.exe", "/Run", "/TN", "V10_AutoStart"])
        append_log(
            "recovery_fallback_autostart "
            f"returncode={fallback.returncode} stdout={fallback.stdout[-500:]} stderr={fallback.stderr[-500:]}"
        )
        ok = fallback.returncode == 0
        save_recovery_state(ok, f"{reason}; fallback_autostart", fallback.returncode)
        return ok

    save_recovery_state(False, reason, None)
    return False


def should_send_alert(signature):
    state = load_json(WATCHDOG_STATE_FILE) or {}
    last_signature = state.get("signature")
    last_sent = parse_iso(state.get("last_sent_at"))
    if signature != last_signature:
        return True
    if not last_sent:
        return True
    return now() - last_sent >= timedelta(minutes=ALERT_COOLDOWN_MIN)


def save_alert_state(signature):
    WATCHDOG_STATE_FILE.write_text(
        json.dumps({"signature": signature, "last_sent_at": now().isoformat()}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def send_alert(message):
    if not MONITOR_WEBAPP_URL:
        return False, "MONITOR_WEBAPP_URL empty"
    data = urllib.parse.urlencode(
        {"system": "youngrim_automation", "status": "abnormal", "message": message}
    ).encode("utf-8")
    try:
        with urllib.request.urlopen(MONITOR_WEBAPP_URL, data=data, timeout=20) as response:
            return True, response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        return False, str(exc)


def send_email_alert(message, failures, merged_state):
    if not ALERT_EMAIL_SCRIPT.exists():
        return False, f"missing {ALERT_EMAIL_SCRIPT.name}"

    subject = "[Youngrim Automation] Abnormal state"
    body_lines = [
        "Watchdog abnormal-state decision",
        "",
        message,
        "",
        f"last_health_status={merged_state.get('health', {}).get('status')}",
        f"server_listener_pid={merged_state.get('server_listener_pid')}",
        f"edge_listener_pid={merged_state.get('edge_listener_pid')}",
        f"pid_file={merged_state.get('pid_file')}",
        f"app_log_age_min={merged_state.get('app_log_age_min')}",
        f"browser_login_state={merged_state.get('browser_login_state')}",
        f"approval_required_suspected={merged_state.get('approval_required_suspected')}",
        f"browser_last_probe_url={merged_state.get('browser_last_probe_url')}",
        f"browser_last_probe_title={merged_state.get('browser_last_probe_title')}",
        "",
        "failures:",
        *[f"- {item}" for item in failures],
    ]
    body = "\n".join(body_lines)[:4000]

    result = run_command(
        [
            sys.executable,
            str(ALERT_EMAIL_SCRIPT),
            "--system",
            "Youngrim Automation",
            "--status",
            "Abnormal",
            "--subject",
            subject,
            "--message",
            body,
        ]
    )
    detail = f"returncode={result.returncode} stdout={result.stdout[-500:]} stderr={result.stderr[-500:]}"
    return result.returncode == 0, detail


def append_log(line):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    path = LOGS_DIR / f"watchdog_{now().strftime('%Y%m%d')}.log"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(f"[{now().isoformat(timespec='seconds')}] {line}\n")


def main():
    parser = argparse.ArgumentParser(description="Youngrim automation watchdog")
    parser.add_argument("--no-alert", action="store_true", help="Only print/check, do not send alert")
    args = parser.parse_args()

    runtime_state = collect_runtime_state()
    browser_probe = probe_edge_devtools_state()
    login_state = check_login_status(browser_probe)
    approval_state = check_approval_status_via_attach() if runtime_state.get("edge_listener_pid") else {
        "attach_ok": False,
        "approval_required_suspected": False,
        "login_required": False,
        "probe_url": None,
        "probe_title": None,
        "matched_text": None,
        "error": "port not listening",
    }

    merged_state = merge_runtime_and_browser_state(runtime_state, browser_probe, login_state, approval_state)
    update_timers(merged_state)
    persist_health_extensions(merged_state)
    failures = collect_failures_from_merged_state(merged_state)

    context = {
        "pid_file": merged_state.get("pid_file"),
        "pid_alive": merged_state.get("pid_alive"),
        "server_listener_pid": merged_state.get("server_listener_pid"),
        "edge_listener_pid": merged_state.get("edge_listener_pid"),
        "app_log": merged_state.get("app_log_path"),
        "app_log_age_min": merged_state.get("app_log_age_min"),
        "health_status": merged_state.get("health", {}).get("status"),
        "browser_login_state": merged_state.get("browser_login_state"),
        "approval_required_suspected": merged_state.get("approval_required_suspected"),
        "browser_attach_ok": merged_state.get("browser_attach_ok"),
        "browser_consecutive_attach_failures": merged_state.get("browser_consecutive_attach_failures"),
        "server_down_minutes": merged_state.get("server_down_minutes"),
        "half_alive_minutes": merged_state.get("half_alive_minutes"),
        "browser_last_probe_url": merged_state.get("browser_last_probe_url"),
        "browser_last_probe_title": merged_state.get("browser_last_probe_title"),
    }

    if not failures:
        message = "OK: watchdog check passed"
        append_log(message)
        print(message)
        print(json.dumps(context, ensure_ascii=False, indent=2))
        return 0

    message = " | ".join(failures)
    signature = "\n".join(sorted(failures))
    append_log(f"FAIL: {message}")
    print("FAIL")
    print(message)
    print(json.dumps(context, ensure_ascii=False, indent=2))

    block_force_restart, block_reason = should_block_force_restart(login_state, approval_state)
    decision = decide_recovery_action(merged_state, failures, block_force_restart, block_reason)

    if args.no_alert:
        append_log("alert_and_recovery_skipped=no_alert")
        append_log(f"recovery_skipped reason={decision['reason']}")
        return 2

    should_alert = decision["action"] != "noop_with_counter" and should_send_alert(signature)
    if should_alert:
        ok, response = send_alert(message[:1500])
        append_log(f"alert_sent={ok} response={response[:500]}")
        mail_ok, mail_detail = send_email_alert(message[:1500], failures, merged_state)
        append_log(f"alert_email_sent={mail_ok} response={mail_detail[:500]}")
        save_alert_state(signature)
    elif decision["action"] == "noop_with_counter":
        append_log("alert_suppressed=outside_window_attach_fail_grace")
    else:
        append_log("alert_suppressed=cooldown")

    if decision["action"] in {"outside_window_autostart", "restart_server_only", "full_restart_clean", "force_restart_edge"}:
        recovery_ok = attempt_recovery(decision)
        print(f"recovery_attempted={recovery_ok}")
    elif decision["action"] not in {"noop", "noop_with_counter"}:
        append_log(f"recovery_skipped reason={decision['reason']}")

    return 2


if __name__ == "__main__":
    sys.exit(main())
