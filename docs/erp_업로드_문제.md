# ERP 업로드 문제 진단 보고서

- **작성일**: 2026-02-27
- **서버**: V10 Auto Server (`v10_auto_server.py`)
- **관련 파일**: `erp_upload_automation_v2.py`

---

## 1. 증상

Dashboard(`http://localhost:5080`) 에서 `⬆ Upload Ledger` 버튼 클릭 시:

- ERP (Ecount) 브라우저 화면이 열리지 않음
- 업로드가 완료되지 않고 조용히 실패
- `Pending: 197` 이 그대로 유지됨

---

## 2. 원인 분석

### 2-1. 상태 불일치 (버튼 비활성화)

| 항목 | 상태 |
|------|------|
| Ledger `v10_state.json` | READY: 124개 ✅ |
| Estimate `v10_state.json` | FAILED: 45개 ❌ (READY: 0) |
| Dashboard `Pending` 표시 | 198 (디스크 파일 수 기반) |

버튼 활성화 조건:
```javascript
// v10_auto_server.py HTML_TEMPLATE (L268)
if (data.pending[type] > 0 && data.status[type + '_uploader_status'] === 'Idle') {
    btn.disabled = false;
}
```
→ `uploader_status`가 `'Running'`으로 고착되거나, Estimate의 READY가 0이면 비활성화됨.

### 2-2. 업로드 실행 시 Ecount 로그인 타임아웃

업로드 버튼을 눌렀을 때 실제 에러 (`logs/uploader/erp_upload_20260226_161917.log`):

```
[단계 1] Edge 브라우저 연결 (port 9333) → ✅ 성공
[단계 1] Ecount 로그인 시도 → ❌ 실패

[ERROR] 로그인 오류: Timeout 15000ms exceeded.
[ERROR] 로그인 실패 - 종료
```

**코드 위치** (`erp_upload_automation_v2.py` L330-333):
```python
self.page.wait_for_url(
    lambda url: not url.startswith('https://login.ecount.com/'),
    timeout=15000  # ← 15초 내 URL 미전환 시 TimeoutError 발생
)
```

**원인**: 로그인 버튼 클릭 후 Ecount 서버 응답 지연으로 15초 내에 URL이 전환되지 않음.

---

## 3. 해결 방법

### 즉시 해결 (수동)

1. Edge 브라우저에서 `https://login.ecount.com/Login` 직접 로그인
2. 세션 유지 상태에서 Dashboard → `⬆ Upload Ledger` 재클릭
3. `load_session()`이 기존 세션 재사용 → 로그인 단계 건너뜀

### 코드 수정 (Timeout 연장)

**파일**: `erp_upload_automation_v2.py` L333

```python
# Before
timeout=15000

# After
timeout=30000  # 30초로 연장
```

### Estimate FAILED → READY 복구

```python
# PowerShell에서 실행 (shop_50 폴더)
python -c "
import json
from datetime import datetime
with open('v10_state.json', 'r', encoding='utf-8') as f:
    state = json.load(f)
now = datetime.now().isoformat()
fixed = 0
for k, v in state.get('estimate', {}).items():
    if v['status'] == 'FAILED':
        v['status'] = 'READY'
        v['timestamps']['READY'] = now
        fixed += 1
with open('v10_state.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
print(f'Fixed {fixed} items: FAILED -> READY')
"
```

---

## 4. 재발 방지

| 항목 | 조치 |
|------|------|
| 로그인 타임아웃 | `timeout=30000` 으로 수정 |
| Estimate FAILED 누적 | 위 복구 스크립트 주기적 실행 또는 자동 재시도 로직 추가 |
| 업로더 상태 고착 | Dashboard → **🔄 Reset All Status** 클릭 |

---

## 5. 관련 로그 경로

| 파일 | 내용 |
|------|------|
| `logs/app_20260227.json` | V10 서버 전체 로그 |
| `logs/uploader/erp_upload_*.log` | ERP 업로더 상세 로그 |
| `v10_state.json` | 주문별 상태 (READY/FAILED/COMPLETED) |
