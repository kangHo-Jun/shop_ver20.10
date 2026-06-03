@echo off
cd /d "%~dp0"
call .venv\Scripts\activate
python v10_auto_server.py
if /I "%MANUAL_PROMPT%"=="1" pause
