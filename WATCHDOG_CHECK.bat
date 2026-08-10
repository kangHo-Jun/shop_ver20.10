@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist logs mkdir logs

set "PYTHON_EXE=.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

"%PYTHON_EXE%" watchdog_check.py >> "logs\watchdog_runner.log" 2>&1
exit /b %errorlevel%
