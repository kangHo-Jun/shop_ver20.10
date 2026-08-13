import argparse
import json
import re
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService


def _find_local_msedgedriver():
    cache_root = Path.home() / ".cache" / "selenium" / "msedgedriver" / "win64"
    if not cache_root.exists():
        return None

    candidates = sorted(cache_root.glob("*/msedgedriver.exe"))
    if not candidates:
        return None
    return candidates[-1]


def _create_driver(options):
    try:
        return webdriver.Edge(options=options)
    except Exception as exc:
        local_driver = _find_local_msedgedriver()
        if not local_driver:
            raise exc

        service = EdgeService(executable_path=str(local_driver))
        return webdriver.Edge(service=service, options=options)


def _strip_html(text):
    no_script = re.sub(r"(?is)<(script|style).*?>.*?</\\1>", " ", text)
    no_tags = re.sub(r"(?s)<[^>]+>", " ", no_script)
    collapsed = re.sub(r"\\s+", " ", no_tags).strip()
    return collapsed


def probe_details(port, timeout_sec, require_youngrim):
    last_error = None
    driver = None
    for debugger_host in ("127.0.0.1", "localhost", "[::1]"):
        options = EdgeOptions()
        options.add_experimental_option("debuggerAddress", f"{debugger_host}:{port}")
        try:
            driver = _create_driver(options)
            break
        except Exception as exc:
            last_error = exc

    if driver is None:
        raise last_error

    try:
        driver.set_page_load_timeout(timeout_sec)
        driver.set_script_timeout(timeout_sec)

        current_url = str(driver.current_url or "")
        title = str(driver.title or "")
        page_source = str(driver.page_source or "")
        page_text_excerpt = _strip_html(page_source)[:2000]

        if require_youngrim and "door.yl.co.kr/oms/" not in current_url:
            return {
                "ok": False,
                "message": f"attached but unexpected url={current_url or 'blank'} title={title or 'blank'}",
                "current_url": current_url or None,
                "title": title or None,
                "page_text_excerpt": page_text_excerpt,
            }

        return {
            "ok": True,
            "message": f"attach ok url={current_url or 'blank'} title={title or 'blank'}",
            "current_url": current_url or None,
            "title": title or None,
            "page_text_excerpt": page_text_excerpt,
        }
    finally:
        try:
            driver.quit()
        except Exception:
            pass


def probe(port, timeout_sec, require_youngrim):
    details = probe_details(port, timeout_sec, require_youngrim)
    return details["ok"], details["message"]


def main():
    parser = argparse.ArgumentParser(description="Probe Selenium attach against an existing Edge debugger session")
    parser.add_argument("--port", type=int, default=9333)
    parser.add_argument("--timeout-sec", type=float, default=15.0)
    parser.add_argument("--retries", type=int, default=1)
    parser.add_argument("--sleep-sec", type=float, default=2.0)
    parser.add_argument("--require-youngrim", action="store_true")
    parser.add_argument("--dump-json", action="store_true")
    args = parser.parse_args()

    retries = max(1, args.retries)
    last_error = "unknown"
    last_payload = None

    for attempt in range(1, retries + 1):
        try:
            payload = probe_details(args.port, args.timeout_sec, args.require_youngrim)
            payload["attempt"] = attempt
            last_payload = payload
            if payload["ok"]:
                if args.dump_json:
                    print(json.dumps(payload, ensure_ascii=False))
                else:
                    print(f"OK attempt={attempt} {payload['message']}")
                return 0
            last_error = payload["message"]
        except Exception as exc:
            last_error = str(exc)
            last_payload = {"ok": False, "attempt": attempt, "error": last_error}

        if attempt < retries:
            time.sleep(args.sleep_sec)

    if args.dump_json:
        payload = last_payload or {"ok": False, "error": last_error}
        payload.setdefault("ok", False)
        payload.setdefault("message", last_error)
        print(json.dumps(payload, ensure_ascii=False))
    else:
        print(f"FAIL {last_error}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
