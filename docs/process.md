# 영림 주문 관리 자동화 시스템 개발 과정 기록

본 문서는 영림 주문서 HTML/MHTML 데이터를 수집하고, 변환한 뒤, 현재의 Google Sheet Hub 방식으로 운영하게 되기까지의 흐름을 정리한 기록입니다.

---

## 프로젝트 발전 과정

### [Step 1] V1 ~ V3: 기초 자동화 구현
- **목표**: 로컬에 저장된 HTML 파일을 파싱해 ERP 입력용 데이터로 변환
- **주요 성과**
  - `local_file_processor.process_html_content()`를 중심으로 기존 규칙 기반 품목 코드 변환 로직을 Python으로 이식
  - `erp_upload_automation_v1.py`를 통해 초기 ERP 자동입력 흐름 구현
- **문제와 해결**
  - MHTML 인코딩 이슈가 있었고, 디코딩/전처리 로직을 추가해 안정성을 높임

### [Step 2] V4: 이력 및 상태 관리
- **목표**: 중복 처리 방지와 처리 상태 추적
- **주요 성과**
  - 처리 이력 파일과 상태 파일을 분리해 READY/COMPLETED/FAILED 흐름 정착

### [Step 3] V5 ~ V6: 웹 대시보드 도입
- **목표**: CLI 중심 흐름을 Flask 대시보드 기반으로 확장
- **주요 성과**
  - Flask 서버와 대시보드 도입
  - 자동 다운로드 스레드와 수동 제어 버튼 구현

### [Step 4] V7 ~ V8: ERP 입력 자동화 강화
- **목표**: 견적/발주 케이스 확장과 입력 안정화
- **주요 성과**
  - 문서 유형별 변환 분기 강화
  - 클립보드 및 브라우저 자동화 안정성 개선

### [Step 5] V10: Google Sheet Hub 전환
- **목표**: 기존 ERP 자동업로드 중심 구조를 시트 허브 중심으로 전환
- **주요 성과**
  - 변환 결과를 `local_file_processor.process_html_content()`에서 만든 뒤 `Sheet1`에 자동 저장
  - `Sheet2`에 append-only 누적 이력 기록
  - `Sheet3`에 날짜/건수/파일명 로그 기록
  - 대시보드에서 `복사` / `완료` 버튼으로 운영 가능
  - `처리중` 락과 1분 타임아웃 자동 해제 규칙 반영

---

## 현재 기준 처리 흐름

1. 다운로더가 영림 OMS에서 HTML/MHTML 파일을 수집합니다.
2. READY 상태 파일을 선별합니다.
3. `local_file_processor.process_html_content()`가 변환 결과를 생성합니다.
4. 서버가 변환 결과를 Google Sheets `Sheet1`에 자동 저장합니다.
5. 운영자가 대시보드의 `복사` 버튼을 눌러 데이터를 클립보드로 가져갑니다.
6. 시스템은 상태를 `처리중`으로 표시하고, 5초 후 `Sheet2`에 누적 이력을 남깁니다.
7. 운영자가 `완료` 버튼을 누르면 `Sheet1`을 비우고 상태를 `완료`로 바꾸며 락을 해제합니다.

---

## 핵심 정리

- 과거 문서에 적힌 `transformer.py`는 현재 코드 기준 실제 모듈명이 아닙니다.
- 현재 변환 진입점은 `local_file_processor.process_html_content()`입니다.
- 현재 업로드 개념은 ERP 직접 업로드보다 Google Sheet Hub 저장 및 운영 흐름으로 바뀌었습니다.

---

작성일: 2026-03-17  
작성: Antigravity AI
