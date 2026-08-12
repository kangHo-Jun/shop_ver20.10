import argparse
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


def probe(port, timeout_sec, require_youngrim):
    options = EdgeOptions()
    options.add_experimental_option("debuggerAddress", f"127.0.0.1:{port}")

    driver = _create_driver(options)
    try:
        driver.set_page_load_timeout(timeout_sec)
        driver.set_script_timeout(timeout_sec)

        current_url = str(driver.current_url or "")
        title = str(driver.title or "")

        if require_youngrim and "door.yl.co.kr/oms/" not in current_url:
            return False, f"attached but unexpected url={current_url or 'blank'} title={title or 'blank'}"

        return True, f"attach ok url={current_url or 'blank'} title={title or 'blank'}"
    finally:
        try:
            driver.quit()
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="Probe Selenium attach against an existing Edge debugger session")
    parser.add_argument("--port", type=int, default=9333)
    parser.add_argument("--timeout-sec", type=float, default=15.0)
    parser.add_argument("--retries", type=int, default=1)
    parser.add_argument("--sleep-sec", type=float, default=2.0)
    parser.add_argument("--require-youngrim", action="store_true")
    args = parser.parse_args()

    retries = max(1, args.retries)
    last_error = "unknown"

    for attempt in range(1, retries + 1):
        try:
            ok, message = probe(args.port, args.timeout_sec, args.require_youngrim)
            if ok:
                print(f"OK attempt={attempt} {message}")
                return 0
            last_error = message
        except Exception as exc:
            last_error = str(exc)

        if attempt < retries:
            time.sleep(args.sleep_sec)

    print(f"FAIL {last_error}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
