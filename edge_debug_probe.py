import argparse
import json
import socket
import sys
import time
import urllib.error
import urllib.request


def port_open(host, port):
    last_error = None
    for family, socktype, proto, _, sockaddr in socket.getaddrinfo(host, port, 0, socket.SOCK_STREAM):
        sock = socket.socket(family, socktype, proto)
        sock.settimeout(2)
        try:
            if sock.connect_ex(sockaddr) == 0:
                return True
        except OSError as exc:
            last_error = exc
        finally:
            sock.close()
    return False


def fetch_json(url, timeout_sec):
    with urllib.request.urlopen(url, timeout=timeout_sec) as response:
        return json.loads(response.read().decode("utf-8", errors="replace"))


def probe(host, port, timeout_sec, require_youngrim):
    if not port_open(host, port):
        return False, f"port {port} not open"

    version = fetch_json(f"http://{host}:{port}/json/version", timeout_sec)
    browser = str(version.get("Browser") or "")
    websocket_url = str(version.get("webSocketDebuggerUrl") or "")
    browser_lower = browser.lower()
    if "edge" not in browser_lower and "edg/" not in browser_lower:
        return False, f"unexpected browser payload: {browser or 'missing Browser'}"
    if not websocket_url:
        return False, "missing webSocketDebuggerUrl"

    tabs = fetch_json(f"http://{host}:{port}/json/list", timeout_sec)
    if not isinstance(tabs, list):
        return False, "json/list did not return a tab list"

    if require_youngrim:
        youngrim_tabs = [
            tab for tab in tabs
            if "door.yl.co.kr/oms/" in str(tab.get("url") or "")
        ]
        if not youngrim_tabs:
            return False, "no Youngrim OMS tab found in json/list"

    return True, f"devtools ok tabs={len(tabs)}"


def main():
    parser = argparse.ArgumentParser(description="Probe Edge remote debugging health")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9333)
    parser.add_argument("--timeout-sec", type=float, default=5.0)
    parser.add_argument("--retries", type=int, default=1)
    parser.add_argument("--sleep-sec", type=float, default=1.0)
    parser.add_argument("--require-youngrim", action="store_true")
    args = parser.parse_args()

    retries = max(1, args.retries)
    last_error = "unknown"

    for attempt in range(1, retries + 1):
        try:
            ok, message = probe(args.host, args.port, args.timeout_sec, args.require_youngrim)
            if ok:
                print(f"OK attempt={attempt} {message}")
                return 0
            last_error = message
        except (TimeoutError, urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, OSError) as exc:
            last_error = str(exc)
        except Exception as exc:
            last_error = str(exc)

        if attempt < retries:
            time.sleep(args.sleep_sec)

    print(f"FAIL {last_error}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
