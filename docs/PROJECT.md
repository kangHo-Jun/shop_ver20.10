# 영림-이카운트 통합 자동화 시스템(V10) 개요

본 문서는 시스템의 기술 구조, 데이터 흐름, 핵심 모듈 역할을 현재 코드 기준으로 정리한 프로젝트 개요입니다.

---

## 1. 프로젝트 목표
- **주문 수집 자동화**: 영림 OMS에서 주문서/견적서를 주기적으로 수집합니다.
- **ERP 입력 준비 자동화**: 수집한 HTML/MHTML 데이터를 ERP 형식 행 데이터로 변환합니다.
- **다중 PC 운영 안정화**: Google Sheets 기반 허브와 락으로 중복 처리와 충돌을 줄입니다.

---

## 2. 기술 스택

| 구분 | 기술 | 용도 |
| :--- | :--- | :--- |
| 언어 | Python 3.10+ | 전체 시스템 구현 |
| 웹 서버 | Flask | 대시보드 및 API |
| 브라우저 제어 | Selenium, Playwright | 다운로드/브라우저 자동화 |
| 데이터 허브 | Google Sheets API (`gspread`) | Sheet1/2/3 허브, 상태, 이력, 로그 |
| UI | HTML/CSS/JavaScript | Flask 대시보드 |

---

## 3. 핵심 아키텍처

### V10 분산 처리 구조
- Google Sheets를 중앙 허브로 사용합니다.
- `Sheet1`은 현재 처리 대상과 상태를 보관합니다.
- `Sheet2`는 append-only 누적 이력 시트입니다.
- `Sheet3`는 날짜/건수/파일명 로그를 기록합니다.
- `처리중` 상태는 락으로 간주하며, 1분 타임아웃 시 자동 해제됩니다.

### 주요 모듈
- **`v10_auto_server.py`**: Flask 서버, 대시보드, API, 업로드 트리거 진입점
- **`local_file_processor.process_html_content()`**: HTML 파싱과 ERP 행 데이터 변환의 실제 진입점 함수
- **`google_sheet_hub.py`**: Sheet1/Sheet2/Sheet3 저장, 상태 갱신, 이력/로그 기록, 락 처리
- **`lock_manager.py`**: 분산 락 관리 보조 모듈
- **`erp_upload_automation_v1.py` / `erp_upload_automation_v2.py`**: 기존 ERP 자동업로드 경로. 현재는 레거시 참조용

---

## 4. 데이터 흐름

1. **수집**: 다운로더가 영림 OMS에서 HTML/MHTML 파일을 수집합니다.
2. **상태 확인**: READY 상태 파일만 후속 처리 대상으로 잡습니다.
3. **변환**: `local_file_processor.process_html_content()`가 HTML을 ERP 행 데이터로 변환합니다.
4. **Sheet1 저장**: 변환 결과를 Google Sheets `Sheet1`에 자동 저장합니다.
5. **복사 및 처리중 상태**: 대시보드에서 복사 실행 시 클립보드 복사와 함께 상태가 `처리중`으로 전환됩니다.
6. **이력 적재**: 5초 후 동일 데이터를 `Sheet2`에 append-only 방식으로 누적합니다.
7. **완료 처리**: 완료 버튼 클릭 시 `Sheet1`을 비우고 상태를 `완료`로 바꾸며 락을 해제합니다.

---

## 5. 주요 기능

- **자동 HTML 파싱**: HTML/MHTML 주문 데이터를 ERP용 행 데이터로 변환
- **Google Sheet Hub 방식**: ERP 직접 업로드 대신 시트 허브 중심 처리
- **클립보드 복사 지원**: 운영자가 바로 붙여넣기 할 수 있도록 복사 버튼 제공
- **append-only 이력 관리**: 처리 결과를 `Sheet2`에 누적
- **로그 누적**: `Sheet3`에 날짜/건수/파일명을 저장
- **타임아웃 기반 락 해제**: 장시간 점유 시 자동 복구

---

작성: Antigravity AI  
최종 업데이트: 2026-03-17
