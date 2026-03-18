const SHEET_HUB = {
  spreadsheetId: '1oEyPMkRxIOKZ8DTS7KnwwSpxftgYO4HSIR1S06Pl2Kk',
  sheet1Name: 'Sheet1',
  sheet2Name: 'Sheet2',
  sheet3Name: 'Sheet3',
  sheet4Name: 'Sheet4',
  sheet5Name: 'Sheet5',
  sheet10Name: 'Sheet10',
  sheet11Name: 'Sheet11',
  tempCopySheetName: 'TempCopy',
  metaHeaders: ['status', 'processor', 'started_at', 'doc_type', 'file_names', 'row_count', 'completed_at'],
  sheet1Headers: [[
    'seq', 'customer_code', 'customer_name', 'date', 'warehouse', 'display_manager',
    'customer_manager', 'customer_phone', 'trade_type', 'payment_term', 'estimate_valid_until',
    'execution_base', 'receiver_info', 'no', 'item_code', 'item_name', 'qty',
    'unit_price', 'supply_amount', 'vat', 'total', 'note',
  ]],
  sheet2Headers: [['item_name', 'item_code']],
  sheet3Headers: [['copied_at', 'doc_type', 'processor', 'file_names', 'row_json']],
  sheet4Headers: [['copied_at', 'file_names', 'item_name', 'item_code']],
  sheet5Headers: [['date', 'count', 'file_names']],
  sheet10Headers: [['saved_at', 'file_names', 'seq', 'customer_code', 'customer_name', 'date', 'warehouse', 'display_manager',
    'customer_manager', 'customer_phone', 'trade_type', 'payment_term', 'estimate_valid_until',
    'execution_base', 'receiver_info', 'no', 'item_code', 'item_name', 'qty',
    'unit_price', 'supply_amount', 'vat', 'total', 'note']],
  sheet11Headers: [['saved_at', 'file_names', 'item_name', 'item_code']],
  dataStartRowSheet1: 5,
  dataStartRowSheet2: 2,
  sheet1CopyColumnCount: 22,
  sheet2CopyColumnCount: 2,
  sheet1ItemCodeIndex: 14,
  lockTimeoutMs: 60 * 1000,
  maxRowsPerUpload: 20,
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sheet Hub')
    .addItem('Refresh Lock State', 'sheetHubRefreshLockState')
    .addToUi();
  sheetHubEnsureStructure_();
  sheetHubRefreshLockState();
}

function onEdit(e) {
  const range = e && e.range ? e.range : null;
  if (!range) return;
  const sheet = range.getSheet();
  if (sheet.getName() !== SHEET_HUB.sheet1Name || range.getRow() < SHEET_HUB.dataStartRowSheet1) return;
  sheetHubSyncExtractedItems();
}

// ─── 시트 내 복사 버튼 ─────────────────────────────────────────────

function copySheet1() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_HUB.sheet1Name);

  const lastRow = sheet.getLastRow();
  if (lastRow < SHEET_HUB.dataStartRowSheet1) {
    ss.toast('Sheet1 데이터 없음', '', 3);
    return;
  }

  const numRows = lastRow - SHEET_HUB.dataStartRowSheet1 + 1;
  const numCols = 22;
  const dataRange = sheet.getRange(SHEET_HUB.dataStartRowSheet1, 1, numRows, numCols);
  const values = dataRange.getValues();

  // 품목코드(O열=index 14) 기준: 품목코드 있는 행 위, 빈 행 아래로 정렬
  const itemCodeIdx = SHEET_HUB.sheet1ItemCodeIndex;
  values.sort(function(a, b) {
    const aHas = String(a[itemCodeIdx]).trim() !== '';
    const bHas = String(b[itemCodeIdx]).trim() !== '';
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return 0;
  });
  dataRange.setValues(values);

  const filledCount = values.filter(function(row) {
    return String(row[itemCodeIdx]).trim() !== '';
  }).length;

  if (filledCount === 0) {
    ss.toast('품목코드 있는 행 없음', '', 3);
    return;
  }

  // 빈칸 행 → Sheet10에 저장
  const emptyRows = values.filter(function(row) {
    return String(row[itemCodeIdx]).trim() === '';
  });
  if (emptyRows.length) {
    const meta0 = sheetHubReadMeta_();
    sheetHubAppendSheet1Unmapped_(emptyRows, sheetHubNow_(), meta0.file_names || 'manual');
  }

  const existingMeta = sheetHubReadMeta_();
  sheetHubWriteMeta_({
    status: 'processing',
    processor: sheetHubActiveUser_(),
    started_at: sheetHubNow_(),
    doc_type: existingMeta.doc_type || 'manual',
    file_names: existingMeta.file_names || 'manual',
    row_count: String(filledCount),
    completed_at: '',
  });

  ss.setActiveSheet(sheet);
  sheet.setActiveRange(sheet.getRange(SHEET_HUB.dataStartRowSheet1, 1, filledCount, numCols));
  ss.toast('Ctrl+C 후 이카운트에 붙여넣기 하세요 (10초 후 자동 클리어)', '', 10);
  Utilities.sleep(10000);

  // 백업 + 로그 + 클리어
  const meta = sheetHubReadMeta_();
  const allRows = sheetHubReadSheet1Rows_();
  const copiedAt = sheetHubNow_();
  if (allRows.length) {
    sheetHubAppendSheet1Backup_(allRows, copiedAt, meta.doc_type || 'manual', sheetHubActiveUser_(), meta.file_names || 'manual');
    sheetHubAppendLog_(copiedAt, allRows.length, meta.file_names || 'manual');
  }
  sheetHubClearSheet1_();
  sheetHubWriteMeta_({
    status: 'idle', processor: '', started_at: '',
    doc_type: meta.doc_type, file_names: meta.file_names,
    row_count: '0', completed_at: copiedAt,
  });
}

function copySheet2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_HUB.sheet2Name);

  const lastRow = sheet.getLastRow();
  if (lastRow < SHEET_HUB.dataStartRowSheet2) {
    ss.toast('Sheet2 데이터 없음', '', 3);
    return;
  }

  const existingMeta = sheetHubReadMeta_();
  sheetHubWriteMeta_({
    status: 'processing',
    processor: sheetHubActiveUser_(),
    started_at: sheetHubNow_(),
    doc_type: existingMeta.doc_type || 'manual',
    file_names: existingMeta.file_names || 'manual',
    row_count: String(lastRow - SHEET_HUB.dataStartRowSheet2 + 1),
    completed_at: '',
  });

  // 빈칸 행(품목코드 없는 행) → Sheet11에 저장
  const allSheet2Rows = sheetHubReadSheet2Rows_();
  const emptySheet2Rows = allSheet2Rows.filter(function(row) {
    return String(row[1] || '').trim() === '';
  });
  if (emptySheet2Rows.length) {
    const meta0 = sheetHubReadMeta_();
    sheetHubAppendSheet2Unmapped_(emptySheet2Rows, sheetHubNow_(), meta0.file_names || 'manual');
  }

  ss.setActiveSheet(sheet);
  const dataRange = sheet.getRange(SHEET_HUB.dataStartRowSheet2, 1, lastRow - SHEET_HUB.dataStartRowSheet2 + 1, 2);
  sheet.setActiveRange(dataRange);
  ss.toast('Ctrl+C 후 이카운트에 붙여넣기 하세요 (10초 후 자동 클리어)', '', 10);
  Utilities.sleep(10000);

  // 백업 + 로그 + 클리어
  const meta = sheetHubReadMeta_();
  const rows = sheetHubReadSheet2Rows_();
  const copiedAt = sheetHubNow_();
  if (rows.length) {
    sheetHubAppendSheet2Backup_(rows, copiedAt, meta.file_names || 'manual');
    sheetHubAppendLog_(copiedAt, rows.length, meta.file_names || 'manual');
  }
  sheetHubClearSheet2_();
  sheetHubWriteMeta_({
    status: 'idle', processor: '', started_at: '',
    doc_type: meta.doc_type, file_names: meta.file_names,
    row_count: '0', completed_at: copiedAt,
  });
}

// ─── 기존 유지 함수들 ──────────────────────────────────────────

function sheetHubRefreshLockState() {
  sheetHubEnsureStructure_();
  sheetHubReleaseExpiredLock_();
  const meta = sheetHubReadMeta_();
  const message = meta.status === 'processing'
    ? 'processing: ' + (meta.processor || 'unknown') : 'idle';
  const sheet = sheetHubSheet1_();
  sheet.getRange('H1').setValue('button_state');
  sheet.getRange('H2').setValue(message);
}

function sheetHubSyncExtractedItems() {
  sheetHubEnsureStructure_();
  sheetHubWriteSheet2Rows_(sheetHubExtractItems_(sheetHubReadSheet1Rows_()));
}

function sheetHubEnsureStructure_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_HUB.spreadsheetId);
  const sheet1 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet1Name);
  const sheet2 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet2Name);
  const sheet3 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet3Name);
  const sheet4 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet4Name);
  const sheet5 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet5Name);

  if (!sheet1.getRange('A1').getValue()) {
    sheet1.getRange(1, 1, 2, SHEET_HUB.metaHeaders.length).setValues([
      SHEET_HUB.metaHeaders, ['', '', '', '', '', '', ''],
    ]);
  }
  if (!sheet1.getRange('A4').getValue()) sheet1.getRange('A4:V4').setValues(SHEET_HUB.sheet1Headers);
  if (!sheet2.getRange('A1').getValue()) sheet2.getRange('A1:B1').setValues(SHEET_HUB.sheet2Headers);
  if (!sheet3.getRange('A1').getValue()) sheet3.getRange('A1:E1').setValues(SHEET_HUB.sheet3Headers);
  if (!sheet4.getRange('A1').getValue()) sheet4.getRange('A1:D1').setValues(SHEET_HUB.sheet4Headers);
  if (!sheet5.getRange('A1').getValue()) sheet5.getRange('A1:C1').setValues(SHEET_HUB.sheet5Headers);

  const sheet10 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet10Name);
  const sheet11 = sheetHubSheet_(spreadsheet, SHEET_HUB.sheet11Name);
  if (!sheet10.getRange('A1').getValue()) sheet10.getRange(1, 1, 1, SHEET_HUB.sheet10Headers[0].length).setValues(SHEET_HUB.sheet10Headers);
  if (!sheet11.getRange('A1').getValue()) sheet11.getRange('A1:D1').setValues(SHEET_HUB.sheet11Headers);
}

function sheetHubReadMeta_() {
  const row = sheetHubSheet1_().getRange('A2:G2').getDisplayValues()[0];
  return {
    status: row[0] || 'idle', processor: row[1] || '', started_at: row[2] || '',
    doc_type: row[3] || '', file_names: row[4] || '', row_count: row[5] || '0', completed_at: row[6] || '',
  };
}

function sheetHubWriteMeta_(meta) {
  sheetHubSheet1_().getRange('A2:G2').setValues([[
    meta.status || 'idle', meta.processor || '', meta.started_at || '',
    meta.doc_type || '', meta.file_names || '', meta.row_count || '0', meta.completed_at || '',
  ]]);
}

function sheetHubReadSheet1Rows_() {
  return sheetHubReadSheet1RowEntries_().map(function(e) { return e.values; });
}

function sheetHubReadSheet1RowEntries_() {
  const sheet = sheetHubSheet1_();
  const lastRow = sheet.getLastRow();
  if (lastRow < SHEET_HUB.dataStartRowSheet1) return [];
  const values = sheet.getRange(
    SHEET_HUB.dataStartRowSheet1, 1,
    lastRow - SHEET_HUB.dataStartRowSheet1 + 1,
    SHEET_HUB.sheet1CopyColumnCount
  ).getDisplayValues();
  const entries = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i].join('').trim() !== '') {
      entries.push({ rowNumber: SHEET_HUB.dataStartRowSheet1 + i, values: values[i] });
    }
  }
  return entries;
}

function sheetHubReadSheet2Rows_() {
  const sheet = sheetHubSheet2_();
  const lastRow = sheet.getLastRow();
  if (lastRow < SHEET_HUB.dataStartRowSheet2) return [];
  return sheet.getRange(
    SHEET_HUB.dataStartRowSheet2, 1,
    lastRow - SHEET_HUB.dataStartRowSheet2 + 1,
    SHEET_HUB.sheet2CopyColumnCount
  ).getDisplayValues().filter(function(row) { return row.join('').trim() !== ''; });
}

function sheetHubBuildSheet1CopyRows_(entries) {
  return entries
    .filter(function(e) { return String(e.values[SHEET_HUB.sheet1ItemCodeIndex] || '').trim() !== ''; })
    .map(function(e) { return e.values; });
}

function sheetHubExtractItems_(rows) {
  return rows.map(function(row) { return [row[15] || '', row[14] || '']; })
    .filter(function(row) { return row[0] || row[1]; });
}

function sheetHubWriteSheet2Rows_(rows) {
  sheetHubClearSheet2_();
  if (!rows.length) return;
  sheetHubSheet2_().getRange(2, 1, rows.length, 2).setValues(rows);
}

function sheetHubAppendSheet1Backup_(rows, copiedAt, docType, processor, fileNames) {
  const backupRows = rows.map(function(row) {
    return [copiedAt, docType, processor, fileNames, JSON.stringify(row)];
  });
  const s = sheetHubSheet3_();
  s.getRange(s.getLastRow() + 1, 1, backupRows.length, 5).setValues(backupRows);
}

function sheetHubAppendSheet2Backup_(rows, copiedAt, fileNames) {
  const backupRows = rows.map(function(row) {
    return [copiedAt, fileNames, row[0] || '', row[1] || ''];
  });
  const s = sheetHubSheet4_();
  s.getRange(s.getLastRow() + 1, 1, backupRows.length, 4).setValues(backupRows);
}

function sheetHubAppendLog_(copiedAt, count, fileNames) {
  sheetHubSheet5_().appendRow([copiedAt, count, fileNames]);
}

function sheetHubAppendSheet1Unmapped_(rows, savedAt, fileNames) {
  const s = sheetHubSheet10_();
  const backupRows = rows.map(function(row) {
    return [savedAt, fileNames].concat(row);
  });
  s.getRange(s.getLastRow() + 1, 1, backupRows.length, backupRows[0].length).setValues(backupRows);
}

function sheetHubAppendSheet2Unmapped_(rows, savedAt, fileNames) {
  const s = sheetHubSheet11_();
  const backupRows = rows.map(function(row) {
    return [savedAt, fileNames, row[0] || '', row[1] || ''];
  });
  s.getRange(s.getLastRow() + 1, 1, backupRows.length, 4).setValues(backupRows);
}

function sheetHubClearSheet1_() {
  const sheet = sheetHubSheet1_();
  sheet.getRange(SHEET_HUB.dataStartRowSheet1, 1,
    Math.max(sheet.getMaxRows() - SHEET_HUB.dataStartRowSheet1 + 1, 1),
    SHEET_HUB.sheet1CopyColumnCount).clearContent();
}

function sheetHubClearSheet2_() {
  const sheet = sheetHubSheet2_();
  sheet.getRange(SHEET_HUB.dataStartRowSheet2, 1,
    Math.max(sheet.getMaxRows() - SHEET_HUB.dataStartRowSheet2 + 1, 1),
    SHEET_HUB.sheet2CopyColumnCount).clearContent();
}

function sheetHubGetStatus_() {
  sheetHubReleaseExpiredLock_();
  const meta = sheetHubReadMeta_();
  const me = sheetHubActiveUser_();
  return {
    locked: meta.status === 'processing',
    lockedByMe: meta.status === 'processing' && meta.processor === me,
    processor: meta.processor, meta: meta,
  };
}

function sheetHubReleaseExpiredLock_() {
  const meta = sheetHubReadMeta_();
  if (meta.status !== 'processing' || !meta.started_at) return false;
  const startedAt = new Date(meta.started_at);
  if (isNaN(startedAt.getTime())) return false;
  if ((Date.now() - startedAt.getTime()) < SHEET_HUB.lockTimeoutMs) return false;
  sheetHubWriteMeta_({ status: 'idle', processor: '', started_at: '', doc_type: '', file_names: '', row_count: '0', completed_at: '' });
  return true;
}

function sheetHubColLetter_(n) {
  let r = '';
  while (n > 0) { n--; r = String.fromCharCode(65 + (n % 26)) + r; n = Math.floor(n / 26); }
  return r;
}

function sheetHubToast_(message, seconds) {
  SpreadsheetApp.getActiveSpreadsheet().toast(message, '', seconds || 2);
}

function sheetHubNow_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function sheetHubActiveUser_() {
  return Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'unknown-user';
}

function sheetHubSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_HUB.spreadsheetId);
}

function sheetHubSheet1_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet1Name); }
function sheetHubSheet2_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet2Name); }
function sheetHubSheet3_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet3Name); }
function sheetHubSheet4_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet4Name); }
function sheetHubSheet5_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet5Name); }
function sheetHubSheet10_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet10Name); }
function sheetHubSheet11_() { return sheetHubSheet_(sheetHubSpreadsheet_(), SHEET_HUB.sheet11Name); }

function sheetHubTempCopySheet_() {
  const ss = sheetHubSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_HUB.tempCopySheetName);
  if (!sheet) sheet = ss.insertSheet(SHEET_HUB.tempCopySheetName);
  if (sheet.isSheetHidden()) sheet.showSheet();
  return sheet;
}

function sheetHubSheet_(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  return sheet;
}
