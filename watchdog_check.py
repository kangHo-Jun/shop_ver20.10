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
EDGE_PID_FILE = LOGS_DIR / "edge_9333.pid"
HEALTH_STATUS_FILE = LOGS_DIR / "health_status.json"
WATCHDOG_STATE_FILE = LOGS_DIR / "watchdog_alert_state.json"
WATCHDOG_RECOVERY_STATE_FILE = LOGS_DIR / "watchdog_recovery_state.json"
RESTART_CLEAN_BAT = BASE_DIR / "RESTART_CLEAN.bat"

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
RESTART_CLEAN_TIMEOUT_SEC = int(os.getenv("WATCHDOG_RESTART_CLEAN_TIMEOUT_SEC", "180"))


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


def run_command(args):
    try:
        return subprocess.run(args, capture_output=True, text=True, timeout=10, check=False)
    except Exception as exc:
        return subprocess.CompletedProcess(args, 1, "", str(exc))


def run_command_with_timeout(args, timeout_sec):
    try:
        return subprocess.run(args, capture_output=True, text=True, timeout=timeout_sec, check=False)
    except Exception as exc:
        return subprocess.CompletedProcess(args, 1, "", str(exc))


def is_pid_alive(pid_text):
    try:
        pid = int(str(pid_text).strip())
    except Exception:
        return False
    result = run_command(["powershell", "-NoProfile", "-Command", f"if (Get-Process -Id {pid} -ErrorAction SilentlyContinue) {{ exit 0 }} else {{ exit 1 }}"])
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


def collect_failures():
    failures = []
    today = now().strftime("%Y%m%d")
    app_log = LOGS_DIR / f"app_{today}.json"

    pid_text = read_text(PID_FILE)
    pid_alive = is_pid_alive(pid_text) if pid_text else False
    server_listener = listener_pid(SERVER_PORT)
    edge_listener = listener_pid(EDGE_PORT)
    app_log_age = None

    if not pid_text:
        failures.append("run_server.pid missing")
    elif not pid_alive:
        failures.append(f"run_server.pid stale: pid={pid_text}")

    if not server_listener:
        failures.append(f"server port {SERVER_PORT} not listening")

    if edge_listener and not server_listener:
        failures.append(f"half-alive state: Edge port {EDGE_PORT} pid={edge_listener}, server port {SERVER_PORT} down")

    lock_text = read_text(LOCK_FILE)
    if lock_text and not is_pid_alive(lock_text):
        failures.append(f"v11.lock stale: pid={lock_text}")

    if not app_log.exists():
        failures.append(f"missing app log: {app_log.name}")
    else:
        app_log_age = file_age_minutes(app_log)
        if app_log_age is not None and app_log_age > APP_LOG_STALE_MIN:
            failures.append(f"app log stale: {app_log.name} age={app_log_age:.1f}min")

    health = load_json(HEALTH_STATUS_FILE)
    if not health:
        if not server_listener or app_log_age is None or app_log_age > APP_LOG_STALE_MIN:
            failures.append("health_status.json missing or invalid")
    else:
        health_time = parse_iso(health.get("timestamp"))
        if health_time and now() - health_time > timedelta(minutes=HEALTH_STALE_MIN):
            failures.append(f"health_status stale: age={(now() - health_time).total_seconds() / 60:.1f}min status={health.get('status')}")

        if health.get("status") in {"upload_started", "upload_error"}:
            remaining_ready = int(health.get("remaining_ready_count") or health.get("ready_count") or 0)
            if remaining_ready > 0:
                failures.append(f"upload not completed: status={health.get('status')} remaining_ready={remaining_ready}")

        for page in health.get("download_pages") or []:
            actionable = int(page.get("actionable_rows") or 0)
            accounted = int(page.get("downloaded") or 0) + int(page.get("skipped_existing") or 0) + int(page.get("missing_detail_url") or 0)
            if actionable > accounted:
                failures.append(
                    f"unaccounted actionable rows: url={page.get('url')} actionable={actionable} accounted={accounted}"
                )

    stale_ready = ready_stale_items()
    if stale_ready:
        sample = ", ".join(item["key"] for item in stale_ready[:5])
        failures.append(f"READY files stale: count={len(stale_ready)} sample={sample}")

    context = {
        "pid_file": pid_text,
        "pid_alive": pid_alive,
        "server_listener_pid": server_listener,
        "edge_listener_pid": edge_listener,
        "app_log": str(app_log),
        "app_log_age_min": app_log_age,
        "health_status": health.get("status") if isinstance(health, dict) else None,
    }
    return failures, context


def is_recovery_window():
    current = now()
    if current.weekday() >= 6:
        return False
    start = current.replace(hour=RECOVERY_START_HOUR, minute=RECOVERY_START_MINUTE, second=0, microsecond=0)
    end = current.replace(hour=RECOVERY_END_HOUR, minute=RECOVERY_END_MINUTE, second=0, microsecond=0)
    return start <= current <= end


def is_recoverable_failure(failures):
    return any(
        item.startswith("run_server.pid missing")
        or item.startswith("run_server.pid stale")
        or item.startswith(f"server port {SERVER_PORT} not listening")
        or item.startswith("half-alive state")
        or item.startswith("v11.lock stale")
        or item.startswith("missing app log")
        or item.startswith("health_status stale")
        or item.startswith("READY files stale")
        or item.startswith("upload not completed")
        for item in failures
    )


def is_outside_window_autostart_candidate(failures, context):
    if not OUTSIDE_WINDOW_AUTOSTART:
        return False
    if context.get("server_listener_pid"):
        return False
    return any(
        item.startswith("run_server.pid missing")
        or item.startswith("run_server.pid stale")
        or item.startswith(f"server port {SERVER_PORT} not listening")
        or item.startswith("half-alive state")
        or item.startswith("missing app log")
        for item in failures
    )


def should_attempt_recovery(failures, context):
    if not AUTO_RECOVER:
        return False, "disabled"
    if not is_recoverable_failure(failures):
        return False, "not_recoverable"

    state = load_json(WATCHDOG_RECOVERY_STATE_FILE) or {}
    last_attempt = parse_iso(state.get("last_attempt_at"))
    if last_attempt and now() - last_attempt < timedelta(minutes=RECOVERY_COOLDOWN_MIN):
        return False, "cooldown"

    if not is_recovery_window():
        if is_outside_window_autostart_candidate(failures, context):
            return True, "outside_window_autostart"
        return False, "outside_window"

    if not RESTART_CLEAN_BAT.exists():
        return False, "missing_RESTART_CLEAN.bat"

    if context.get("server_listener_pid") and context.get("pid_alive"):
        only_alert_failures = [
            item for item in failures
            if not item.startswith("app log stale")
            and not item.startswith("health_status stale")
            and not item.startswith("READY files stale")
            and not item.startswith("upload not completed")
        ]
        if not only_alert_failures:
            return False, "server_alive"

    return True, "recoverable"


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


def attempt_recovery(reason):
    append_log(f"recovery_start reason={reason}")
    if reason == "outside_window_autostart":
        fallback = run_command(["C:\\Windows\\System32\\schtasks.exe", "/Run", "/TN", "V10_AutoStart"])
        append_log(
            "recovery_outside_window_autostart "
            f"returncode={fallback.returncode} stdout={fallback.stdout[-500:]} stderr={fallback.stderr[-500:]}"
        )
        ok = fallback.returncode == 0
        save_recovery_state(ok, reason, fallback.returncode)
        return ok

    result = run_command_with_timeout(["cmd", "/c", str(RESTART_CLEAN_BAT)], RESTART_CLEAN_TIMEOUT_SEC)
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
    data = urllib.parse.urlencode({
        "system": "매장",
        "status": "실패",
        "message": message,
    }).encode("utf-8")
    try:
        with urllib.request.urlopen(MONITOR_WEBAPP_URL, data=data, timeout=20) as response:
            return True, response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        return False, str(exc)


def append_log(line):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    path = LOGS_DIR / f"watchdog_{now().strftime('%Y%m%d')}.log"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(f"[{now().isoformat(timespec='seconds')}] {line}\n")


def main():
    parser = argparse.ArgumentParser(description="Shop automation watchdog")
    parser.add_argument("--no-alert", action="store_true", help="Only print/check, do not send alert")
    args = parser.parse_args()

    failures, context = collect_failures()
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

    if args.no_alert:
        append_log("alert_and_recovery_skipped=no_alert")
        return 2

    recover, recovery_reason = should_attempt_recovery(failures, context)
    if recover:
        recovery_ok = attempt_recovery(recovery_reason)
        print(f"recovery_attempted={recovery_ok}")
    else:
        append_log(f"recovery_skipped reason={recovery_reason}")

    if should_send_alert(signature):
        ok, response = send_alert(message[:1500])
        append_log(f"alert_sent={ok} response={response[:500]}")
        save_alert_state(signature)
    else:
        append_log("alert_suppressed=cooldown")

    return 2


if __name__ == "__main__":
    sys.exit(main())
