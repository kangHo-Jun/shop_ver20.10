@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist logs mkdir logs

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "LOG_DATE=%%I"
set "APP_LOG=logs\app_%LOG_DATE%.json"

if not exist "%APP_LOG%" (
    call "%~dp0notify_failure.bat" "health_check: missing %APP_LOG%"
    exit /b 1
)

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

exit /b 0
