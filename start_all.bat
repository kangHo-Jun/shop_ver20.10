@echo off
chcp 65001 >nul
cd /d "C:\Users\DS-Sales0\shop_ver20"

echo ============================================================
echo   V10 서버 전체 시작
echo ============================================================
echo.

echo [1/5] 기존 프로세스 정리...
taskkill /F /IM python.exe /T 2>nul

echo.
echo [2/5] Edge 브라우저를 모두 닫아주세요.
echo       창을 닫은 후 아무 키나 누르세요...
pause >nul

echo.
echo [3/5] Edge 디버그 모드 실행 (영림 사이트 포함)...
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" ^
  --remote-debugging-port=9333 ^
  --user-data-dir="C:\Users\DS-Sales0\AppData\Local\Microsoft\Edge\User Data" ^
  --profile-directory="Default" ^
  http://door.yl.co.kr/oms/main.jsp

timeout /t 3 >nul

echo.
echo [4/5] 가상환경 활성화...
call .venv\Scripts\activate

echo.
echo [5/5] V10 서버 시작...
echo 대시보드: http://localhost:5080
echo.
python v10_auto_server.py
pause
