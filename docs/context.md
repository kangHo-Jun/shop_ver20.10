# Project Context & Status (UTF-8 Rebuilt)

Last updated: 2026-07-27

## 1. Project Summary

- Purpose: automatically download Youngrim OMS documents, parse them, and upload structured data for downstream ERP and Google Sheets workflows.
- Main runtime: `run_server.py`
- Main start paths:
  - `START_SCHEDULED.bat`
  - `RESTART_CLEAN.bat`
  - `start_edge_debug.bat`
- Key ports:
  - Server lock/listener: `5081`
  - Edge debug port: `9333`
- Key state files:
  - `logs/run_server.pid`
  - `logs/v11.lock`
  - `logs/edge_9333.pid`
  - `logs/health_status.json`

## 2. Current Operational Model

- The server uses a single-instance lock file plus a localhost listener on port `5081`.
- The downloader attaches to a dedicated Edge session on port `9333`.
- The preferred Edge profile is the dedicated no-extension automation profile used by the current batch files.
- Health is tracked through `health_status.json`, scheduler logs, watchdog logs, and per-run stdout/stderr logs.

## 3. Major Confirmed Failure Themes

### 2026-05-13

- Scheduler launched, but `run_server.py` did not actually start.
- Root cause: `Start-Process` output redirection handling was fragile, and operational verification was too weak.
- Recovery was completed manually for missing files.

### 2026-05-19

- Restart after cleanup still failed due to stale pid/lock files and zombie `msedgedriver` processes.
- Recovery lesson: `STOP_SCHEDULED` alone was not enough; stale files and driver processes also had to be cleared.

### 2026-06-05

- A non-Youngrim Edge instance occupied port `9333`.
- Result: scheduled startup aborted correctly, but the system had no sufficient automatic recovery/alert path.

### 2026-06-10

- Watchdog-based recovery and `RESTART_CLEAN.bat` were introduced.
- Health checks were strengthened to wait for `5081`, `9333`, and `app_YYYYMMDD.json`.

### 2026-07-20 to 2026-07-21

- Downloads after late morning were delayed or missed.
- Root cause cluster:
  - repeated browser reconnect failures
  - server/Edge shutdown at 17:00
  - watchdog skipping recovery outside its configured time window
- Recovery on 2026-07-21 confirmed missing files were later collected.

### 2026-07-22 to 2026-07-23

- User symptom: downloads appeared to stop around `7/22`.
- Confirmed behavior:
  - watchdog repeatedly detected `run_server.pid missing`, `5081 not listening`, missing app log, and stale health
  - outside the recovery window, watchdog only logged `outside_window`
  - once morning recovery started, Edge often failed to make `9333` ready within the old 30-second timeout
- Root causes:
  - Edge startup delay
  - watchdog recovery timeout too short for real restart time
  - recovery window policy leaving overnight failures untouched until morning

## 4. Fixes Applied on 2026-07-27

### Edge and restart timing

- `START_SCHEDULED.bat`
  - Edge wait increased to `60s`
  - server wait increased to `60s`
  - retry once after cleaning Youngrim-profile processes
- `RESTART_CLEAN.bat`
  - Edge wait increased to `60s`
  - server wait increased to `60s`
  - app log wait increased to `90s`
  - retry once for Edge startup failure
- `start_edge_debug.bat`
  - Edge wait increased to `60s`
- `run_server.py`
  - browser auto-start wait increased to `60s` through `EDGE_START_WAIT_SEC`

## 4A. Additional confirmed issue and fix from log-stamped runtime on 2026-07-28

- First recovery cycle behavior:
  - the downloader queried `start_date=2026-07-21` to `end_date=2026-07-28`, so the stalled `2026-07-24` to `2026-07-27` range was inside scope
  - however, the first cycle was redirected to `login.jsp?returl=...estimate_list.jsp...` and found `0 actionable rows`
- Later state after login was restored:
  - backlog files were downloaded, but some remained in `READY`
  - confirmed local state before manual drain:
    - `2026-07-24`: `COMPLETED 1`, `READY 9`
    - `2026-07-27`: `READY 5`
  - `2026-07-25` and `2026-07-26` had no local backlog entries in `v10_state.json`
- Root cause of the leftover backlog:
  - `run_server.py` upload logic enforced `MAX_ROWS_PER_UPLOAD = 300`
  - once the row budget was exceeded, `auto_upload()` stopped and left the rest for the next cycle
- Applied follow-up fix:
  - same-cycle upload draining was added
  - new `drain_ready_uploads()` repeatedly runs upload batches until `READY=0` or progress stalls
  - manual recovery completed the stranded backlog at `Sheet5` timestamp `2026-07-28 07:36:51` (`14` files, `482` rows)

## 4B. Current verified operational judgment after post-incident review

- Profile contamination trigger:
  - confirmed symptom: the old automation profile could hang on Selenium debugger attach
  - unconfirmed cause: no checked log or code path proves what originally contaminated that profile
  - current status: the trigger remains unknown
- `--disable-extensions` evaluation:
  - confirmed working recovery path used both `--disable-extensions` and a fresh dedicated no-extension profile
  - not yet proven: `--disable-extensions` alone fixing the old contaminated profile
  - operational interpretation: this is a strong mitigation, but not yet a fully isolated root-cause fix by itself
- Watchdog outside-window behavior:
  - the old "full skip" state is no longer exact
  - current code still skips full `RESTART_CLEAN` outside the configured window, but may trigger `V10_AutoStart` as reduced recovery
  - this means outside-window recovery is better than before, but still cannot solve every profile-level failure mode
- Alerting status:
  - `notify_failure.bat` is not a stub; it posts to the monitor web app URL
  - however, watchdog logs on `2026-07-22` recorded repeated `HTTP Error 403: Forbidden` responses during alert attempts
  - current operational judgment: alert code exists, but end-to-end alert delivery is not verified healthy
- Update-trigger hypothesis:
  - `2026-07-22 15:47` was not the first sign of failure; scheduler logs already showed `9333` startup failures at `2026-07-22 14:53` and `15:28`
  - EdgeUpdate activity existed around `2026-07-22 15:00`, `16:00`, and `17:01`, but checked logs showed update checks/service activity rather than a confirmed install event in that exact failure window
  - checked local file/version evidence points more strongly to later Edge version movement around `2026-07-24` and `2026-07-27`
  - current operational judgment: automatic Edge update is not confirmed as the direct trigger for the `2026-07-22 15:47~17:00` break

### Watchdog behavior

- `watchdog_check.py`
  - `WATCHDOG_RESTART_CLEAN_TIMEOUT_SEC` default set to `180`
  - long-running `RESTART_CLEAN.bat` no longer gets cut off after 10 seconds
  - new outside-window reduced recovery path added:
    - instead of full `RESTART_CLEAN`, watchdog may call scheduled task `V10_AutoStart`
    - controlled by `WATCHDOG_OUTSIDE_WINDOW_AUTOSTART`

### Log separation

- `START_SCHEDULED.bat` and `RESTART_CLEAN.bat` now write per-run logs:
  - `run_server_stdout_YYYYMMDD_HHMMSS.log`
  - `run_server_stderr_YYYYMMDD_HHMMSS.log`
- This prevents same-day restart runs from sharing one stdout/stderr filename.

## 5. Current Recovery Policy

- Full recovery window:
  - default `06:05` to `16:45`
- Outside that window:
  - full `RESTART_CLEAN` is skipped
  - reduced recovery may still trigger `V10_AutoStart`
- Remaining risk:
  - if the scheduled task itself cannot recover the process, overnight failures may still last until daytime intervention
  - if the browser is alive but logged out, downloads can still appear healthy at process level while returning `0 actionable rows`
  - if a future profile-level attach failure reappears, reduced outside-window autostart may still be insufficient without manual profile intervention
  - before `2026-08-11` hardening, `9333` listen-only checks and stale `run_server.pid` reuse could misclassify a hung browser/session as healthy

## 5A. 2026-08-11 Re-diagnosis and hardening

- Confirmed field symptom:
  - the dedicated Edge window could become `Not Responding`
  - after killing that hung Edge and starting a fresh one, automation resumed normally
- Confirmed failure pattern from `2026-08-11` logs:
  - `09:25:13` cycle started
  - `ReadTimeoutError` repeated against the local WebDriver session
  - `09:35:21` `Browser connection appears dead`
  - `09:57:02` `Browser reconnect failed: cannot connect to microsoft edge at 127.0.0.1:9333`
  - process sleep continued with `last_cycle_completed_at=None`, so the server looked alive while work was no longer completing
- Operational judgment:
  - the direct trigger is most likely a hung Edge renderer/debugger session, not a simple closed port
  - the outage was prolonged because health checks trusted `9333` listen state too loosely and startup logic could still reuse stale `run_server.pid`
- Hardening applied on `2026-08-11`:
  - added `edge_debug_probe.py`
  - `START_SCHEDULED.bat` and `RESTART_CLEAN.bat` now require a successful DevTools probe, not just `9333 LISTENING`
  - probe verifies:
    - `/json/version` responds as Edge
    - `/json/list` responds
    - at least one Youngrim OMS tab exists
  - if probe fails, the existing Edge debug browser is treated as unhealthy and rebuilt
  - `START_SCHEDULED.bat` no longer reuses `run_server.pid` when `5081` is not actually listening; stale pid-only state is killed and restarted fresh
- Recovery proof after hardening:
  - fresh Edge attached successfully at `2026-08-11 13:29:57`
  - Google Sheets connected at `2026-08-11 13:30:04`
  - same cycle completed at `2026-08-11 13:31:07`
  - output: `28 rows / 6 files -> Google Sheets complete`

## 5B. 2026-08-12 Follow-up diagnosis: `9333 open` was still weaker than real Selenium attach

- Confirmed field symptom:
  - Edge could remain visible or keep `9333` listening while automation still could not attach
  - users also observed the dedicated Edge window showing `Not Responding`
- Confirmed failure evidence from `2026-08-12`:
  - repeated watchdog failures showed:
    - `run_server.pid missing`
    - `server port 5081 not listening`
    - `half-alive state: Edge port 9333 ... server port 5081 down`
  - `run_server_stderr_20260812_140006.log` recorded:
    - `session not created: cannot connect to microsoft edge at 127.0.0.1:9333`
    - `from chrome not reachable`
  - several exit snapshots showed true process loss, not only health-check noise:
    - `2026-08-12 09:40:37`
    - `2026-08-12 12:43:22`
    - `2026-08-12 15:02:24`
- Updated operational judgment:
  - `9333 LISTENING` plus DevTools JSON response was still not a strong enough health signal
  - the real success condition is whether Selenium can attach to the existing debugger session
  - `RESTART_CLEAN` also needed a longer watchdog budget because Edge cleanup + relaunch + attach validation could exceed `180s`
- Hardening applied on `2026-08-12`:
  - added `edge_attach_probe.py`
  - `START_SCHEDULED.bat` and `RESTART_CLEAN.bat` now require both:
    - DevTools probe success
    - actual Selenium attach probe success
  - watchdog default timeout for `RESTART_CLEAN` increased from `180s` to `420s`

## 5C. 2026-08-12 live recovery status and remaining gaps

- Confirmed live failure pattern after the above hardening:
  - a fresh `run_server.py` could still start and bind `5081`, but browser attach could fail immediately after startup with:
    - `session not created: cannot connect to microsoft edge at 127.0.0.1:9333`
    - `from chrome not reachable`
  - watchdog still observed repeated half-alive states with only `9333` left alive
- Confirmed recovery result:
  - after clearing the stuck Youngrim debug Edge session and starting again through `START_SCHEDULED.bat`
  - listeners recovered to:
    - `127.0.0.1:9333`
    - `127.0.0.1:5081`
  - both probes passed again:
    - `edge_debug_probe.py --port 9333 --require-youngrim`
    - `edge_attach_probe.py --port 9333 --require-youngrim`
  - `health_status.json` returned to `cycle_completed`
- Remaining unresolved risks:
  - Edge attach failure is reduced but not eliminated; the same `chrome not reachable` condition still reappeared in the field
  - watchdog alert delivery is still broken with repeated `HTTP 403` responses
  - recovery outside the main window is still weaker than in-window recovery because it can fall back to `V10_AutoStart` instead of always doing a full cleanup
  - host time/log time can drift ahead of the expected operational date, which complicates incident timelines and scheduler interpretation

## 6. What to Check First During an Incident

1. `logs/scheduler_YYYYMMDD.log`
2. `logs/watchdog_YYYYMMDD.log`
3. `logs/restart_clean_YYYYMMDD.log`
4. `logs/app_YYYYMMDD.json`
5. `logs/health_status.json`
6. actual listeners on:
   - `127.0.0.1:5081`
   - `127.0.0.1:9333`
7. whether `9333` belongs to `YoungrimAutoEdgeProfile`
8. whether `edge_debug_probe.py --port 9333 --require-youngrim` passes
9. whether `edge_attach_probe.py --port 9333 --require-youngrim` passes
10. whether the host clock and the expected operational date still match before trusting log chronology

## 7. Expected Healthy Startup Evidence

In a healthy automatic start cycle, the scheduler log should contain both:

- `Edge debug port 9333 is ready`
- `run_server.py is listening on port 5081`

If only one appears, startup is incomplete.

Healthy recovery of backlog also requires:

- the dedicated debug Edge to stay on an authenticated Youngrim OMS page, not `login.jsp`
- `Sheet5` growth that matches the backlog files, with no lingering `READY` estimate entries in `v10_state.json`
- a successful Edge health probe when `9333` is reused, not just a raw listener check

## 8. Legacy Preservation

- Original damaged document preserved as:
  - `docs/context_legacy.md`
- Latin1 extraction review file:
  - `docs/context_review.txt`
