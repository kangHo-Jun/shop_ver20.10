# 영림 주문 자동화 시스템 V10

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Web%20UI-green.svg)](https://flask.palletsprojects.com/)
[![Google%20Sheets](https://img.shields.io/badge/Google%20Sheets-Hub-brightgreen.svg)](#)

영림 주문서 HTML/MHTML 데이터를 수집하고 변환한 뒤, **Google Sheet Hub** 방식으로 운영하는 자동화 시스템입니다.

---

## 핵심 특징
- 영림 OMS 주문/견적 자동 수집
- `local_file_processor.process_html_content()` 기반 변환
- `Sheet1` 자동 저장
- `Sheet2` append-only 누적 이력
- `Sheet3` 날짜/건수/파일명 로그
- 대시보드 `복사` / `완료` 버튼
- 1분 락 타임아웃 자동 해제

---

## 현재 운영 흐름
1. 주문 데이터를 다운로드합니다.
2. HTML/MHTML을 ERP 형식 행 데이터로 변환합니다.
3. 결과를 Google Sheets `Sheet1`에 자동 저장합니다.
4. 운영자가 대시보드에서 `복사`를 실행합니다.
5. 5초 뒤 `Sheet2`에 append-only 이력이 저장됩니다.
6. `완료` 실행 시 `Sheet1`이 비워지고 락이 해제됩니다.

---

## 주요 파일
- `v10_auto_server.py`: Flask 서버와 대시보드
- `local_file_processor.py`: HTML 파싱 및 변환 로직
- `google_sheet_hub.py`: 시트 허브 저장/이력/로그/락 처리
- `lock_manager.py`: 분산 락 보조 모듈
- `erp_upload_automation_v1.py`, `erp_upload_automation_v2.py`: 레거시 ERP 자동업로드 경로

---

## 실행 전 준비
- Python 3.10+
- Google OAuth 인증 파일
- `.env` 설정
- 영림 OMS 접속 가능한 브라우저 환경

---

## 문서
- `docs/PROJECT.md`
- `docs/process.md`
- `docs/USER_MANUAL.md`
- `docs/기능.md`

---

최종 업데이트: 2026-03-17
