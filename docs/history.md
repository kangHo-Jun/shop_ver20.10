# ?곷┝-?댁뭅?댄듃 ?먮룞???쒖뒪??媛쒕컻 ?덉뒪?좊━

> 理쒖쥌 ?낅뜲?댄듃: 2026-03-31

---

## 紐⑹감

1. [踰꾩쟾蹂?蹂寃??대젰 (V1 ~ V10)](#1-踰꾩쟾蹂?蹂寃??대젰-v1--v10)
2. [V11: Google Sheet Hub 諛⑹떇 ?좉퇋 媛쒕컻](#2-v11-google-sheet-hub-諛⑹떇-?좉퇋-媛쒕컻)
3. [二쇱슂 踰꾧렇 諛??닿껐 怨쇱젙](#3-二쇱슂-踰꾧렇-諛??닿껐-怨쇱젙)
4. [?꾩옱 ?뺤젙??理쒖쥌 ?먮쫫](#4-?꾩옱-?뺤젙??理쒖쥌-?먮쫫)

---

## 1. 踰꾩쟾蹂?蹂寃??대젰 (V1 ~ V10)

### V1 ~ V3: 湲곗큹 ?먮룞??援ы쁽

- **紐⑺몴**: 濡쒖뺄 HTML/MHTML ?뚯씪 ?뚯떛 ??ERP ?낅젰???곗씠??蹂??- **二쇱슂 ?깃낵**
  - `local_file_processor.process_html_content()` ?듭떖 蹂??濡쒖쭅 援ы쁽
  - `erp_upload_automation_v1.py` 珥덇린 ERP ?먮룞?낅젰 ?먮쫫 援ы쁽
  - MHTML ?몄퐫??EUC-KR/UTF-8) 泥섎━ 濡쒖쭅 異붽?

### V4: ?대젰 諛??곹깭 愿由?
- **紐⑺몴**: 以묐났 泥섎━ 諛⑹?, 泥섎━ ?곹깭 異붿쟻
- **二쇱슂 ?깃낵**
  - `READY / COMPLETED / FAILED` ?곹깭 癒몄떊 ?꾩엯
  - 泥섎━ ?대젰 ?뚯씪(`v8_history.json`, `v10_history.json`) 遺꾨━

### V5 ~ V6: ????쒕낫???꾩엯

- **紐⑺몴**: CLI 以묒떖 ?먮쫫 ??Flask ??쒕낫??湲곕컲 ?뺤옣
- **二쇱슂 ?깃낵**
  - Flask ?쒕쾭(`v8_auto_server.py`) ?꾩엯, ?ы듃 5080
  - ?먮룞 ?ㅼ슫濡쒕뱶 ?ㅻ젅??+ ?섎룞 ?쒖뼱 踰꾪듉 援ы쁽
  - ??쒕낫??3珥??먮룞 媛깆떊

### V7 ~ V8: ERP ?낅젰 ?먮룞??媛뺥솕

- **紐⑺몴**: 寃ъ쟻/諛쒖＜ 耳?댁뒪 ?뺤옣, ?낅젰 ?덉젙??- **二쇱슂 ?깃낵**
  - 臾몄꽌 ?좏삎蹂?蹂??遺꾧린 媛뺥솕 (ledger 30??/ estimate 22??
  - ?대┰蹂대뱶 湲곕컲 遺숈뿬?ｊ린 ?먮룞??  - Avast Secure Browser + Selenium 議고빀 ?덉젙??
### V10: ?ㅼ쨷 PC + Google Sheet Hub ?꾪솚

- **紐⑺몴**: ?⑥씪 PC ?쒓퀎 洹밸났, 遺꾩궛 泥섎━ 吏??- **二쇱슂 ?깃낵**
  - Microsoft Edge ?붾쾭洹?紐⑤뱶(CDP ?ы듃 9333) ?꾪솚
  - `lock_manager.py` ?꾩엯: Google Sheets 湲곕컲 遺꾩궛 ??  - `ENABLE_DISTRIBUTED_LOCK` ?ㅼ젙?쇰줈 ??ON/OFF ?쒖뼱
  - `google_sheet_hub.py` ?꾩엯: Sheet1/2/3/4/5 ?덈툕 援ъ“
  - `pending_save` ?곹깭 癒몄떊 ?꾩엯

#### V10 二쇱슂 ?낅뜲?댄듃 ?댁뿭

| ?좎쭨 | ?댁슜 |
|------|------|
| 2026-01-13 | ?ㅼ슫濡쒕뱶 URL 4媛쒕줈 ?뺤옣 (?곗뾽/?꾩뾽 횞 ?먯옣/寃ъ쟻) |
| 2026-01-13 | Edge 湲곗〈 濡쒓렇???꾨줈???ъ궗?⑹쑝濡??ъ씤利?遺덊븘??|
| 2026-01-15 | 踰꾪듉 ?대┃ ???吏곸젒 URL ?ㅻ퉬寃뚯씠?섏쑝濡??앹뾽 李⑤떒 臾몄젣 ?닿껐 |
| 2026-01-15 | ?뚯씪紐?異⑸룎 諛⑹?: `{order_no}_{button_id}.html` ?뺤떇 ?꾩엯 |
| 2026-01-15 | Force Download 紐⑤뱶 (?좎쭨 ?꾪꽣 + ???대젰 bypass) 異붽? |
| 2026-01-15 | Flask ?ы듃 ?먮룞 ?뺣━ 濡쒖쭅 異붽? (`cleanup_port()`) |
| 2026-01-23 | 遺꾩궛 ??議곌굔遺 ?ㅽ뻾: `ENABLE_DISTRIBUTED_LOCK` ?ㅼ젙 諛섏쁺 |
| 2026-01-26 | ?쒖뒪???ъ뒪 紐⑤땲?곕쭅 移대뱶 異붽? (釉뚮씪?곗? ?곌껐, 濡쒓렇???곹깭) |
| 2026-01-26 | ?낅줈??????뺤씤 UI: `pending_save` ?곹깭 癒몄떊 ?꾩엯 |
| 2026-02-27 | ERP 濡쒓렇????꾩븘??15珥???30珥??곗옣 |

---

## 2. V11: Google Sheet Hub 諛⑹떇 ?좉퇋 媛쒕컻

> **Git ?쒓렇**: `V1_BASELINE` (commit `6b67eb1`)  
> **媛쒕컻 湲곌컙**: 2026-03 ~

### 2-1. 媛쒕컻 諛곌꼍

V10源뚯???ERP ?먮룞?낅줈??諛⑹떇(Playwright + ?대┰蹂대뱶 遺숈뿬?ｊ린)? Ecount 釉뚮씪?곗? ?먮룞?붿뿉 ?섏〈?섏뿬 遺덉븞?뺥뻽?? ?대? ?먭린?섍퀬 Google Sheets瑜?以묒떖 ?덈툕濡??ъ슜?섎뒗 諛⑹떇?쇰줈 ?꾪솚.

### 2-2. ?듭떖 ?꾪궎?띿쿂 蹂寃?
| 援щ텇 | V10 ?댁쟾 | V11 |
|------|----------|-----|
| ERP ?곗씠???꾨떖 | Playwright濡?Ecount 吏곸젒 議곗옉 | Google Sheets ???섎룞 Ctrl+C/V |
| ?대┰蹂대뱶 | `pyperclip` (text/plain) | GAS `setActiveRange` (?ㅼ씠?곕툕 text/html) |
| ?꾨즺 泥섎━ | 蹂꾨룄 ?꾨즺 踰꾪듉 | 蹂듭궗踰꾪듉 ?대┃ ??10珥??먮룞 ?대━??|
| 諛깆뾽 | ?놁쓬 | Sheet3/Sheet4 ?먮룞 諛깆뾽 + Sheet5 濡쒓렇 |

### 2-3. Google Sheets 援ъ“

| ?쒗듃 | ?⑸룄 |
|------|------|
| **Sheet1** | ?꾩옱 泥섎━ ????곗씠??(22?? ??~) + 硫뷀? (??~2) + ?ㅻ뜑 (??) |
| **Sheet2** | ?덈ぉ紐??덈ぉ肄붾뱶 異붿텧 紐⑸줉 (?댁뭅?댄듃 ?덈ぉ?깅줉?? |
| **Sheet3** | Sheet1 泥섎━ ?대젰 諛깆뾽 (append-only) |
| **Sheet4** | Sheet2 泥섎━ ?대젰 諛깆뾽 (append-only) |
| **Sheet5** | 泥섎━ ?좎쭨/嫄댁닔/?뚯씪紐?濡쒓렇 |

### 2-4. GAS (Google Apps Script) 援ъ“

**?뚯씪**: `GAS_Source/sheet_hub.gs`  
**clasp scriptId**: `1_tC2m887eruK-3LXLSJh1jxgnIskUKviXNE9QfLZ3pu6HTZf7_dUedgy`

| ?⑥닔 | ?숈옉 |
|------|------|
| `copySheet1()` | ?덈ぉ肄붾뱶(O?? 湲곗? ?뺣젹 ???좏깮 ??meta processing ??toast 10珥????먮룞 諛깆뾽/?대━??|
| `copySheet2()` | ?꾩껜 ?좏깮 ??meta processing ??toast 10珥????먮룞 諛깆뾽/?대━??|
| `sheetHubSyncExtractedItems()` | Sheet1 ?몄쭛 ??Sheet2 ?먮룞 ?숆린??(onEdit) |
| `sheetHubRefreshLockState()` | 留뚮즺 ???댁젣 + H1/H2 ?곹깭 媛깆떊 |

---

## 3. 二쇱슂 踰꾧렇 諛??닿껐 怨쇱젙

### BUG-01: 紐⑸줉 ?섏씠吏媛 ??λ맖 (2026-01-15)

- **利앹긽**: ?ㅼ슫濡쒕뱶??HTML???곸꽭 ?곗씠???놁쓬, ?뚯떛 0??- **?먯씤**: ?곷┝ OMS 踰꾪듉??`window.open()` ?앹뾽 ??Selenium ??李?誘멸컧吏
- **?닿껐**: 踰꾪듉 ?대┃ ???吏곸젒 URL 援ъ꽦 (`driver.get(detail_url)`)

### BUG-02: ?뚯씪紐?異⑸룎濡??곗씠????뼱?곌린 (2026-01-15)

- **利앹긽**: 媛숈? ?좎쭨 ?щ윭 二쇰Ц??1媛??뚯씪濡??⑹퀜吏?- **?먯씤**: `order_no`(?좎쭨 ?뺤떇) ?뚯씪紐???怨좎쑀???놁쓬
- **?닿껐**: `{order_no}_{button_id}.html` ?뺤떇 蹂寃?
### BUG-03: Flask ?ы듃 異⑸룎 (2026-01-15)

- **利앹긽**: ?쒕쾭 ?ъ떆????5080 ?ы듃 ?묒냽 遺덇?
- **?먯씤**: Windows ?꾨줈?몄뒪 醫낅즺 ??TCP ?몄뀡 利됱떆 誘명빐??- **?닿껐**: `cleanup_port()` ?⑥닔濡??먯쑀 ?꾨줈?몄뒪 ?먮룞 醫낅즺, ?꾩슂 ???쒖뒪???ъ떆??
### BUG-04: 遺꾩궛 ?쎌씠 ??긽 ?쒖꽦?붾맖 (2026-01-23)

- **利앹긽**: `ENABLE_DISTRIBUTED_LOCK=false` ?ㅼ젙?대룄 紐⑤뱺 二쇰Ц ?ㅽ궢
- **?먯씤**: ?ㅼ젙媛??뺤씤 ?놁씠 臾댁“嫄?`acquire_lock()` ?몄텧
- **?닿껐**: 紐⑤뱺 ???몄텧遺??`if config.ENABLE_DISTRIBUTED_LOCK:` 議곌굔 異붽?

### BUG-05: ERP 濡쒓렇????꾩븘??(2026-02-27)

- **利앹긽**: ?낅줈??踰꾪듉 ?대┃ ??Ecount ?붾㈃ 誘몄뿴由? 議곗슜???ㅽ뙣
- **?먯씤**: ?쒕쾭 ?묐떟 吏?곗쑝濡?15珥???URL ?꾪솚 遺덇?
- **?닿껐**: `timeout=15000` ??`timeout=30000` ?곗옣

### BUG-06: clasp ?섎せ??scriptId (2026-03)

- **利앹긽**: `clasp push` ?깃났?섏?留?援ш??쒗듃 GAS??諛섏쁺 ????- **?먯씤**: `.clasp.json`??`scriptId`媛 ?ㅻⅨ ?ㅽ겕由쏀듃瑜?媛由ы궡
- **?닿껐**: Extensions ??Apps Script URL?먯꽌 ?ㅼ젣 ID ?뺤씤 ???섏젙
- **援먰썕**: GAS 蹂寃?誘몃컲????媛??癒쇱? scriptId ?뺤씤

### BUG-07: GAS ?대┰蹂대뱶媛 text/plain?쇰줈 蹂듭궗??(2026-03)

- **利앹긽**: Ecount ?먮즺?щ━湲곗뿉??"?낅젰?섏떊 ?먮즺? ?먮즺?щ━湲??묒떇???쇱튂?섏? ?딆뒿?덈떎" 諛섎났
- **?먯씤 遺꾩꽍**:
  1. GAS HtmlService?먯꽌 `navigator.clipboard.writeText()` ??Permissions Policy 李⑤떒
  2. `document.execCommand('copy')` ??`text/plain`留?蹂듭궗 (Ecount??`text/html` ?꾩슂)
  3. Python `ctypes` Win32 API HTML ?대┰蹂대뱶 ?묒꽦 ??64鍮꾪듃 ?ъ씤??泥섎━ ???숈옉 ?뺤씤
  4. **理쒖쥌 寃곗젙**: ?꾨줈洹몃옒諛띿쟻 ?대┰蹂대뱶 諛⑹떇 ?꾨? ?먭린 ??GAS `setActiveRange()` + ?섎룞 Ctrl+C
- **援먰썕**: Ecount ?먮즺?щ━湲곕뒗 `text/html` ?꾩닔. ?섎룞 Ctrl+C留??뺤떎???숈옉

### BUG-08: GAS ?꾨즺踰꾪듉 ?숈옉 ????(2026-03)

- **利앹긽**: ?꾨즺踰꾪듉 ?대┃ ??"吏꾪뻾 以묒씤 蹂듭궗 ?묒뾽???놁뒿?덈떎" 諛섎났
- **?먯씤**: `meta.status !== 'processing'` 媛????Python `stage_and_copy()` ?놁씠???듦낵 遺덇?
- **?닿껐**: ?꾨즺踰꾪듉 ?먭린 ??蹂듭궗踰꾪듉??meta ?ㅼ젙 + 諛깆뾽/?대━???듯빀

---

## 4. ?꾩옱 ?뺤젙??理쒖쥌 ?먮쫫

### 4-1. ?꾩껜 ?쒖뒪???먮쫫

```
?곷┝ OMS (door.yl.co.kr)
  ??[V10 ?쒕쾭: Edge CDP ?곌껐, Selenium]
HTML 二쇰Ц???ㅼ슫濡쒕뱶 (4媛?URL: ?먯옣/寃ъ쟻 횞 ?곗뾽/?꾩뾽)
  ??[local_file_processor.py]
ERP ?뺤떇 22???곗씠???앹꽦
  ??[google_sheet_hub.py: stage_and_copy()]
Google Sheets Sheet1 湲곗엯 + Sheet2 ?덈ぉ ?숆린??  ???댁쁺?? 援ш??쒗듃 蹂듭궗踰꾪듉 ?대┃
  ??[GAS: copySheet1() ?먮뒗 copySheet2()]
?덈ぉ肄붾뱶 湲곗? ?뺣젹 + 踰붿쐞 ?좏깮 (setActiveRange)
meta ??processing + Toast "10珥????먮룞 ?대━??
  ???댁쁺?? Ctrl+C
  ???댁뭅?댄듃 ???대떦 硫붾돱 ???먮즺?щ━湲???Ctrl+V
  ??[10珥?寃쎄낵 ???먮룞]
Sheet3/Sheet4 諛깆뾽 + Sheet5 濡쒓렇 + ?대━??meta ??idle
```

### 4-2. GAS 蹂듭궗踰꾪듉 ?몃? ?숈옉

| ?④퀎 | Sheet1 蹂듭궗踰꾪듉 | Sheet2 蹂듭궗踰꾪듉 |
|------|-----------------|-----------------|
| 1 | ?덈ぉ肄붾뱶(O?? 湲곗? ?뺣젹 (鍮??????섎떒) | - |
| 2 | ?덈ぉ肄붾뱶 ?덈뒗 ?됰쭔 `setActiveRange` | ?꾩껜 ?곗씠??`setActiveRange` |
| 3 | meta ??`processing` | meta ??`processing` |
| 4 | Toast 10珥??쒖떆 | Toast 10珥??쒖떆 |
| 5 | `Utilities.sleep(10000)` | `Utilities.sleep(10000)` |
| 6 | Sheet3 諛깆뾽 + Sheet5 濡쒓렇 | Sheet4 諛깆뾽 + Sheet5 濡쒓렇 |
| 7 | Sheet1 ?대━??| Sheet2 ?대━??|
| 8 | meta ??`idle` | meta ??`idle` |

### 4-3. ?댁뭅?댄듃 ?낅젰 寃쎈줈

| 臾몄꽌 ?좏삎 | ?댁뭅?댄듃 硫붾돱 | ?곗씠???쒗듃 |
|-----------|---------------|-------------|
| 寃ъ쟻??| 寃ъ쟻?쒖엯??(E040201) | Sheet1 |
| 援щℓ?낅젰(?먯옣) | 援щℓ?낅젰 (E040303) | Sheet1 |
| ?덈ぉ?깅줉 | ?덈ぉ?깅줉 | Sheet2 |

### 4-4. ?듭떖 ?뚯씪 紐⑸줉

| ?뚯씪 | ??븷 |
|------|------|
| `v10_auto_server.py` | Flask ?쒕쾭, ??쒕낫?? ?ㅼ슫濡쒕뱶/?낅줈???몃━嫄?|
| `local_file_processor.py` | HTML ?뚯떛 ??ERP 22???곗씠??蹂??|
| `google_sheet_hub.py` | Sheet1/2/3/4/5 ?쎄린/?곌린, ?? 諛깆뾽 |
| `lock_manager.py` | 遺꾩궛 ??(Google Sheets 湲곕컲) |
| `GAS_Source/sheet_hub.gs` | 蹂듭궗踰꾪듉 濡쒖쭅, onEdit ?숆린?? ??媛깆떊 |

---

## 5. 추가 이슈 기록

### BUG-09: ESTIMATE 다건 다운로드가 1건만 처리됨 (2026-03-20)

- **증상**: 영림 사이트에 다운로드 가능한 ESTIMATE가 여러 건 있어도 1건만 내려받고 이후 건은 신규로 감지되지 않음
- **원인**: 중복 스킵 판정이 `order_no` 단위로 동작해, 같은 날짜 아래 다른 `button_id(ordno)`까지 이미 처리된 것으로 오인
- **문제 코드**
  - `run_server.py`: `any(k.startswith(order_no) for k in completed_keys)`
  - `v10_auto_server.py`: `any(k.startswith(order_no) for k in state_keys)`
- **해결**: 저장 키와 동일한 고유 키 `{order_no}_{button_id}` 기준으로 스킵 판정 수정
- **검증 결과**: 수정 후 ESTIMATE 추가 7건 정상 다운로드 및 Google Sheets `83행 / 7파일` 업로드 완료

### BUG-10: ESTIMATE 다운로드 스킵 로직 안정화 (2026-03-20)

- **배경**: BUG-09 수정 후 스킵 관련 코드 전체를 다시 진단해 잠재 누락 구간을 보완
- **확인된 리스크**
  - `run_server.py`가 `state`만 보고 `history` fallback을 보지 않아 상태 파일 유실 시 재다운로드 가능
  - 영림 목록이 2페이지 이상으로 늘어나면 기존 고정 URL 방식은 추가 페이지를 보지 못함
  - `button_id` 추출이 실패하면 상세 URL 복원 없이 해당 행을 놓칠 수 있음
- **조치**
  - `run_server.py`에 `load_history()` / `save_history()` 추가, `v10_auto_server.py`와 동일하게 `v10_history.json` 사용
  - 목록 HTML에서 pagination 링크와 page 계열 파라미터를 동적으로 수집해 마지막 페이지까지 BFS 순회
  - `button`, `a`, `href`, `onclick`, 속성 값, HTML 문자열까지 스캔해 `ordno` / `chulhano` / 상세 URL 추출 강화
  - 추출 실패 시 `{order_no}_ROWxxxxxxxxxx` 형식의 SHA1 fallback 키 생성
- **검증**
  - `python -m py_compile run_server.py v10_auto_server.py` 통과
  - Edge CDP 연결 후 영림 ESTIMATE 실조회 테스트 실행
  - 2026-03-20 기준 결과: 산업 9행, 임업 9행, 신규 다운로드 0건
  - pagination 탐지 결과 현재 운영 화면은 1페이지로 확인되어 `DETECTED_COUNT=1`

### BUG-11: ESTIMATE 목록 오인으로 다운로드 누락 (2026-03-23)

- **증상**: 영림 화면에는 ESTIMATE가 열려 있는데 자동화는 다운로드를 하지 못했고, 로그에는 `6 rows found`로 잘못 보임
- **원인**
  - 조회 조건이 `start_date=end_date=today`로 고정되어 오늘 자료만 조회
  - 목록 selector가 `table tbody tr` 전체를 잡아 실제 ESTIMATE 목록이 아닌 하단 마진/설정 테이블까지 행으로 집계
  - 실제 목록은 `Not found`인데도 하단 설정 행 때문에 다운로드 대상이 있는 것처럼 보이는 오진 발생
- **조치**
  - `run_server.py`, `v10_auto_server.py` 모두 최근 7일 조회로 자동 확장
  - 실제 다운로드 버튼/`ordno`가 있는 행만 `actionable rows`로 집계하도록 selector 수정
  - 로그에 `filters`와 `actionable rows`를 함께 남기도록 개선
- **검증 결과**
  - 수정 후 실제 조회 결과: 산업 33건, 임업 30건
  - 수동 다운로드 검증 결과: 총 23건 다운로드 시도
  - 현재 상태: `COMPLETED 39`, `READY 21`
- **잔여 리스크**
  - 산업/임업 양쪽에 동일 `ordno`가 존재할 경우 현재 키 체계에서 충돌 가능성 존재
  - 후속으로 `younglim_gubun`까지 포함한 고유 키 필요

### BUG-12: Windows 작업 스케줄러 6시 자동 시작 실패 (2026-03-24)

- **증상**: 월~토 06:00 자동 시작 스케줄이 등록되어 있으나 실제로 서버가 시작되지 않음. 수동 실행으로 대체
- **원인**
  - 작업 스케줄러에 등록된 실행 경로가 `C:\Users\DSAI\Downloads\files (2)\START.bat`로 잘못 지정됨
  - 해당 파일은 존재하지 않아 `LastTaskResult: 1` (실패)
  - `docs\윈도우_작업스케쥴\setup_scheduler.bat`이 Downloads 폴더에서 실행되어 `%~dp0START.bat` 경로가 잘못 해석됨
  - 추가로 `START.bat`에 `pause` 명령이 있어 스케줄러 실행 시 키 입력 대기로 영원히 멈춤
  - `START_SCHEDULED.bat`에는 Edge 브라우저 시작 로직이 없어, Edge 꺼진 상태에서 서버 시작 시 연결 실패
- **조치**
  - `setup_scheduler.bat` 재실행: 올바른 절대경로(`C:\Users\DSAI\Desktop\shop_ver20.10_new\START_SCHEDULED.bat`)로 재등록
  - `START_SCHEDULED.bat` 보강: 기존 프로세스 정리 → Edge 디버그 모드 시작 → 10초 대기 → `run_server.py` 실행
  - `STOP_SCHEDULED.bat` 경로도 올바르게 재등록 확인
- **검증**: 스케줄러 XML 확인 결과 올바른 경로로 등록 완료. 다음 실행 예정: 2026-03-25 06:00
- **주의사항**: `InteractiveToken` 모드이므로 사용자 로그인 상태에서만 실행됨

### BUG-13: 스케줄 배치가 다른 Python/Edge 작업까지 종료할 수 있음 (2026-03-24)

- **증상**: 자동 시작/정지 배치가 이 프로젝트와 무관한 다른 `python.exe`, `pythonw.exe`, `msedge.exe`까지 강제 종료할 가능성 존재
- **원인**
  - `START_SCHEDULED.bat`가 전체 `python.exe`, `pythonw.exe`, `msedge.exe`를 대상으로 `taskkill` 수행
  - `STOP_SCHEDULED.bat`도 모든 `python.exe` / `pythonw.exe`를 종료하는 구조
- **영향 리스크**
  - 다른 Python 자동화/개발 작업 중단 가능
  - 일반 Edge 브라우저 세션까지 강제 종료 가능
- **조치**
  - `START_SCHEDULED.bat` / `STOP_SCHEDULED.bat`를 PID 기반 제어로 변경
  - `run_server.py` PID를 `logs/run_server.pid`에 저장하고 종료 시 해당 PID만 정지
  - Edge 디버그 브라우저 PID를 `logs/edge_9333.pid`에 저장하고 종료 시 해당 PID만 정지
  - Edge는 `%LOCALAPPDATA%\\YoungrimAutoEdgeProfile` 전용 프로필로 분리
  - `9333` 포트가 이미 열려 있으면 기존 디버그 브라우저를 재사용
- **결론**: 현재 수정본 기준으로는 이 프로젝트가 시작한 서버/브라우저만 제어하며, 다른 기능에 영향을 주지 않도록 안전화 완료

---

### BUG-14: run_server 중복 실행 및 로그 날짜 꼬임 방지 (2026-03-31)

- **증상**
  - `run_server.py` 프로세스가 여러 개 동시에 떠 있을 가능성이 확인됨
  - 오늘 로그가 `app_20260331.json`로 생성되지 않고 과거 `app_20260323.json`, `app_20260324.json`에 계속 기록됨
  - 운영 상태 확인 시 실제 서버 상태와 로그 파일 날짜가 맞지 않아 오판 가능성 발생
- **원인**
  - 서버 자체에 단일 인스턴스 보장이 없어 중복 기동을 막지 못함
  - 파일 로거가 시작 시점의 날짜 파일만 열고 유지해 자정 이후에도 같은 파일에 계속 기록
- **조치**
  - `run_server.py`에 단일 인스턴스 락 추가
  - `run_server.py`가 직접 `logs/run_server.pid`를 기록/정리하도록 보강
  - `logging_config.py`를 일별 파일 전환 방식으로 수정해 `app_YYYYMMDD.json` 자동 롤오버 적용
- **기대 효과**
  - 중복 사이클 실행 및 운영 혼선 감소
  - 날짜별 운영 로그 분리로 장애 추적성 향상
  - 스케줄러 PID 기반 정지와 서버 PID 관리 일관성 확보
- **검증**
  - `python -m py_compile run_server.py logging_config.py` 통과
  - 코드 반영 완료, 실제 효과는 다음 재시작 이후 운영 로그에서 확인 예정

*작성: Antigravity AI / 최종 업데이트: 2026-03-31*

---

## 6. 2026-04-02 로직 수정 이력

- `google_sheet_hub.py`의 `Sheet1 _write_sheet1_rows()`를 전체 clear 후 덮어쓰기 방식에서 append 방식으로 변경
- `google_sheet_hub.py`의 `complete()`를 `complete(force_clear=False)`로 변경하고, 기본 호출 시 `Sheet1`을 비우지 않도록 수정
- `run_server.py`에 `logs/sheet_reset_date.txt` 기반 일일 초기화 로직 추가
- 날짜가 바뀌면 사이클 시작 시 `Sheet10`, `Sheet11` 데이터 영역을 자동 clear 하고 같은 날짜에는 재실행 시 clear 하지 않도록 수정
- `google_sheet_hub.py`의 `Sheet10` 쓰기 포맷을 `[saved_at, file_names, 기존 raw row]`로 변경
- `google_sheet_hub.py`의 `Sheet11` 쓰기 포맷을 `[saved_at, file_names, item_name, item_code]`로 변경
- `Sheet10`, `Sheet11` 헤더 구조를 GAS 정의와 동일하게 보장하도록 보강

*최종 업데이트: 2026-04-02*

---

## 7. 2026-04-07 로직 수정 이력

- `google_sheet_hub.py`에서 `pyperclip` 의존성 제거
- 클립보드 복사는 운영 핵심 기능이 아니므로 업로드 경로에서 완전히 제거
- `import pyperclip` 및 관련 복사 코드 삭제
- 제거 후 업로드 루틴이 클립보드 상태와 무관하게 진행되도록 안정성 향상

*최종 업데이트: 2026-04-07*
- `run_server.py` 업로드 성공 경로에 `sheet_hub.complete(force_clear=False)` 호출 추가
- `complete(force_clear=False)` 호출로 `Sheet4` 백업과 `Sheet5` 완료 기록이 자동 운영 경로에서도 남도록 수정
- `google_sheet_hub.py stage_and_copy()`에 `Sheet1` 메타 `file_names` 기준 중복 append 방지 로직 추가
- 동일 배치가 다시 들어오면 `Sheet1` append를 스킵하고 로그만 남기도록 수정
- `run_server.py`에서 업로드 성공 직후 `sheet_hub.complete(force_clear=False)` 호출 추가
- 자동 운영 경로에서도 `Sheet4` 백업과 `Sheet5` 완료 기록이 남도록 수정
- `google_sheet_hub.py stage_and_copy()`에 동일 `file_names` 배치 중복 append 방지 로직 추가
- 같은 배치 재처리 시 `Sheet1` append를 스킵하도록 수정
- `Sheet10` 레이아웃 이상으로 append 결과가 비가시 영역에 들어가던 문제 확인
- `Sheet10` 범위를 정상화하고 오늘 `07:22` 배치의 unmapped 5행을 가시 영역으로 복원
- `pyperclip` 제거, `complete()` 호출 추가, Sheet1 중복 방지, Sheet10 복원까지 반영 후 현재 운영 정상 확인
