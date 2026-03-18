# 영림-이카운트 자동화 시스템 개발 히스토리

> 최종 업데이트: 2026-03-18

---

## 목차

1. [버전별 변경 이력 (V1 ~ V10)](#1-버전별-변경-이력-v1--v10)
2. [V11: Google Sheet Hub 방식 신규 개발](#2-v11-google-sheet-hub-방식-신규-개발)
3. [주요 버그 및 해결 과정](#3-주요-버그-및-해결-과정)
4. [현재 확정된 최종 흐름](#4-현재-확정된-최종-흐름)

---

## 1. 버전별 변경 이력 (V1 ~ V10)

### V1 ~ V3: 기초 자동화 구현

- **목표**: 로컬 HTML/MHTML 파일 파싱 → ERP 입력용 데이터 변환
- **주요 성과**
  - `local_file_processor.process_html_content()` 핵심 변환 로직 구현
  - `erp_upload_automation_v1.py` 초기 ERP 자동입력 흐름 구현
  - MHTML 인코딩(EUC-KR/UTF-8) 처리 로직 추가

### V4: 이력 및 상태 관리

- **목표**: 중복 처리 방지, 처리 상태 추적
- **주요 성과**
  - `READY / COMPLETED / FAILED` 상태 머신 도입
  - 처리 이력 파일(`v8_history.json`, `v10_history.json`) 분리

### V5 ~ V6: 웹 대시보드 도입

- **목표**: CLI 중심 흐름 → Flask 대시보드 기반 확장
- **주요 성과**
  - Flask 서버(`v8_auto_server.py`) 도입, 포트 5080
  - 자동 다운로드 스레드 + 수동 제어 버튼 구현
  - 대시보드 3초 자동 갱신

### V7 ~ V8: ERP 입력 자동화 강화

- **목표**: 견적/발주 케이스 확장, 입력 안정화
- **주요 성과**
  - 문서 유형별 변환 분기 강화 (ledger 30열 / estimate 22열)
  - 클립보드 기반 붙여넣기 자동화
  - Avast Secure Browser + Selenium 조합 안정화

### V10: 다중 PC + Google Sheet Hub 전환

- **목표**: 단일 PC 한계 극복, 분산 처리 지원
- **주요 성과**
  - Microsoft Edge 디버그 모드(CDP 포트 9333) 전환
  - `lock_manager.py` 도입: Google Sheets 기반 분산 락
  - `ENABLE_DISTRIBUTED_LOCK` 설정으로 락 ON/OFF 제어
  - `google_sheet_hub.py` 도입: Sheet1/2/3/4/5 허브 구조
  - `pending_save` 상태 머신 도입

#### V10 주요 업데이트 내역

| 날짜 | 내용 |
|------|------|
| 2026-01-13 | 다운로드 URL 4개로 확장 (산업/임업 × 원장/견적) |
| 2026-01-13 | Edge 기존 로그인 프로필 재사용으로 재인증 불필요 |
| 2026-01-15 | 버튼 클릭 대신 직접 URL 네비게이션으로 팝업 차단 문제 해결 |
| 2026-01-15 | 파일명 충돌 방지: `{order_no}_{button_id}.html` 형식 도입 |
| 2026-01-15 | Force Download 모드 (날짜 필터 + 락/이력 bypass) 추가 |
| 2026-01-15 | Flask 포트 자동 정리 로직 추가 (`cleanup_port()`) |
| 2026-01-23 | 분산 락 조건부 실행: `ENABLE_DISTRIBUTED_LOCK` 설정 반영 |
| 2026-01-26 | 시스템 헬스 모니터링 카드 추가 (브라우저 연결, 로그인 상태) |
| 2026-01-26 | 업로드 저장 확인 UI: `pending_save` 상태 머신 도입 |
| 2026-02-27 | ERP 로그인 타임아웃 15초 → 30초 연장 |

---

## 2. V11: Google Sheet Hub 방식 신규 개발

> **Git 태그**: `V1_BASELINE` (commit `6b67eb1`)  
> **개발 기간**: 2026-03 ~

### 2-1. 개발 배경

V10까지의 ERP 자동업로드 방식(Playwright + 클립보드 붙여넣기)은 Ecount 브라우저 자동화에 의존하여 불안정했음. 이를 폐기하고 Google Sheets를 중심 허브로 사용하는 방식으로 전환.

### 2-2. 핵심 아키텍처 변경

| 구분 | V10 이전 | V11 |
|------|----------|-----|
| ERP 데이터 전달 | Playwright로 Ecount 직접 조작 | Google Sheets → 수동 Ctrl+C/V |
| 클립보드 | `pyperclip` (text/plain) | GAS `setActiveRange` (네이티브 text/html) |
| 완료 처리 | 별도 완료 버튼 | 복사버튼 클릭 후 10초 자동 클리어 |
| 백업 | 없음 | Sheet3/Sheet4 자동 백업 + Sheet5 로그 |

### 2-3. Google Sheets 구조

| 시트 | 용도 |
|------|------|
| **Sheet1** | 현재 처리 대상 데이터 (22열, 행5~) + 메타 (행1~2) + 헤더 (행4) |
| **Sheet2** | 품목명/품목코드 추출 목록 (이카운트 품목등록용) |
| **Sheet3** | Sheet1 처리 이력 백업 (append-only) |
| **Sheet4** | Sheet2 처리 이력 백업 (append-only) |
| **Sheet5** | 처리 날짜/건수/파일명 로그 |

### 2-4. GAS (Google Apps Script) 구조

**파일**: `GAS_Source/sheet_hub.gs`  
**clasp scriptId**: `1_tC2m887eruK-3LXLSJh1jxgnIskUKviXNE9QfLZ3pu6HTZf7_dUedgy`

| 함수 | 동작 |
|------|------|
| `copySheet1()` | 품목코드(O열) 기준 정렬 → 선택 → meta processing → toast 10초 → 자동 백업/클리어 |
| `copySheet2()` | 전체 선택 → meta processing → toast 10초 → 자동 백업/클리어 |
| `sheetHubSyncExtractedItems()` | Sheet1 편집 시 Sheet2 자동 동기화 (onEdit) |
| `sheetHubRefreshLockState()` | 만료 락 해제 + H1/H2 상태 갱신 |

---

## 3. 주요 버그 및 해결 과정

### BUG-01: 목록 페이지가 저장됨 (2026-01-15)

- **증상**: 다운로드된 HTML에 상세 데이터 없음, 파싱 0행
- **원인**: 영림 OMS 버튼이 `window.open()` 팝업 → Selenium 새 창 미감지
- **해결**: 버튼 클릭 대신 직접 URL 구성 (`driver.get(detail_url)`)

### BUG-02: 파일명 충돌로 데이터 덮어쓰기 (2026-01-15)

- **증상**: 같은 날짜 여러 주문이 1개 파일로 합쳐짐
- **원인**: `order_no`(날짜 형식) 파일명 → 고유성 없음
- **해결**: `{order_no}_{button_id}.html` 형식 변경

### BUG-03: Flask 포트 충돌 (2026-01-15)

- **증상**: 서버 재시작 후 5080 포트 접속 불가
- **원인**: Windows 프로세스 종료 후 TCP 세션 즉시 미해제
- **해결**: `cleanup_port()` 함수로 점유 프로세스 자동 종료, 필요 시 시스템 재시작

### BUG-04: 분산 락이 항상 활성화됨 (2026-01-23)

- **증상**: `ENABLE_DISTRIBUTED_LOCK=false` 설정해도 모든 주문 스킵
- **원인**: 설정값 확인 없이 무조건 `acquire_lock()` 호출
- **해결**: 모든 락 호출부에 `if config.ENABLE_DISTRIBUTED_LOCK:` 조건 추가

### BUG-05: ERP 로그인 타임아웃 (2026-02-27)

- **증상**: 업로드 버튼 클릭 시 Ecount 화면 미열림, 조용히 실패
- **원인**: 서버 응답 지연으로 15초 내 URL 전환 불가
- **해결**: `timeout=15000` → `timeout=30000` 연장

### BUG-06: clasp 잘못된 scriptId (2026-03)

- **증상**: `clasp push` 성공하지만 구글시트 GAS에 반영 안 됨
- **원인**: `.clasp.json`의 `scriptId`가 다른 스크립트를 가리킴
- **해결**: Extensions → Apps Script URL에서 실제 ID 확인 후 수정
- **교훈**: GAS 변경 미반영 시 가장 먼저 scriptId 확인

### BUG-07: GAS 클립보드가 text/plain으로 복사됨 (2026-03)

- **증상**: Ecount 자료올리기에서 "입력하신 자료와 자료올리기 양식이 일치하지 않습니다" 반복
- **원인 분석**:
  1. GAS HtmlService에서 `navigator.clipboard.writeText()` → Permissions Policy 차단
  2. `document.execCommand('copy')` → `text/plain`만 복사 (Ecount는 `text/html` 필요)
  3. Python `ctypes` Win32 API HTML 클립보드 작성 → 64비트 포인터 처리 후 동작 확인
  4. **최종 결정**: 프로그래밍적 클립보드 방식 전부 폐기 → GAS `setActiveRange()` + 수동 Ctrl+C
- **교훈**: Ecount 자료올리기는 `text/html` 필수. 수동 Ctrl+C만 확실히 동작

### BUG-08: GAS 완료버튼 동작 안 함 (2026-03)

- **증상**: 완료버튼 클릭 시 "진행 중인 복사 작업이 없습니다" 반복
- **원인**: `meta.status !== 'processing'` 가드 → Python `stage_and_copy()` 없이는 통과 불가
- **해결**: 완료버튼 폐기 → 복사버튼에 meta 설정 + 백업/클리어 통합

---

## 4. 현재 확정된 최종 흐름

### 4-1. 전체 시스템 흐름

```
영림 OMS (door.yl.co.kr)
  ↓ [V10 서버: Edge CDP 연결, Selenium]
HTML 주문서 다운로드 (4개 URL: 원장/견적 × 산업/임업)
  ↓ [local_file_processor.py]
ERP 형식 22열 데이터 생성
  ↓ [google_sheet_hub.py: stage_and_copy()]
Google Sheets Sheet1 기입 + Sheet2 품목 동기화
  ↓
운영자: 구글시트 복사버튼 클릭
  ↓ [GAS: copySheet1() 또는 copySheet2()]
품목코드 기준 정렬 + 범위 선택 (setActiveRange)
meta → processing + Toast "10초 후 자동 클리어"
  ↓
운영자: Ctrl+C
  ↓
이카운트 → 해당 메뉴 → 자료올리기 → Ctrl+V
  ↓ [10초 경과 후 자동]
Sheet3/Sheet4 백업 + Sheet5 로그 + 클리어
meta → idle
```

### 4-2. GAS 복사버튼 세부 동작

| 단계 | Sheet1 복사버튼 | Sheet2 복사버튼 |
|------|-----------------|-----------------|
| 1 | 품목코드(O열) 기준 정렬 (빈 행 → 하단) | - |
| 2 | 품목코드 있는 행만 `setActiveRange` | 전체 데이터 `setActiveRange` |
| 3 | meta → `processing` | meta → `processing` |
| 4 | Toast 10초 표시 | Toast 10초 표시 |
| 5 | `Utilities.sleep(10000)` | `Utilities.sleep(10000)` |
| 6 | Sheet3 백업 + Sheet5 로그 | Sheet4 백업 + Sheet5 로그 |
| 7 | Sheet1 클리어 | Sheet2 클리어 |
| 8 | meta → `idle` | meta → `idle` |

### 4-3. 이카운트 입력 경로

| 문서 유형 | 이카운트 메뉴 | 데이터 시트 |
|-----------|---------------|-------------|
| 견적서 | 견적서입력 (E040201) | Sheet1 |
| 구매입력(원장) | 구매입력 (E040303) | Sheet1 |
| 품목등록 | 품목등록 | Sheet2 |

### 4-4. 핵심 파일 목록

| 파일 | 역할 |
|------|------|
| `v10_auto_server.py` | Flask 서버, 대시보드, 다운로드/업로드 트리거 |
| `local_file_processor.py` | HTML 파싱 → ERP 22열 데이터 변환 |
| `google_sheet_hub.py` | Sheet1/2/3/4/5 읽기/쓰기, 락, 백업 |
| `lock_manager.py` | 분산 락 (Google Sheets 기반) |
| `GAS_Source/sheet_hub.gs` | 복사버튼 로직, onEdit 동기화, 락 갱신 |
| `config.py` | 전체 설정 중앙 관리 |

---

*작성: Antigravity AI / 최종 업데이트: 2026-03-18*
