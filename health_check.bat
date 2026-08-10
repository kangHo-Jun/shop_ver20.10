@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "APP_LOG=logs\app_%LOG_DATE%.json"
set "SERVER_PORT=5081"

set "SERVER_READY="
for /l %%N in (1,1,90) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%SERVER_PORT% .*LISTENING"') do (
        set "SERVER_READY=%%P"
        goto :server_ready
    )
    timeout /t 1 /nobreak >nul
)

call "%~dp0notify_failure.bat" "health_check: server port %SERVER_PORT% not listening"
exit /b 1

:server_ready

if not exist "%APP_LOG%" (
    for /l %%N in (1,1,90) do (
        if exist "%APP_LOG%" goto :app_log_exists
        timeout /t 1 /nobreak >nul
    )
)

if not exist "%APP_LOG%" (
    call "%~dp0notify_failure.bat" "health_check: missing %APP_LOG%"
    exit /b 1
)

:app_log_exists

for %%F in ("%APP_LOG%") do set "APP_LOG_SIZE=%%~zF"
if "%APP_LOG_SIZE%"=="0" (
    call "%~dp0notify_failure.bat" "health_check: zero-byte %APP_LOG%"
    exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "(Get-Item \"%cd%\%APP_LOG%\").LastWriteTime.ToString('yyyyMMdd')"') do set "APP_LOG_DATE=%%I"
if not "%APP_LOG_DATE%"=="%LOG_DATE%" (
    call "%~dp0notify_failure.bat" "health_check: stale log date for %APP_LOG% (last write %APP_LOG_DATE%, today %LOG_DATE%)"
    exit /b 1
)

set "MONITOR_WEBAPP_URL=https://script.google.com/macros/s/AKfycbw2u655TMN5MHz4udSKBFW9n69joOofTxPhbxCg6aJFIPqRR70SWJJMxzDSkQVvnNB0_g/exec"
powershell -NoProfile -Command ^
  "$url='%MONITOR_WEBAPP_URL%'; $body=@{system='???';status='???';message='??????'}; try { Invoke-RestMethod -Method Post -Uri $url -Body $body -TimeoutSec 20 | Out-Null } catch {}" >nul 2>&1

exit /b 0
