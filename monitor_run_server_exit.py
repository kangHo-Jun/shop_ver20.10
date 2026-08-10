import json
import subprocess
import time
from datetime import datetime, timedelta
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
PID_FILE = LOGS_DIR / "run_server.pid"
WATCH_LOG = LOGS_DIR / "run_server_exit_watch.log"
SNAPSHOT_DIR = LOGS_DIR / "run_server_exit_snapshots"
POLL_SEC = 60


def now():
    return datetime.now()


def append_log(message):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    with WATCH_LOG.open("a", encoding="utf-8") as handle:
        handle.write(f"[{now().isoformat(timespec='seconds')}] {message}\n")


def run_command(args, timeout=30):
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=timeout, check=False)
        return {
            "args": args,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except Exception as exc:
        return {
            "args": args,
            "returncode": -1,
            "stdout": "",
            "stderr": str(exc),
        }


def get_pid_text():
    try:
        return PID_FILE.read_text(encoding="utf-8").strip()
    except Exception:
        return ""


def pid_alive(pid_text):
    try:
        pid = int(str(pid_text).strip())
    except Exception:
        return False
    result = run_command(
        [
            "powershell",
            "-NoProfile",
            "-Command",
            f"if (Get-Process -Id {pid} -ErrorAction SilentlyContinue) {{ exit 0 }} else {{ exit 1 }}",
        ],
        timeout=10,
    )
    return result["returncode"] == 0


def snapshot(pid_text, reason):
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = now().strftime("%Y%m%d_%H%M%S")
    out_path = SNAPSHOT_DIR / f"run_server_exit_{stamp}.json"
    start = (now() - timedelta(minutes=20)).isoformat()
    end = now().isoformat()
    payload = {
        "captured_at": now().isoformat(),
        "reason": reason,
        "pid_file_value": pid_text,
        "pid_file_exists": PID_FILE.exists(),
        "commands": {
            "tasklist_python": run_command(["tasklist", "/FI", "IMAGENAME eq python.exe", "/FO", "LIST"], timeout=15),
            "tasklist_all": run_command(["tasklist", "/V"], timeout=20),
            "netstat_5081_9333": run_command(
                [
                    "powershell",
                    "-NoProfile",
                    "-Command",
                    "netstat -ano | Select-String '127.0.0.1:5081|127.0.0.1:9333'",
                ],
                timeout=15,
            ),
            "system_events_recent": run_command(
                [
                    "powershell",
                    "-NoProfile",
                    "-Command",
                    (
                        f"$start=[datetime]'{start}'; $end=[datetime]'{end}'; "
                        "Get-WinEvent -FilterHashtable @{LogName='System'; StartTime=$start; EndTime=$end} "
                        "-ErrorAction SilentlyContinue | "
                        "Where-Object { $_.Id -in 1,42,107,1074,6005,6006,6008 -or $_.ProviderName -match 'Kernel-Power|Power-Troubleshooter|User32|Winlogon' } | "
                        "Select-Object TimeCreated, Id, ProviderName, LevelDisplayName, Message | Format-List"
                    ),
                ],
                timeout=20,
            ),
            "application_events_recent": run_command(
                [
                    "powershell",
                    "-NoProfile",
                    "-Command",
                    (
                        f"$start=[datetime]'{start}'; $end=[datetime]'{end}'; "
                        "Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=$start; EndTime=$end} "
                        "-ErrorAction SilentlyContinue | "
                        f"Where-Object {{ $_.Message -match '{pid_text}|python.exe|pythonw.exe' -or $_.ProviderName -match 'Application Error|Windows Error Reporting' }} | "
                        "Select-Object TimeCreated, Id, ProviderName, LevelDisplayName, Message | Format-List"
                    ),
                ],
                timeout=20,
            ),
            "tasks_v10": run_command(
                [
                    "powershell",
                    "-NoProfile",
                    "-Command",
                    "schtasks /Query /FO LIST /V | Select-String 'TaskName:|V10_|ERP 자동화 일일 재시작' -Context 0,8",
                ],
                timeout=20,
            ),
        },
    }
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    append_log(f"snapshot_saved path={out_path.name} reason={reason}")


def main():
    append_log("monitor_started")
    watched_pid = ""
    watched_alive = False

    while True:
        pid_text = get_pid_text()

        if pid_text and pid_text != watched_pid:
            watched_pid = pid_text
            watched_alive = pid_alive(pid_text)
            append_log(f"watching_pid pid={watched_pid} alive={watched_alive}")

        if watched_pid:
            alive = pid_alive(watched_pid)
            if watched_alive and not alive:
                append_log(f"pid_disappeared pid={watched_pid}")
                snapshot(watched_pid, "pid_disappeared")
                watched_pid = ""
                watched_alive = False
            else:
                watched_alive = alive

        time.sleep(POLL_SEC)


if __name__ == "__main__":
    main()
