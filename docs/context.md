# 🛠️ Project Context & Status (V10 Automation)

## 1. 프로젝트 현황 (Current State)
- **주요 목적**: 영림 OMS 시스템에서 견적(Estimate) 내역을 자동으로 다운로드(Python)하여, 회계 ERP 업로드용 형태로 가공한 뒤 Google Sheets로 업로드(GAS)하는 자동화 파이프라인.
- **현재 상태**: 안정화 단계 (정상 작동 중). 구글 드라이브 용량 초과 문제 해결 및 품목코드 파싱 버그(하이픈 잔존 현상) 해결을 완료하여 일시적인 업로드 중단 및 데이터 오류가 정상화됨.
- **주요 스택**: 
  - **백엔드/자동화**: Python (`run_server.py`), Playwright(Edge 브라우저 컨트롤)
  - **데이터 가공/적재**: Google Apps Script (`code_generation.gs`, `sheet_hub.gs`)

---

## 2. 완료된 기능 (Completed Features)
1. **OMS 자동 조회 및 다운로드**: 임업/산업 분야 지정일자 기준 주기적 단위 다운로드 및 중복/상태 관리(`state_manager`).
2. **Google Sheets 양방향 통신 및 업로드**: Python 백엔드에서 Google API를 경유하여 다운로드된 HTML 테이블을 파싱 후 시트로 업로드.
3. **품목명/품목코드 자동 생성 (코드화 로직)**:
   - ERP용 식별 코드를 생성하기 위해 원본 색상/품명/규격을 쪼개어 `브랜드/색상코드 + 플래그/모델코드 + 규격코드`의 3단계로 완벽히 조합.
   - 키워드 기반 카테고리 분류 (우선순위: `FRAME` > `RAIL` > `DOOR` > `MOLDING`).
   - 복잡한 모델명 예외 처리 (PS, PX, 한글 단축, 두께(MM) 기반 규격 산출 등).
4. **데이터 보존 로직**: 시트 용량 초과 방지를 위해 오늘(T)과 어제(T-1) 데이터만 남겨두고 과거 데이터는 자동 청소(`cleanupOldData`).

---

## 3. 남은 작업 및 개선 사항 (Remaining Tasks)
1. **GAS 단순 트리거(`onOpen`) 에러 해결**:
   - 현재 GAS 내부에서 단순 권한(`onOpen`)으로 다른 시트를 참조(`SpreadsheetApp.openById`)하려다 발생하는 권한 충돌 에러가 로그에 잔존함.
   - **조치 방안**: 사용자 메뉴 강제 생성이 필요하다면 **설치 가능한 트리거(Installable Trigger)**로 전환하거나 해당 접근 로직 제거.
2. **신규 품목명 예외 모니터링**:
   - 영림에서 새로운 형태의 코드명(예: 영문+숫자+특수기호 혼합 모델)을 출시할 경우 정규식에 걸리지 않을 수 있어, 추후 예외 로그 발생 시 정규식 패턴 추가 업데이트 필요.

---

## 4. 핵심 기술적 제약 사항 (Strict Technical Constraints)
### ⚠️ 절대 위반 금지 규칙
1. **하이픈(`-`) 제거 원칙**: ERP 시스템의 제약으로 인해 최종 품목코드(`finalCode`)에 하이픈이 절대 포함되어서는 안 됨. (현재 로직의 445라인 `.replace(/-/g, '')` 유지 必).
2. **품목 분류 우선순위 엄수**: `classifyTarget()` 로직에서 반드시 `문틀(FRAME) > 레일(RAIL) > 문짝(DOOR) > 몰딩(MOLDING)`의 검증 순서를 지켜야 함. 순서가 꼬이면 코드 분기가 완전히 틀어짐.
3. **구글 드라이브 용량 병목**: 시스템이 HTML 파일 다운로드와 복사본을 주기적으로 생성/삭제하므로, 구글 드라이브의 용량이 항상 1~2GB 이상 여유 있게 유지되어야 정상 작동함. 용량이 꽉 차면 Python-GAS 간 업로드 통신이 조용히 실패함.
4. **로직 모듈화 유지**: 코드를 수정할 때는 전체 `generateProductCode`를 건드리지 말고, 특정 타겟의 하위 함수(`generateBrandColorCode`, `generateModelCode` 등)만 원포인트로 수정할 것.

---

## 5. 2026-05-13 장애 기록: Selenium/Edge 자동화 충돌 가능성

### 상황 요약
- 2026-05-13 영림 OMS에는 데이터가 존재했지만, 로컬 `data/downloads`에는 5/13 다운로드 파일이 0개였다.
- `logs/scheduler_20260513.log`에는 06:00 `START_SCHEDULED.bat` 실행 기록이 있었지만, 정상 실행 시 생성되어야 할 `logs/app_20260513.json`이 없었다.
- `logs/sheet_reset_date.txt`도 `2026-05-12`에 머물러 있어, 5/13 자동화 루프가 실제로 시작되지 않았음을 확인했다.
- 수동 복구 후 `2026-05-06 ~ 2026-05-13` 범위로 재조회했고, 신규 17파일 / 193행을 Google Sheets에 업로드 완료했다. 이 중 5/13 파일은 7개였다.

### 직접 확인된 원인
- `START_SCHEDULED.bat`에서 PowerShell `Start-Process` 실행 시 `RedirectStandardOutput`과 `RedirectStandardError`를 같은 파일(`scheduler_YYYYMMDD.log`)로 지정하고 있었다.
- Windows PowerShell은 stdout/stderr를 같은 파일로 리다이렉트하는 `Start-Process` 호출을 허용하지 않아 `run_server.py`가 시작되지 않았다.
- 이 때문에 스케줄러는 "시작됨"처럼 보였지만 실제 앱 로그, 영림 조회, 다운로드, 업로드가 모두 실행되지 않았다.
- 임시 수정: stdout/stderr를 각각 `logs/run_server_stdout_YYYYMMDD.log`, `logs/run_server_stderr_YYYYMMDD.log`로 분리했다.

### 충돌 가능성이 높은 배경 원인
- 사용자가 2026-05-12에 다른 프로젝트의 Selenium 자동화를 건드렸고, 그 영향으로 이 프로젝트의 Edge/Selenium 세션이 깨졌을 가능성이 높다.
- 5/12 오후 로그에는 다음 유형의 문제가 반복됐다.
  - `브라우저 연결 끊김`
  - `Selenium ReadTimeoutError`
  - `브라우저 재연결 실패`
  - `no such window: target window already closed`
  - `web view not found`
- 이 프로젝트는 Edge 디버그 포트 `9333`과 Selenium EdgeDriver에 의존한다. 다른 자동화가 같은 포트, 같은 Edge 프로필, 같은 브라우저 세션을 공유하거나 종료하면 현재 프로젝트의 세션도 같이 깨질 수 있다.
- 점검 당시 `msedgedriver.exe` 잔여 프로세스가 여러 개 남아 있어, Selenium 실행 잔재 또는 다른 자동화와의 간섭 가능성이 있었다.

### 겪었던 문제
- 5/13 데이터 누락: 영림에는 데이터가 있었지만 로컬 다운로드 0건.
- 앱 로그 부재: `app_20260513.json`이 없어 run loop 진입 여부를 바로 확인하기 어려웠다.
- 스케줄러 로그 착시: `START_SCHEDULED completed`가 찍혀도 실제 `run_server.py` 시작 성공을 보장하지 않았다.
- 브라우저 세션 불안정: 5/12 오후부터 EdgeDriver timeout과 window closed 오류가 반복됐다.
- 정리 누락: 수동 종료 후에도 `v11.lock` 및 일부 Python/EdgeDriver 프로세스가 남을 수 있었다.

### 다음 개발 때 개선할 점
- 자동화별 Edge 디버그 포트를 분리한다.
  - 예: 이 프로젝트는 `9333`, 다른 프로젝트는 `9334`, 또 다른 프로젝트는 `9335`.
- 자동화별 Edge `user-data-dir`/프로필을 분리한다.
  - 같은 Edge 프로필을 여러 Selenium 자동화가 공유하지 않게 한다.
- `START_SCHEDULED.bat`에서 실제 `run_server.py` 생존 확인을 추가한다.
  - PID 파일 생성만 보지 말고, `app_YYYYMMDD.json` 생성 또는 lock port `5081` listen 여부까지 확인한다.
- 스케줄러 로그에 "앱 시작 성공/실패"를 명확히 남긴다.
  - `Start-Process` 실패, PID 없음, 앱 로그 미생성, Edge 포트 연결 실패를 모두 scheduler 로그에 기록한다.
- 브라우저/드라이버 잔여 프로세스 정리 절차를 강화한다.
  - 자동 시작 전 이 프로젝트가 소유한 `msedgedriver.exe`, stale `v11.lock`, stale `run_server.pid`를 안전하게 정리한다.
- 충돌 감지용 사전 점검을 추가한다.
  - 시작 전 `9333` 포트 점유 PID와 프로세스 경로를 기록한다.
  - 포트가 이미 열려 있으면 이 프로젝트가 띄운 Edge인지 확인하고, 아니면 시작을 중단하거나 별도 포트로 전환한다.
- 자동화 장애 알림을 추가한다.
  - 06:00 이후 일정 시간 안에 `app_YYYYMMDD.json`이 없거나 다운로드 사이클 로그가 없으면 경고를 남긴다.
- 다음 구현 전까지 운영상 주의:
  - 다른 프로젝트 Selenium을 실행할 때 이 프로젝트의 `9333` Edge 디버그 브라우저를 닫거나 공유하지 않는다.
  - 동시에 여러 자동화를 돌려야 하면 포트와 프로필을 먼저 분리한다.
