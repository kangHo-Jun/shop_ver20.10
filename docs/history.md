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
# 2026-05-14 장애 분석 및 복구 기록: 5/13 자동화 미시작

## 요약
- 2026-05-13 06:00 스케줄러는 실행됐지만 `run_server.py`가 실제로 시작되지 않아 `app_20260513.json`이 생성되지 않았다.
- 영림 OMS에는 5/13 데이터가 있었으나 자동화 루프가 돌지 않아 로컬 다운로드가 0건이었다.
- 2026-05-13 17:35 수동 재시작 후 서버가 정상 시작됐고, `2026-05-06 ~ 2026-05-13` 범위 재조회로 신규 17건을 다운로드했다.
- Google Sheets 업로드 결과는 17파일 / 193행 완료였다.

## 타임라인
- 2026-05-13 06:00: `START_SCHEDULED.bat` 실행 기록 생성.
- 2026-05-13 06:00: `app_20260513.json` 미생성. 실제 서버 미시작.
- 2026-05-13 17:00: `STOP_SCHEDULED.bat` 실행. 서버가 떠 있지 않은 상태에서 종료 루틴만 수행.
- 2026-05-13 17:34~17:35: 수동 재시작 시도.
- 2026-05-13 17:35:18: `run_server.py` 실제 시작 성공.
- 2026-05-13 17:37:16: 신규 17건 다운로드 완료.
- 2026-05-13 17:37:24: 193행 / 17파일 Google Sheets 업로드 완료.

## 확인된 원인
- `START_SCHEDULED.bat`에서 PowerShell `Start-Process`의 `RedirectStandardOutput`과 `RedirectStandardError`가 같은 파일로 지정되어 있었다.
- Windows PowerShell은 stdout/stderr를 같은 파일로 리다이렉트하는 `Start-Process` 호출을 허용하지 않아 06:00 실행 시 `run_server.py`가 시작되지 않았다.
- 스케줄러 로그에는 `START_SCHEDULED completed`가 남았지만, 실제 앱 로그와 영림 조회 로그는 없었다.

## 복구 및 정리
- `START_SCHEDULED.bat`의 stdout/stderr를 각각 `logs/run_server_stdout_YYYYMMDD.log`, `logs/run_server_stderr_YYYYMMDD.log`로 분리했다.
- 수동 재실행 후 5/13 누락분을 다운로드하고 Google Sheets 업로드까지 완료했다.
- 2026-05-14 점검 중 오래된 zombie `msedgedriver.exe` PID `4792`, `85344`를 종료했다.
- 현재 운용 중인 `msedgedriver.exe` PID `290812`는 유지했다.

## 후속 개선 과제
- 스케줄러 시작 후 `run_server.pid`만 보지 말고 PID 생존, `5081` listen, `app_YYYYMMDD.json` 생성 여부까지 확인해야 한다.
- `START_SCHEDULED completed`가 실제 앱 시작 성공을 의미하지 않으므로 성공/실패 로그를 명확히 분리해야 한다.
- Selenium 자동화 간 충돌 방지를 위해 프로젝트별 Edge 디버그 포트와 `user-data-dir`를 분리해야 한다.
- 오래된 `msedgedriver.exe` 잔여 프로세스가 다른 자동화에 간섭하지 않도록 시작 전/종료 후 점검 루틴을 추가해야 한다.

---

## 8. 2026-06-01 로직 수정 이력

- `run_server.py`
  - `faulthandler` 로그 활성화
  - sleep 대기 진입/heartbeat/종료 로그 추가
  - 종료 시그널 로그 추가
  - 사이클 완료 시각(`last_cycle_completed_at`) 기록 추가
- 반복 장애 분석 결과
  - `sleep` 자체가 직접 멈춤 원인이라기보다, 중복 인스턴스/잔존 프로세스/공유 Edge 세션 충돌 가능성이 더 높다고 판단
  - `2026-05-30 08:31` 배치는 실제로는 정상 다운로드/업로드 완료였음을 로그로 재확인
- 수동/보조 배치 입력 대기 기본 비활성화
  - `start_all.bat`
  - `start_edge_debug.bat`
  - `start_ready.bat`
  - `start_youngrim_browser.bat`
  - `run_v10_server.bat`
  - `kill_processes.bat`
- 위 배치들은 기본적으로 입력 대기를 하지 않고, 필요 시에만 `MANUAL_PROMPT=1` 일 때 `pause`/`choice` 가 동작하도록 수정
- stale 상태 정리 후 재기동
  - `run_server.pid = 91824`
  - `v11.lock = 91824`
  - `edge_9333.pid = 223448`
  - `127.0.0.1:5081`, `127.0.0.1:9333` listen 확인
  - 재기동 후 첫 사이클 정상 완료 확인

### 2026-06-02 추가 로직 수정
- `START_SCHEDULED.bat`
  - `run_server.pid` 확인보다 먼저 `127.0.0.1:5081` 리스너 PID 를 확인하도록 수정
  - `5081` 이 이미 listen 중이면 해당 PID 를 `logs/run_server.pid` 에 다시 기록하고 재기동을 스킵하도록 변경
  - PID 파일 읽기를 `set /p < file` 에서 `for /f` 방식으로 변경
- `STOP_SCHEDULED.bat`
  - PID 파일 기반 종료 후에도 `127.0.0.1:5081` 리스너 PID 를 fallback 으로 찾아 종료 시도하도록 수정
  - `run_server.pid`, `edge_9333.pid` 읽기를 `for /f` 방식으로 변경
- 해석 메모
  - 수동 `cmd /c START_SCHEDULED.bat` 실행에서 보인 `Input redirection is not supported` 메시지는 현재 Codex 비대화형 실행 환경 영향 가능성이 높음
  - 실제 스케줄러 실행(`2026-06-02 07:08`)은 `scheduler_20260602.log` 기준 정상 완료 확인
  - 오늘 로그는 기존 중복 인스턴스 흔적과 수동 샌드박스 실행 흔적이 섞여 있어, 청정 상태 판정은 다음 아침 로그에서 재확인 필요


---

## [2026-06-05] 기본 Edge 9333 선점으로 인한 다운로드 전면 중단

- `scheduler_20260605.log`: 06:00:04 `Aborted` 확인
  - PID 138204 `msedge.exe`가 `YoungrimAutoEdgeProfile` 없이 9333 선점
  - `START_SCHEDULED.bat` 프로필 검증 로직이 정상 차단
- 수동 로그인 후 `START.bat` 실행으로 복구 (13:34 사이클 재개)
- 오늘 1회분 다운로드 누락 (06:00 ~ 13:34 구간)

---

## [2026-07-21] 2026-07-20 오전 11시 이후 누락분 진단 및 복구

- 사용자 증상
  - `2026-07-20 오전 11시 이후 다운로드 파일이 없다`는 제보로 점검 시작
- 실제 확인 결과
  - `v10_state.json`, `v10_history.json` 마지막 갱신 시각은 `2026-07-20 11:06:28`
  - 다만 서버 자체는 즉시 죽지 않았고 `logs/app_20260720.json` 기준 `2026-07-20 15:21:43`까지 사이클 수행
  - `2026-07-20 15:53:14`, `2026-07-20 16:26:25`에 `[Cycle] Browser reconnect failed: Edge debug port 9333 is not available` 반복
  - `2026-07-20 17:00:10` 이후 `STOP_SCHEDULED.bat`가 서버와 Edge를 완전히 종료
  - 이후 watchdog은 장애를 감지했지만 `outside_window`로 자동복구를 건너뜀
  - watchdog 알림도 `HTTP 403`으로 실패

### 파일 기준 확인
- `2026-07-20` 파일은 총 6개 존재
  - 즉시 생성 4개
    - `2026-07-20_260720-055_산업.html`
    - `2026-07-20_260720-038_산업.html`
    - `2026-07-20_260720-022_임업.html`
    - `2026-07-20_260720-021_임업.html`
  - 누락 후 복구 2개
    - `2026-07-20_260720-483_산업.html`
    - `2026-07-20_260720-379_산업.html`
- `2026-07-21` 파일은 총 11개 존재
  - 모두 복구 사이클에서 회수

### 근본 원인
- `START_SCHEDULED.bat`가 살아 있는 서버와 별개로 Youngrim 전용 Edge를 반복 정리/재기동
- `run_server.py`는 Edge 재기동 후 5초만 기다렸다가 `9333` 미오픈 시 시작 실패 처리
- 결과적으로
  - Edge 준비 타이밍 레이스
  - 브라우저 세션 상실 후 재연결 실패
  - 17:00 정지 후 watchdog 복구 미실행
  가 겹치며 `2026-07-20 오후분`과 `2026-07-21 당일분` 다운로드가 제때 처리되지 못함

### 2026-07-21 조치
- `START_SCHEDULED.bat`
  - 살아 있는 서버가 있으면 재사용
  - Edge를 먼저 준비한 뒤 `run_server.py`를 시작하도록 순서 변경
  - Youngrim 전용 `9333`이 이미 정상 점유 중이면 그대로 재사용
  - 새 Edge 기동 후 최대 30초 동안 `9333` listen 확인
  - 새 서버 기동 후 최대 45초 동안 `5081` listen 확인
- `start_edge_debug.bat`
  - 전체 Edge 종료 대신 `YoungrimAutoEdgeProfile` / `9333` 관련 프로세스만 정리
  - Edge 실행 후 최대 30초 동안 `9333` listen 확인
- `run_server.py`
  - 브라우저 자동기동 후 5초 단발 대기 대신 최대 30초 동안 `9333` 오픈 대기

### 복구 결과
- 전용 Edge와 서버를 수동 복구 절차로 재기동
- 확인값
  - `9333 LISTENING PID 20668`
  - `5081 LISTENING PID 80112`
  - `run_server.pid = 80112`
  - `v11.lock = 80112`
  - `edge_9333.pid = 20668`
- 복구 직후 다운로드 재개 확인
  - `2026-07-21` 파일 11개 저장
  - `2026-07-20` 누락 파일 2개 추가 저장
  - 총 `13개` 신규 다운로드 후 업로드 완료

### 운영 메모
- 일부 최신 로그/파일이 `2026-07-22`로 기록되지만, 현재 기준일은 `2026-07-21`이다.
- 이는 시스템/세션 시간 불일치로 보이며, 이번 문서 기록은 실제 운영일 기준인 `2026-07-21` 장애로 정리한다.
- 후속 과제
  - watchdog 자동복구 시간창 재검토
  - watchdog Web App `HTTP 403` 원인 해결

## [2026-07-27] 손상된 운영 문서 UTF-8 재작성

- `docs/context.md`, `docs/bug_0210.md` 레거시 원본이 광범위한 인코딩 손상 상태라 직접 복원이 어렵다고 판단했다.
- `docs/context_legacy.md`, `docs/bug_0210_legacy.md` 로 원본을 보존하고, 검증 가능한 로그/코드/리뷰 추출본 기준으로 새 UTF-8 문서를 재작성했다.
- 목적은 손상 문서의 원문 복구가 아니라 현재 운영과 장애 대응에 필요한 사실을 안전하게 다시 문서화하는 것이었다.

## [2026-08-11] Edge hung 재진단 및 startup health probe 보강

- `Edge Not Responding` 상태가 실제 자동화 중단의 직접 원인인지 재진단했고, `9333` listen-only 판단과 stale `run_server.pid` 재사용이 장애를 길게 끌었다고 정리했다.
- `edge_debug_probe.py`를 추가하고 `START_SCHEDULED.bat`, `RESTART_CLEAN.bat`에 DevTools health probe와 stale PID 차단 로직을 넣어, hung Edge/debug session 재사용을 막았다.

## [2026-08-12] Selenium attach probe 기준으로 Edge health 판정 강화

- `9333`과 DevTools JSON 응답만으로는 정상 Edge를 보장하지 못한다는 점을 확인했고, 실제 attach 실패(`chrome not reachable`)가 반복된 장애 원인으로 재정리했다.
- `edge_attach_probe.py`를 추가하고 `START_SCHEDULED.bat`, `RESTART_CLEAN.bat`, `watchdog_check.py`를 보강해, 실제 Selenium attach 가능 여부와 더 긴 recovery timeout(`420s`)을 기준으로 복구 흐름을 조정했다.

## [2026-08-12] 재발 확인 후 재복구, 미해결 리스크 재정리

- 위 보강 이후에도 `chrome not reachable` 기반 attach 실패가 다시 재발했고, `9333`만 남는 half-alive 상태가 반복됨을 확인했다.
- Youngrim 전용 Edge debug 세션을 다시 정리한 뒤 `START_SCHEDULED.bat`로 재기동하여 `5081`, `9333`, DevTools probe, attach probe, `health_status.json=cycle_completed`까지 다시 복구했다.
- 다만 이번 조사로 아직 미해결인 축도 명확해졌다:
  - Edge attach failure의 재발 가능성
  - watchdog Web App 알림 `HTTP 403`
  - outside-window recovery 한계
  - host/log date drift

## [2026-08-12] 비정상 판정 시 직접 메일 알람 경로 추가

- `send_alert_email.py`를 추가해 watchdog 비정상 판정 시 직접 SMTP 메일도 시도하도록 했다.
- `notify_failure.bat`도 같은 메일 경로를 호출하도록 연결해, 배치 기반 실패 알림도 메일 발송을 시도할 수 있게 했다.
- 실제 발송에는 `.env`에 SMTP 설정(`ALERT_SMTP_*`)이 필요하다.

## [2026-08-13] 야간 장애 메일 알람 확인 및 hung Edge 정리 후 재복구

- watchdog 비정상 메일 알람 수신을 실제로 확인했고, 알람 본문이 `run_server.pid missing`, `5081 down`, stale `health_status`를 정확히 반영함을 확인했다.
- 같은 세션에서 hung automation Edge가 `9333`만 붙잡고 `5081`은 죽어 있는 반쪽 장애를 다시 확인했고, stuck Edge 정리 후 `START_SCHEDULED.bat`로 `9333`/`5081`/attach probe/다운로드-업로드 사이클까지 재복구했다.
- 단, 호스트 시계가 하루 앞서 있어 이번 복구 로그는 `20260814` 파일명으로 남았다.

## [2026-08-13] watchdog 로그인/승인 감지 기반 재설계 반영

- `watchdog_check.py`, `edge_attach_probe.py`에 로그인 페이지/승인 징후 감지, `health_status.json` 확장 필드, half-alive/attach 실패 누적 기반 복구 분기, 창 밖 attach-fail-only 유예 조건을 실제 코드로 반영했다.

## [2026-08-21] watchdog stale lock 재기동 직후 오탐 메일 분석 및 완화

- 증상
  - `2026-08-21 07:13:17`에 watchdog abnormal-state email이 추가로 도착했다.
  - 메일 본문 핵심 failure는 `v11.lock stale: pid=1452` 단독 항목이었다.
- 로그 기준 실제 흐름
  - `07:13:01` watchdog이 실제 장애를 감지했다.
    - `run_server.pid stale`
    - `server port 5081 not listening`
    - `v11.lock stale`
  - 같은 시각 watchdog이 `full_restart_clean`을 시작했다.
  - `07:13:07`~`07:13:17` 사이 `RESTART_CLEAN.bat`이 Edge/서버 재기동을 수행했다.
  - 그런데 `07:13:16` watchdog이 다시 한 번 돌면서, 재기동 과도 상태의 stale `v11.lock`만 보고 2차 메일을 보냈다.
  - 직후 `07:13:18` 새 `run_server.py`가 `5081` lock을 다시 획득했고, `07:13:27` Google Sheets 연결, `07:13:36` 첫 cycle 완료까지 정상 복구됐다.
- 원인 정리
  - watchdog은 `v11.lock` 안 PID가 살아 있지 않으면 즉시 `v11.lock stale` failure로 취급했다.
  - 재기동 직후 수 초 동안은 새 프로세스가 완전히 자리잡기 전이라 stale lock 판단이 잠깐 가능했다.
  - 이 짧은 과도 상태가 실제 1차 장애와 별개인 2차 알람 메일로 이어졌다.
- 수정 사항
  - `watchdog_check.py`
    - stale `v11.lock` 단독 상태는 더 이상 바로 failure로 취급하지 않는다.
    - `pid stale`, `5081 down`, `app log stale/missing`, `health stale` 중 하나라도 함께 있을 때만 stale lock failure로 본다.
  - `watchdog_check.py`
    - `WATCHDOG_RECOVERY_GRACE_MIN` 기본 `3`분을 추가했다.
    - 최근 recovery가 성공한 직후 grace 구간에서는 stale lock 같은 재기동 과도 상태 알람을 억제한다.
    - watchdog 출력 context에 `recovery_grace_active`, `recovery_grace_minutes_since`, `recent_recovery_reason`를 추가했다.
- 검증
  - 수정 후 `watchdog_check.py --no-alert` 결과 `OK: watchdog check passed`.
  - 현재 서버/Edge/app log/health 상태 모두 정상으로 확인됐다.
- 기대 효과
  - 실제 장애 1건에 대해 재기동 도중 `stale lock` 단독 메일이 한 번 더 가는 현상을 줄인다.
