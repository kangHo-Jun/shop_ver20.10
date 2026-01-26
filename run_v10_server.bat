@echo off
cd /d "%~dp0"
call .venv\Scripts\activate
python v10_auto_server.py
pause
