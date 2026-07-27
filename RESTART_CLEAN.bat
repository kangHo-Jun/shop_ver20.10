@echo off
chcp 437 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format HHmmss"') do set "LOG_TIME=%%I"
set "LOG_FILE=logs\restart_clean_%LOG_DATE%.log"
set "SERVER_PID_FILE=logs\run_server.pid"
set "EDGE_PID_FILE=logs\edge_9333.pid"
set "EDGE_PROFILE_DIR=%LOCALAPPDATA%\YoungrimAutoEdgeProfile_noext"
set "SERVER_PORT=5081"
set "EDGE_PORT=9333"
set "EDGE_WAIT_SEC=60"
set "SERVER_WAIT_SEC=60"
set "APP_LOG_WAIT_SEC=90"
set "RUN_SERVER_STDOUT=logs\run_server_stdout_%LOG_DATE%_%LOG_TIME%.log"
set "RUN_SERVER_STDERR=logs\run_server_stderr_%LOG_DATE%_%LOG_TIME%.log"

echo ================================================== >> "%LOG_FILE%"
echo [%date% %time%] RESTART_CLEAN.bat launched >> "%LOG_FILE%"
echo Working directory: %cd% >> "%LOG_FILE%"

if not exist "%EDGE_PROFILE_DIR%" mkdir "%EDGE_PROFILE_DIR%" >nul 2>&1

echo [%date% %time%] Cleaning stale pid/lock files... >> "%LOG_FILE%"
del /f /q "logs\v11.lock" >nul 2>&1
del /f /q "%SERVER_PID_FILE%" >nul 2>&1
del /f /q "%EDGE_PID_FILE%" >nul 2>&1
del /f /q "logs\health_status.json" >nul 2>&1

echo [%date% %time%] Stopping msedgedriver... >> "%LOG_FILE%"
powershell -NoProfile -Command "Get-Process msedgedriver -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >> "%LOG_FILE%" 2>&1

set "SERVER_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
    set "SERVER_LISTENER_PID=%%P"
    goto :server_listener_found
)
goto :after_server_stop

:server_listener_found
if defined SERVER_LISTENER_PID (
    echo [%date% %time%] Stopping server listener PID !SERVER_LISTENER_PID! on port %SERVER_PORT%. >> "%LOG_FILE%"
    taskkill /f /pid !SERVER_LISTENER_PID! /t >> "%LOG_FILE%" 2>&1
)

:after_server_stop

set "EDGE_LISTENER_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
    set "EDGE_LISTENER_PID=%%P"
    goto :edge_listener_found
)
goto :after_edge_stop

:edge_listener_found
if defined EDGE_LISTENER_PID (
    echo [%date% %time%] Stopping Edge listener PID !EDGE_LISTENER_PID! on port %EDGE_PORT%. >> "%LOG_FILE%"
    taskkill /f /pid !EDGE_LISTENER_PID! /t >> "%LOG_FILE%" 2>&1
)

:after_edge_stop

timeout /t 2 /nobreak >nul

set "EDGE_START_ATTEMPT=1"

:restart_edge_attempt
echo [%date% %time%] Starting Edge debug browser... attempt=!EDGE_START_ATTEMPT! >> "%LOG_FILE%"
powershell -NoProfile -Command "$profile='%EDGE_PROFILE_DIR%'; $p=Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList ('--remote-debugging-port=%EDGE_PORT% --user-data-dir=""' + $profile + '"" --profile-directory=""Default"" --disable-extensions --no-first-run --no-default-browser-check http://door.yl.co.kr/oms/main.jsp') -PassThru; Set-Content -Path '%cd%\%EDGE_PID_FILE%' -Value $p.Id; Write-Output ('Edge PID=' + $p.Id)" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo [%date% %time%] Failed to start Edge on attempt !EDGE_START_ATTEMPT!. >> "%LOG_FILE%"
    if "!EDGE_START_ATTEMPT!"=="1" (
        echo [%date% %time%] Retrying Edge launch after additional Youngrim-noext profile cleanup... >> "%LOG_FILE%"
        powershell -NoProfile -Command "$targets = Get-WmiObject Win32_Process | Where-Object { (($_.Name -eq 'msedge.exe') -or ($_.Name -eq 'msedgedriver.exe')) -and $_.CommandLine -like '*YoungrimAutoEdgeProfile_noext*' }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }" >> "%LOG_FILE%" 2>&1
        for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do taskkill /f /pid %%P /t >> "%LOG_FILE%" 2>&1
        timeout /t 2 /nobreak >nul
        set "EDGE_START_ATTEMPT=2"
        goto :restart_edge_attempt
    )
    call "%~dp0notify_failure.bat" "RESTART_CLEAN: failed to start Edge"
    exit /b 1
)

set "EDGE_READY="
for /l %%I in (1,1,%EDGE_WAIT_SEC%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do (
        set "EDGE_READY=%%P"
        goto :edge_ready
    )
    timeout /t 1 /nobreak >nul
)

if "!EDGE_START_ATTEMPT!"=="1" (
    echo [%date% %time%] Edge port %EDGE_PORT% did not open within %EDGE_WAIT_SEC%s on first attempt. Retrying once... >> "%LOG_FILE%"
    powershell -NoProfile -Command "$targets = Get-WmiObject Win32_Process | Where-Object { (($_.Name -eq 'msedge.exe') -or ($_.Name -eq 'msedgedriver.exe')) -and $_.CommandLine -like '*YoungrimAutoEdgeProfile_noext*' }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {} }" >> "%LOG_FILE%" 2>&1
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EDGE_PORT% .*LISTENING"') do taskkill /f /pid %%P /t >> "%LOG_FILE%" 2>&1
    timeout /t 2 /nobreak >nul
    set "EDGE_START_ATTEMPT=2"
    goto :restart_edge_attempt
)

echo [%date% %time%] Edge port %EDGE_PORT% did not open within %EDGE_WAIT_SEC%s after retry. >> "%LOG_FILE%"
call "%~dp0notify_failure.bat" "RESTART_CLEAN: Edge port %EDGE_PORT% did not open"
exit /b 1

:edge_ready
echo [%date% %time%] Edge port %EDGE_PORT% ready PID !EDGE_READY!. >> "%LOG_FILE%"
> "%EDGE_PID_FILE%" echo !EDGE_READY!

echo [%date% %time%] Starting run_server.py... >> "%LOG_FILE%"
echo [%date% %time%] stdout log: %RUN_SERVER_STDOUT% >> "%LOG_FILE%"
echo [%date% %time%] stderr log: %RUN_SERVER_STDERR% >> "%LOG_FILE%"
powershell -NoProfile -Command "$p = Start-Process -FilePath '.\.venv\Scripts\python.exe' -ArgumentList 'run_server.py' -WorkingDirectory '%cd%' -RedirectStandardOutput '%cd%\%RUN_SERVER_STDOUT%' -RedirectStandardError '%cd%\%RUN_SERVER_STDERR%' -PassThru; Set-Content -Path '%cd%\%SERVER_PID_FILE%' -Value $p.Id; Write-Output ('Server PID=' + $p.Id)" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo [%date% %time%] Failed to start run_server.py. >> "%LOG_FILE%"
    call "%~dp0notify_failure.bat" "RESTART_CLEAN: failed to start run_server.py"
    exit /b 1
)

set "SERVER_READY="
for /l %%I in (1,1,%SERVER_WAIT_SEC%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
        set "SERVER_READY=%%P"
        goto :server_ready
    )
    timeout /t 1 /nobreak >nul
)

echo [%date% %time%] Server port %SERVER_PORT% did not open within %SERVER_WAIT_SEC%s. >> "%LOG_FILE%"
call "%~dp0notify_failure.bat" "RESTART_CLEAN: server port %SERVER_PORT% did not open"
exit /b 1

:server_ready
echo [%date% %time%] Server port %SERVER_PORT% ready PID !SERVER_READY!. >> "%LOG_FILE%"
> "%SERVER_PID_FILE%" echo !SERVER_READY!

for /l %%I in (1,1,%APP_LOG_WAIT_SEC%) do (
    if exist "logs\app_%LOG_DATE%.json" goto :app_log_ready
    timeout /t 1 /nobreak >nul
)

echo [%date% %time%] WARNING: app_%LOG_DATE%.json not found after %APP_LOG_WAIT_SEC%s. >> "%LOG_FILE%"
call "%~dp0notify_failure.bat" "RESTART_CLEAN: app_%LOG_DATE%.json not found"
exit /b 1

:app_log_ready
echo [%date% %time%] app_%LOG_DATE%.json exists. >> "%LOG_FILE%"
echo [%date% %time%] RESTART_CLEAN completed >> "%LOG_FILE%"
exit /b 0
