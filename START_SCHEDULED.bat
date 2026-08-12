@echo off
chcp 437 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format HHmmss"') do set "LOG_TIME=%%I"
set "LOG_FILE=logs\scheduler_%LOG_DATE%.log"
set "SERVER_PID_FILE=logs\run_server.pid"
set "EDGE_PID_FILE=logs\edge_9333.pid"
set "EDGE_PROFILE_DIR=%LOCALAPPDATA%\YoungrimAutoEdgeProfile_noext"
set "SERVER_PORT=5081"
set "EDGE_PORT=9333"
set "EDGE_WAIT_SEC=60"
set "EDGE_PROBE_WAIT_SEC=20"
set "EDGE_ATTACH_PROBE_WAIT_SEC=2"
set "SERVER_WAIT_SEC=180"
set "RUN_SERVER_STDOUT=logs\run_server_stdout_%LOG_DATE%_%LOG_TIME%.log"
set "RUN_SERVER_STDERR=logs\run_server_stderr_%LOG_DATE%_%LOG_TIME%.log"

echo ================================================== >> "%LOG_FILE%"
echo [%date% %time%] START_SCHEDULED.bat launched >> "%LOG_FILE%"
echo Working directory: %cd% >> "%LOG_FILE%"

if not exist "%EDGE_PROFILE_DIR%" mkdir "%EDGE_PROFILE_DIR%" >nul 2>&1

set "SERVER_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
    set "SERVER_LISTENER_PID=%%P"
    goto :server_listener_found
)
goto :after_server_listener_check

:server_listener_found
if defined SERVER_LISTENER_PID (
    > "%SERVER_PID_FILE%" echo %SERVER_LISTENER_PID%
    echo [%date% %time%] Port %SERVER_PORT% already listening. Reusing existing run_server.py PID %SERVER_LISTENER_PID%. >> "%LOG_FILE%"
)

:after_server_listener_check

if not defined SERVER_LISTENER_PID (
    if exist "%SERVER_PID_FILE%" (
        set "EXISTING_SERVER_PID="
        for /f "usebackq delims=" %%I in ("%SERVER_PID_FILE%") do (
            set "EXISTING_SERVER_PID=%%I"
            goto :existing_server_pid_loaded
        )
        :existing_server_pid_loaded
        if not "%EXISTING_SERVER_PID%"=="" (
            powershell -NoProfile -Command "if (Get-Process -Id %EXISTING_SERVER_PID% -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
            if not errorlevel 1 (
                echo [%date% %time%] Stale run_server PID file detected without port %SERVER_PORT% listener. Killing PID %EXISTING_SERVER_PID% and starting fresh. >> "%LOG_FILE%"
                taskkill /f /pid %EXISTING_SERVER_PID% /t >> "%LOG_FILE%" 2>&1
                timeout /t 2 /nobreak >nul
            )
        )
        del "%SERVER_PID_FILE%" >nul 2>&1
    )
)

call :ensure_edge
if errorlevel 1 exit /b 1

if defined SERVER_LISTENER_PID goto :done

if exist "%SERVER_PID_FILE%" del "%SERVER_PID_FILE%" >nul 2>&1
echo [%date% %time%] Starting run_server.py... >> "%LOG_FILE%"
echo [%date% %time%] stdout log: %RUN_SERVER_STDOUT% >> "%LOG_FILE%"
echo [%date% %time%] stderr log: %RUN_SERVER_STDERR% >> "%LOG_FILE%"
powershell -NoProfile -Command "$p = Start-Process -FilePath '.\.venv\Scripts\python.exe' -ArgumentList 'run_server.py' -WorkingDirectory '%cd%' -RedirectStandardOutput '%cd%\%RUN_SERVER_STDOUT%' -RedirectStandardError '%cd%\%RUN_SERVER_STDERR%' -PassThru; Set-Content -Path '%cd%\%SERVER_PID_FILE%' -Value $p.Id"
if errorlevel 1 (
    echo [%date% %time%] Failed to start run_server.py >> "%LOG_FILE%"
    call "%~dp0notify_failure.bat" "START_SCHEDULED: failed to start run_server.py"
    exit /b 1
)

echo [%date% %time%] Waiting for run_server.py to bind port %SERVER_PORT%... >> "%LOG_FILE%"
set "SERVER_READY_PID="
set "STARTED_SERVER_PID="
for /f "usebackq delims=" %%I in ("%SERVER_PID_FILE%") do (
    set "STARTED_SERVER_PID=%%I"
    goto :started_server_pid_loaded
)

:started_server_pid_loaded
for /l %%N in (1,1,%SERVER_WAIT_SEC%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
        set "SERVER_READY_PID=%%P"
        > "%SERVER_PID_FILE%" echo %%P
        goto :server_ready
    )
    if defined STARTED_SERVER_PID (
        powershell -NoProfile -Command "if (Get-Process -Id %STARTED_SERVER_PID% -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
        if errorlevel 1 (
            echo [%date% %time%] run_server.py PID %STARTED_SERVER_PID% exited before binding port %SERVER_PORT%. >> "%LOG_FILE%"
            call "%~dp0notify_failure.bat" "START_SCHEDULED: run_server.py exited before binding port %SERVER_PORT%"
            exit /b 1
        )
    )
    timeout /t 1 /nobreak >nul
)

echo [%date% %time%] run_server.py did not bind port %SERVER_PORT% within %SERVER_WAIT_SEC%s >> "%LOG_FILE%"
call "%~dp0notify_failure.bat" "START_SCHEDULED: run_server.py did not bind port %SERVER_PORT%"
exit /b 1

:server_ready
echo [%date% %time%] run_server.py is listening on port %SERVER_PORT% with PID %SERVER_READY_PID%. >> "%LOG_FILE%"
set "SERVER_LISTENER_PID=%SERVER_READY_PID%"
goto :done

:ensure_edge
set "EDGE_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
    set "EDGE_LISTENER_PID=%%P"
    goto :edge_listener_found
)
goto :start_edge

:edge_listener_found
if defined EDGE_LISTENER_PID (
    set "EDGE_CMDLINE="
    set "EDGE_PROCESS_NAME="
    for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$proc = $null; foreach ($item in Get-WmiObject Win32_Process) { if ($item.ProcessId -eq %EDGE_LISTENER_PID%) { $proc = $item; break } }; if ($proc) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output $proc.Name; Write-Output $proc.CommandLine }"`) do (
        if not defined EDGE_PROCESS_NAME (
            set "EDGE_PROCESS_NAME=%%I"
        ) else if not defined EDGE_CMDLINE (
            set "EDGE_CMDLINE=%%I"
        )
    )
    echo !EDGE_CMDLINE! | findstr /I /C:"YoungrimAutoEdgeProfile_noext" >nul
    if errorlevel 1 (
        echo [%date% %time%] Port %EDGE_PORT% is already listening, but the owning process is not using YoungrimAutoEdgeProfile_noext. >> "%LOG_FILE%"
        echo [%date% %time%] PID=!EDGE_LISTENER_PID! ProcessName=!EDGE_PROCESS_NAME! >> "%LOG_FILE%"
        echo [%date% %time%] CommandLine=!EDGE_CMDLINE! >> "%LOG_FILE%"
        echo [%date% %time%] START_SCHEDULED aborted to avoid reusing the wrong Edge profile. >> "%LOG_FILE%"
        call "%~dp0notify_failure.bat" "START_SCHEDULED: %EDGE_PORT% owned by non-Youngrim-noext profile PID=!EDGE_LISTENER_PID!"
        exit /b 1
    )
    call :probe_edge "reuse_existing"
    if errorlevel 1 (
        echo [%date% %time%] Existing Edge debug browser PID %EDGE_LISTENER_PID% failed health probe. Recreating session. >> "%LOG_FILE%"
        call :cleanup_edge_profile_processes
        goto :start_edge
    )
    > "%EDGE_PID_FILE%" echo %EDGE_LISTENER_PID%
    echo [%date% %time%] Port %EDGE_PORT% already listening. Reusing existing debug browser PID %EDGE_LISTENER_PID%. >> "%LOG_FILE%"
    exit /b 0
)

:start_edge
set "EDGE_START_ATTEMPT=1"

:start_edge_attempt
echo [%date% %time%] Starting dedicated Edge debug browser... attempt=!EDGE_START_ATTEMPT! >> "%LOG_FILE%"
powershell -NoProfile -Command "$args = @('--remote-debugging-port=9333', '--remote-debugging-address=127.0.0.1', '--user-data-dir=%EDGE_PROFILE_DIR%', '--profile-directory=Default', '--disable-extensions', '--no-first-run', '--no-default-browser-check', 'http://door.yl.co.kr/oms/main.jsp'); $p = Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList $args -PassThru; Set-Content -Path '%cd%\%EDGE_PID_FILE%' -Value $p.Id"
if errorlevel 1 (
    echo [%date% %time%] Failed to start Edge debug browser on attempt !EDGE_START_ATTEMPT! >> "%LOG_FILE%"
    if "!EDGE_START_ATTEMPT!"=="1" (
        echo [%date% %time%] Retrying Edge launch after Youngrim-noext profile cleanup... >> "%LOG_FILE%"
        call :cleanup_edge_profile_processes
        set "EDGE_START_ATTEMPT=2"
        goto :start_edge_attempt
    )
    call "%~dp0notify_failure.bat" "START_SCHEDULED: failed to start Edge debug browser"
    exit /b 1
)

echo [%date% %time%] Edge launched, waiting for debug port %EDGE_PORT%... attempt=!EDGE_START_ATTEMPT! >> "%LOG_FILE%"
set "EDGE_READY_PID="
for /l %%N in (1,1,%EDGE_WAIT_SEC%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
        set "EDGE_READY_PID=%%P"
        > "%EDGE_PID_FILE%" echo %%P
        goto :edge_ready
    )
    timeout /t 1 /nobreak >nul
)

if "!EDGE_START_ATTEMPT!"=="1" (
    echo [%date% %time%] Edge debug port %EDGE_PORT% did not become ready within %EDGE_WAIT_SEC%s on first attempt. Cleaning Youngrim-noext profile processes and retrying once... >> "%LOG_FILE%"
    call :cleanup_edge_profile_processes
    set "EDGE_START_ATTEMPT=2"
    goto :start_edge_attempt
)

echo [%date% %time%] Edge debug port %EDGE_PORT% did not become ready within %EDGE_WAIT_SEC%s after retry >> "%LOG_FILE%"
call "%~dp0notify_failure.bat" "START_SCHEDULED: Edge debug port %EDGE_PORT% not ready"
exit /b 1

:edge_ready
call :probe_edge "fresh_launch_attempt_!EDGE_START_ATTEMPT!"
if errorlevel 1 (
    if "!EDGE_START_ATTEMPT!"=="1" (
        echo [%date% %time%] Edge debug port %EDGE_PORT% opened but health probe failed on first attempt. Recreating session once... >> "%LOG_FILE%"
        call :cleanup_edge_profile_processes
        set "EDGE_START_ATTEMPT=2"
        goto :start_edge_attempt
    )
    echo [%date% %time%] Edge debug port %EDGE_PORT% opened but health probe still failed after retry. >> "%LOG_FILE%"
    call "%~dp0notify_failure.bat" "START_SCHEDULED: Edge debug port %EDGE_PORT% unhealthy after launch"
    exit /b 1
)
echo [%date% %time%] Edge debug port %EDGE_PORT% is ready with PID %EDGE_READY_PID%. >> "%LOG_FILE%"
exit /b 0

:probe_edge
".\.venv\Scripts\python.exe" edge_debug_probe.py --port %EDGE_PORT% --timeout-sec 5 --retries %EDGE_PROBE_WAIT_SEC% --sleep-sec 1 --require-youngrim >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo [%date% %time%] Edge health probe failed for %~1. >> "%LOG_FILE%"
    exit /b 1
)
".\.venv\Scripts\python.exe" edge_attach_probe.py --port %EDGE_PORT% --timeout-sec 15 --retries %EDGE_ATTACH_PROBE_WAIT_SEC% --sleep-sec 2 --require-youngrim >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo [%date% %time%] Edge attach probe failed for %~1. >> "%LOG_FILE%"
    exit /b 1
)
echo [%date% %time%] Edge health probe passed for %~1. >> "%LOG_FILE%"
exit /b 0

:cleanup_edge_profile_processes
powershell -NoProfile -Command "$targets = Get-WmiObject Win32_Process | Where-Object { (($_.Name -eq 'msedge.exe') -or ($_.Name -eq 'msedgedriver.exe')) -and $_.CommandLine -like '*YoungrimAutoEdgeProfile_noext*' }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }" >> "%LOG_FILE%" 2>&1
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do taskkill /f /pid %%P /t >> "%LOG_FILE%" 2>&1
timeout /t 2 /nobreak >nul
exit /b 0

:done
echo [%date% %time%] START_SCHEDULED completed >> "%LOG_FILE%"
call "%~dp0health_check.bat"
