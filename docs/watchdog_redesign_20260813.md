# Watchdog Redesign Draft (2026-08-13)

## 목적

- 로그인된 기존 영림 세션을 최대한 보존한다.
- `9333`이 열려 있어도 실제 Selenium attach가 불가능한 half-alive 상태를 별도 판정한다.
- `login.jsp` 또는 새 기기 승인/관리자 승인 징후가 보이면 자동 강제 재시작을 금지한다.
- 기존 `outside_window` / `WATCHDOG_OUTSIDE_WINDOW_AUTOSTART` 정책을 새 판단 순서도 안으로 통합한다.

## 핵심 판단 원칙

1. 로그인된 영림 세션 보존이 최우선이다.
2. `5081` 정상 + attach 정상일 때만 진짜 정상으로 본다.
3. `9333` listen 또는 DevTools 응답만으로는 정상으로 보지 않는다.
4. 로그인 상실 또는 새 기기 승인 징후가 보이면 자동 복구보다 알람이 우선이다.
5. 강한 재시작은 창 안 시간대에서만, 누적 실패 기준을 넘겼을 때만 허용한다.

## 상태 파일 전략

- 권장안: 기존 `health_status.json` 확장
- 이유:
  - 이미 `run_server.py`가 쓰는 운영 상태 원본이다.
  - 브라우저 상태를 별도 파일로 분리하면 서버 상태와 watchdog 판정 상태가 다시 어긋날 수 있다.
  - watchdog 쿨다운/알람 기록은 기존처럼 `watchdog_alert_state.json`, `watchdog_recovery_state.json`에 유지한다.

### `health_status.json` 확장 후보 필드

- `browser_attach_ok`
- `browser_last_attach_ok_at`
- `browser_last_attach_fail_at`
- `browser_consecutive_attach_failures`
- `browser_login_state`
- `browser_approval_state`
- `browser_last_probe_url`
- `browser_last_probe_title`
- `half_alive_since`
- `server_down_since`

## 함수 설계

### `collect_runtime_state()`

- 역할:
  - `5081`, `9333`, pid 파일, app log, 기존 health status를 모은다.
- 출력 예:

```python
{
    "now_ts": "...",
    "server_listener_pid": "41260",
    "edge_listener_pid": "155840",
    "pid_file": "41260",
    "pid_alive": True,
    "app_log_age_min": 4.2,
    "health": {...},
    "in_recovery_window": True,
}
```

### `probe_edge_devtools_state(port=9333)`

- 역할:
  - DevTools 접속 가능 여부와 `json/list` 탭 정보를 모은다.
- 출력 예:

```python
{
    "port_open": True,
    "devtools_ok": True,
    "tabs": [{"url": "...", "title": "..."}],
    "youngrim_tabs": [{"url": "...", "title": "..."}],
    "error": None,
}
```

### `check_login_status(devtools_state)`

- 역할:
  - `json/list` URL 패턴으로 로그인 상실 여부를 1차 판정한다.
- 체크 URL 패턴:
  - 로그인 필요:
    - `/oms/login.jsp`
    - `login.jsp?returl=`
  - 로그인 유지 후보:
    - `/oms/main.jsp`
    - `/oms/estimate_list.jsp`
    - `/oms/estimate_doc.jsp`
    - `/oms/trans_doc.jsp`
- 출력 예:

```python
{
    "login_required": False,
    "browser_login_state": "logged_in_candidate",
    "reason": "main.jsp tab found",
}
```

### `check_approval_status_via_attach(port=9333)`

- 역할:
  - attach 성공 시 현재 탭 `current_url`, `title`, `page_source` 키워드를 검사한다.
- 체크 텍스트 후보:
  - `새로운 기기에서 접속했습니다`
  - `기기 승인`
  - `관리자 승인`
  - `승인 요청`
  - `본인 확인`
  - `로그인`
- 출력 예:

```python
{
    "attach_ok": True,
    "approval_required_suspected": False,
    "login_required": False,
    "probe_url": "http://door.yl.co.kr/oms/main.jsp",
    "probe_title": "영림임업주식회사",
    "matched_text": None,
}
```

### `is_half_alive(runtime_state)`

- 역할:
  - `9333`만 있고 `5081`은 없는 상태를 판정한다.

```python
return bool(runtime_state["edge_listener_pid"]) and not bool(runtime_state["server_listener_pid"])
```

### `update_timers(merged_state, previous_state)`

- 역할:
  - `server_down_since`, `half_alive_since`, attach 실패 연속 횟수를 갱신한다.

### `compute_elapsed_minutes(start_ts)`

- 역할:
  - 저장된 시작 시각으로부터 경과 시간을 계산한다.

### `should_block_force_restart(login_state, approval_state)`

- 역할:
  - 로그인/승인 징후가 있으면 자동 강제 재시작을 막는다.

### `should_force_restart(merged_state)`

- 역할:
  - 최후 수단 재시작 조건 충족 여부를 판정한다.

### `decide_recovery_action(...)`

- 역할:
  - 알람만 보낼지, `V10_AutoStart`만 돌릴지, `RESTART_CLEAN`까지 갈지 결정한다.

## 경과 시간 계산 근거

- watchdog는 단발 판정보다 “언제부터 그 상태였는지”를 기억해야 한다.
- 계산 기준:
  - `server_down_since`
  - `half_alive_since`
  - `browser_last_attach_fail_at`
  - `browser_consecutive_attach_failures`

### 규칙

```python
if server_listener_pid exists:
    server_down_since = None
else:
    server_down_since = previous.server_down_since or now_ts

if is_half_alive:
    half_alive_since = previous.half_alive_since or now_ts
else:
    half_alive_since = None

if attach_ok:
    browser_consecutive_attach_failures = 0
    browser_last_attach_ok_at = now_ts
else:
    if previous.attach_ok is False:
        browser_consecutive_attach_failures = previous.browser_consecutive_attach_failures + 1
    else:
        browser_consecutive_attach_failures = 1
    browser_last_attach_fail_at = now_ts
```

### 파생 값

- `server_down_minutes = minutes_between(now(), server_down_since)`
- `half_alive_minutes = minutes_between(now(), half_alive_since)`

## 단일 판단 순서도

```text
[시작]
  |
  v
[1] 5081 정상 리스닝인가?
  |-- 예 --> [2] 9333 attach probe 성공인가?
  |            |-- 예 --> [정상 유지, 아무것도 죽이지 않음]
  |            |-- 아니오 --> [기존 로그인 세션 보존 모드]
  |
  |-- 아니오 --> [3] 9333이 살아 있는가?
               |-- 아니오 --> [4] login/승인 징후 있는가?]
               |              |-- 예 --> [alert_only]
               |              |-- 아니오 --> [restart_server_only 또는 outside_window_autostart]
               |
               |-- 예 --> [5] DevTools probe 성공인가?]
                              |-- 아니오 --> [기존 세션 최소 정리 후 재시도]
                              |-- 예 --> [6] attach probe 성공인가?]
                                           |-- 예 --> [restart_server_only]
                                           |-- 아니오 --> [기존 로그인 세션 보존 모드]

[기존 로그인 세션 보존 모드]
  |
  v
[A] login.jsp 또는 승인 징후 있는가?
  |-- 예 --> [alert_only]
  |-- 아니오 --> [B] attach 실패 연속 횟수 >= 3 인가?]
                  |-- 아니오 --> [조용히 재시도, 누적만 기록]
                  |-- 예 --> [C] 5081 미복구 10분 이상인가?]
                               |-- 아니오 --> [조용히 재시도]
                               |-- 예 --> [D] half_alive 15분 이상인가?]
                                            |-- 아니오 --> [조용히 재시도]
                                            |-- 예 --> [최후 수단 재시작 후보]

[최후 수단 재시작 후보]
  |
  v
[승인/로그인 징후 재확인]
  |-- 예 --> [재시작 금지, alert_only]
  |-- 아니오 --> [창 안 시간대면 full_restart_clean 또는 force_restart_edge]
```

## 창 밖 시간대 + 서버는 살아 있는데 attach만 실패하는 분기

### 결론

- 이 분기는 기존 설계 그대로면 너무 예민할 수 있다.
- 이유:
  - `5081`이 살아 있다는 것은 `run_server.py` 프로세스 자체는 아직 유지 중이라는 뜻이다.
  - attach 실패가 1회 또는 2회 발생했다고 바로 창 밖에서 알람/재시작을 하면, 일시적인 브라우저 순간 장애에도 과잉 반응할 수 있다.

### 권장 정책

- 창 밖 시간대에서 `server_listener_pid exists` + `attach_fail only` 조합이면:
  - 처음 1~2회는 조용히 누적만 하고 알람을 보내지 않는다.
  - 3회 연속 실패부터 alert 대상이 된다.
  - 창 밖에서는 이 경우 `full_restart_clean` 금지, `alert_only` 또는 `outside_window_autostart`도 보수적으로 제한한다.

### 권장 조건

```python
if not in_recovery_window and server_listener_pid and not attach_ok:
    if browser_consecutive_attach_failures < 3:
        action = "noop_with_counter"
        reason = "outside_window_attach_fail_grace"
    else:
        action = "alert_only"

## 2026-08-21 follow-up: stale lock false positive during recovery

### Observed issue

- During a watchdog-triggered recovery, a second abnormal-state email could be emitted even after recovery had already started.
- The representative symptom was a single failure line:
  - `v11.lock stale: pid=...`
- In the confirmed incident, the first watchdog pass detected a real outage and launched `full_restart_clean`.
- A second watchdog pass then ran during the short restart transition and interpreted the old `v11.lock` owner as a fresh failure.

### Root cause

- `v11.lock` was treated as immediately abnormal whenever the pid stored in the file was no longer alive.
- That rule was too aggressive for the restart transition, because lock-file replacement and `5081` listener acquisition do not happen at exactly the same instant.
- As a result, watchdog could send:
  - one email for the real outage
  - one extra email for the transient stale-lock state during successful recovery

### Hardening applied

- `watchdog_check.py`
  - stale `v11.lock` is no longer considered a standalone failure signal
  - it now requires another unhealthy runtime signal as corroboration, such as:
    - stale or dead `run_server.pid`
    - missing `5081` listener
    - stale/missing app log
    - stale health status
- `watchdog_check.py`
  - `WATCHDOG_RECOVERY_GRACE_MIN` was added with default `3`
  - after a successful recovery, watchdog suppresses noop or alert-only noise during this short grace window
  - recovery context is now surfaced in watchdog output:
    - `recovery_grace_active`
    - `recovery_grace_minutes_since`
    - `recent_recovery_reason`

### Operational meaning

- A stale lock is still treated seriously when it aligns with other unhealthy signals.
- A stale lock by itself, immediately after a successful recovery, is now treated as transition noise rather than a new incident.
        reason = "outside_window_attach_fail_persistent"
```

### 이유

- 로그인된 기존 세션을 보존해야 하므로, 창 밖에서 attach 불안정만으로 강한 복구를 돌리는 것은 운영 리스크가 크다.
- 서버가 완전히 죽은 상태와, 서버는 살아 있는데 attach만 순간 실패한 상태는 구분해야 한다.

## `outside_window` / `WATCHDOG_OUTSIDE_WINDOW_AUTOSTART` 통합 방식

- 기존 `WATCHDOG_OUTSIDE_WINDOW_AUTOSTART=true`는 유지한다.
- 다만 새 순서도에서는 “창 밖 축소 복구 단계”로 위치를 명확히 한다.

### 매핑

- 창 밖 + 서버 down + 로그인/승인 징후 없음
  - `outside_window_autostart`
- 창 밖 + 서버 alive + attach fail only
  - 1~2회: `noop_with_counter`
  - 3회 이상: `alert_only`
- 창 밖 + login/approval detected
  - `alert_only`

즉:

1. 로그인/승인 위험 체크
2. 창 안/밖 체크
3. 창 밖이면 축소 복구 또는 유예
4. 창 안이면 누적 실패 기준을 만족할 때만 강한 복구

## 최후 수단 재시작 허용 조건

- `browser_consecutive_attach_failures >= 3`
- `server_down_minutes >= 10`
- half-alive 상태라면 `half_alive_minutes >= 15`
- `login_required == False`
- `approval_required_suspected == False`
- 가능하면 창 안 시간대

## 의사코드

```text
main():
  runtime_state = collect_runtime_state()
  health_state = load_health_status()
  recovery_state = load_watchdog_recovery_state()
  alert_state = load_watchdog_alert_state()
  previous_state = health_state or {}

  browser_probe = collect_browser_probe_state(runtime_state)
  merged_state = merge_runtime_and_browser_state(runtime_state, previous_state, browser_probe)

  update_timers(merged_state, previous_state)
  failures = collect_failures_from_merged_state(merged_state)
  persist_watchdog_side_state(merged_state)

  if failures is empty:
      log_ok()
      return 0

  block_force_restart, block_reason = should_block_force_restart(
      merged_state["login_state"],
      merged_state["approval_state"],
  )

  recovery_decision = decide_recovery_action(
      merged_state=merged_state,
      failures=failures,
      block_force_restart=block_force_restart,
      block_reason=block_reason,
      recovery_state=recovery_state,
  )

  maybe_send_alert(merged_state, failures, recovery_decision)

  if recovery_decision.action == "noop_with_counter":
      append_log("recovery_skipped reason=outside_window_attach_fail_grace")
      return 2

  if recovery_decision.action == "alert_only":
      append_log(f"recovery_skipped reason={recovery_decision.reason}")
      return 2

  if recovery_decision.action == "outside_window_autostart":
      run_v10_autostart()
      return 2

  if recovery_decision.action == "restart_server_only":
      run_v10_autostart()
      return 2

  if recovery_decision.action == "full_restart_clean":
      run_restart_clean()
      return 2

  if recovery_decision.action == "force_restart_edge":
      run_restart_clean()
      return 2

  return 2
```

### `decide_recovery_action(...)`

```text
decide_recovery_action(...):
  if block_force_restart:
      return {action: "alert_only", reason: block_reason}

  if server_listener_pid and attach_ok:
      return {action: "noop", reason: "healthy"}

  if not in_recovery_window:
      if server_listener_pid and not attach_ok:
          if browser_consecutive_attach_failures < 3:
              return {action: "noop_with_counter", reason: "outside_window_attach_fail_grace"}
          return {action: "alert_only", reason: "outside_window_attach_fail_persistent"}

      if not server_listener_pid and not login_required and not approval_required_suspected:
          return {action: "outside_window_autostart", reason: "outside_window_server_down"}

      return {action: "alert_only", reason: "outside_window_no_safe_action"}

  if not server_listener_pid and attach_ok:
      return {action: "restart_server_only", reason: "edge_ok_server_down"}

  if allow_force_restart(merged_state):
      return {action: "force_restart_edge", reason: "force_restart_threshold_met"}

  if is_half_alive(merged_state):
      return {action: "full_restart_clean", reason: "half_alive_recoverable"}

  if not server_listener_pid:
      return {action: "full_restart_clean", reason: "server_down_recoverable"}

  return {action: "alert_only", reason: "unclassified_failure"}
```

## attach probe 확장 설계

- `edge_attach_probe.py`는 장기적으로 `--dump-json` 모드를 지원하는 것이 바람직하다.
- 반환 예:

```json
{
  "ok": true,
  "current_url": "http://door.yl.co.kr/oms/main.jsp",
  "title": "영림임업주식회사",
  "page_text_excerpt": "...",
  "login_required": false,
  "approval_required_suspected": false,
  "matched_text": null
}
```

## 실제 로그인/승인 페이지 검증 지시

### 상시 고정 지시

```text
[필수 운영 지시]
다음 실제 로그인/승인 페이지 발생 시 반드시 아래를 동시에 캡처할 것.
1. 브라우저 스크린샷
2. http://127.0.0.1:9333/json/list 결과(URL/title 포함)

목적:
- login.jsp / returl / 승인 문구 패턴을 실제 화면과 대조
- watchdog의 로그인/승인 감지 규칙 검증
```

### 비고

- 현재 확보된 실제 승인 페이지 URL 캡처는 없다.
- 따라서 1차 감지는:
  - `login.jsp`
  - `returl`
  - 승인 관련 한글 키워드
  조합으로 구현하고, 실제 캡처 발생 시 패턴을 검증해 보정한다.

## Appendix A. Isolated Test Results (2026-08-13)

### Test scope

- The live `9333` Youngrim session was not touched.
- Fixture-only tests used no browser at all.
- Browser-isolated tests used only temporary local ports and local dummy HTML pages.
- `--require-youngrim` remained enforced in the production watchdog call path.
- A test-only seam was added to `check_approval_status_via_attach(port=..., require_youngrim=False)` so local dummy pages can be validated without affecting production behavior.

### Result table

| Scenario | Method | Expected | Actual | Result |
|---|---|---|---|---|
| `1` main.jsp logged-in candidate | fixture | `login_required=False`, `browser_login_state=logged_in_candidate` | matched exactly | `PASS` |
| `2` login.jsp returl detected | fixture | `login_required=True`, `browser_login_state=login_page_only` | matched exactly | `PASS` |
| `5a` outside-window attach fail first hit | fixture | `noop_with_counter` | matched exactly | `PASS` |
| `5b` outside-window attach fail second hit | fixture | `noop_with_counter` | matched exactly | `PASS` |
| `5c` outside-window attach fail third hit | fixture | `alert_only` | matched exactly | `PASS` |
| `6a` half-alive under 15 min | fixture | `should_force_restart=False`, recovery remains below force threshold | `should_force_restart=False`, `full_restart_clean` path | `PASS` |
| `6b` half-alive at 15 min | fixture | `should_force_restart=True`, `force_restart_edge` | matched exactly | `PASS` |
| `3a` approval dummy page | isolated browser + `edge_attach_probe.py --dump-json` | attach succeeds and approval text visible | attach succeeded, approval text captured | `PASS` |
| `3b` approval dummy page via wrapper | isolated browser + `check_approval_status_via_attach(require_youngrim=False)` | `attach_ok=True`, `approval_required_suspected=True`, matched text captured | returned `attach_ok=True`, `approval_required_suspected=True`, `matched_text='새로운 기기에서 접속했습니다'` | `PASS` |
| `4a` clean dummy page | isolated browser + `edge_attach_probe.py --dump-json` | attach succeeds and no approval text | attach succeeded, no approval text present | `PASS` |
| `4b` clean dummy page via wrapper | isolated browser + `check_approval_status_via_attach(require_youngrim=False)` | `attach_ok=True`, `approval_required_suspected=False` | returned `attach_ok=True`, `approval_required_suspected=False`, `matched_text=None` | `PASS` |

### Operational notes from isolated testing

- The fixture-only decision logic for scenarios `5` and `6` behaved exactly as intended.
- The wrapper function now supports local-only isolated testing without weakening the production watchdog path.
- The production watchdog still calls:

```python
check_approval_status_via_attach(require_youngrim=True)
```

- During cleanup, some temporary test-only Edge listener PIDs on isolated ports remained visible as `Unknown`/lingering Windows processes even after force-stop attempts.
- These test-only ports were separate from `9333`, so the live Youngrim session was not affected.
