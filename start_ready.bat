@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM V10 통합 실행 준비 스크립트 (start_ready.bat)
REM 1. 기존 Python 및 Edge 프로세스 정리
REM 2. 자동화용 Edge 브라우저(Port 9333) 디버그 모드 실행
REM ============================================================

echo ============================================================
echo   V10 System Ready: Environment Setup
echo ============================================================
echo.

REM [1/3] 기존 프로세스 정리
echo [1/3] 🧹 기존 프로세스 및 환경 정리 중...
echo.

REM Python 프로세스 종료
taskkill /F /IM python.exe /T >NUL 2>&1
if "!ERRORLEVEL!"=="0" (
    echo [OK] 기존 Python 서버를 종료했습니다.
) else (
    echo [INFO] 실행 중인 Python 프로세스가 없습니다.
)

REM msedge.exe 종료 (9333 포트 및 유저 데이터 락 해제용)
taskkill /F /IM msedge.exe /T >NUL 2>&1
if "!ERRORLEVEL!"=="0" (
    echo [OK] 기존 Edge 브라우저를 종료했습니다.
)

REM 포트 9333 강제 점유 확인 및 정리
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9333') do (
    taskkill /F /PID %%a >NUL 2>&1
    echo [OK] 9333 포트를 점유하던 프로세스(PID %%a)를 정리했습니다.
)

timeout /t 2 /nobreak >NUL
echo.
echo [OK] 환경 정리 완료.
echo.

REM [2/3] 디버그 모드로 Edge 브라우저 실행
echo [2/3] 🌐 Edge 브라우저(Port 9333) 실행 중...
echo.

REM Edge 실행 경로 (표준 경로)
set EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

start "" "%EDGE_PATH%" ^
  --remote-debugging-port=9333 ^
  --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\User Data" ^
  --profile-directory="Default" ^
  --no-first-run ^
  --no-default-browser-check ^
  http://door.yl.co.kr/oms/main.jsp

echo.
echo ============================================================
echo [성공] 통합 준비가 완료되었습니다!
echo ============================================================
echo.
echo 다음 단계:
echo 1. 브라우저에서 영림 사이트에 로그인하세요.
echo 2. V10 서버(start_prod.bat 등)를 실행하세요.
echo.
echo ※ 이 브라우저 창은 닫지 마세요 (자동화 제어용).
echo ============================================================
echo.
pause
