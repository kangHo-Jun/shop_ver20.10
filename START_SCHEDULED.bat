@echo off
chcp 437 >nul
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "LOG_FILE=logs\scheduler_%LOG_DATE%.log"
set "SERVER_PID_FILE=logs\run_server.pid"
set "EDGE_PID_FILE=logs\edge_9333.pid"
set "EDGE_PROFILE_DIR=%LOCALAPPDATA%\YoungrimAutoEdgeProfile"
set "SERVER_PORT=5081"

echo ================================================== >> "%LOG_FILE%"
echo [%date% %time%] START_SCHEDULED.bat launched >> "%LOG_FILE%"
echo Working directory: %cd% >> "%LOG_FILE%"

if not exist "%EDGE_PROFILE_DIR%" mkdir "%EDGE_PROFILE_DIR%" >nul 2>&1

REM 1) Reuse existing automation server if it is still alive.
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
    goto :ensure_edge
)

:after_server_listener_check

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
            echo [%date% %time%] Existing run_server.py PID %EXISTING_SERVER_PID% is still running. Skipping restart. >> "%LOG_FILE%"
            goto :ensure_edge
        )
    )
)

echo [%date% %time%] Starting run_server.py... >> "%LOG_FILE%"
powershell -NoProfile -Command "$p = Start-Process -FilePath '.\.venv\Scripts\python.exe' -ArgumentList 'run_server.py' -WorkingDirectory '%cd%' -RedirectStandardOutput '%cd%\logs\run_server_stdout_%LOG_DATE%.log' -RedirectStandardError '%cd%\logs\run_server_stderr_%LOG_DATE%.log' -PassThru; Set-Content -Path '%cd%\%SERVER_PID_FILE%' -Value $p.Id"
if errorlevel 1 (
    echo [%date% %time%] Failed to start run_server.py >> "%LOG_FILE%"
    exit /b 1
)

:ensure_edge
REM 2) Start dedicated Edge debug browser only when port 9333 is not already listening.
set "EDGE_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":9333 .*LISTENING"') do (
    set "EDGE_LISTENER_PID=%%P"
    goto :edge_listener_found
)
goto :no_edge_listener

:edge_listener_found
if defined EDGE_LISTENER_PID (
    > "%EDGE_PID_FILE%" echo %EDGE_LISTENER_PID%
    echo [%date% %time%] Port 9333 already listening. Reusing existing debug browser PID %EDGE_LISTENER_PID%. >> "%LOG_FILE%"
    goto :done
)

:no_edge_listener

echo [%date% %time%] Starting dedicated Edge debug browser... >> "%LOG_FILE%"
powershell -NoProfile -Command "$p = Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList '--remote-debugging-port=9333 --user-data-dir=""%EDGE_PROFILE_DIR%"" --profile-directory=""Default"" --no-first-run --no-default-browser-check http://door.yl.co.kr/oms/main.jsp' -PassThru; Set-Content -Path '%cd%\%EDGE_PID_FILE%' -Value $p.Id"
if errorlevel 1 (
    echo [%date% %time%] Failed to start Edge debug browser >> "%LOG_FILE%"
    exit /b 1
)

echo [%date% %time%] Edge launched, waiting 10s... >> "%LOG_FILE%"
timeout /t 10 /nobreak >nul

:done
echo [%date% %time%] START_SCHEDULED completed >> "%LOG_FILE%"
