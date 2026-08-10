const MONITOR_SHEET_ID = '1JX4tB_hwW7Z4MsnOdxj4i5_FvEbUSxmo2Xy8M-3mDTc';
const MONITOR_SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const system = String(params.system || '').trim() || 'unknown';
    const status = String(params.status || '').trim() || 'unknown';
    const message = String(params.message || '').trim() || 'unknown';

    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, 'Asia/Seoul', 'HH:mm:ss');

    const ss = SpreadsheetApp.openById(MONITOR_SHEET_ID);
    const sheet = ss.getSheetByName(MONITOR_SHEET_NAME) || ss.insertSheet(MONITOR_SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([['날짜', '시간', '시스템', '상태', '메시지']]);
    }

    const rowIndex = sheet.getLastRow() + 1;
    sheet.getRange(rowIndex, 1, 1, 5).setValues([[dateStr, timeStr, system, status, message]]);

    const bgColor = status === '성공' ? '#d9ead3' : '#f4cccc';
    sheet.getRange(rowIndex, 1, 1, 5).setBackground(bgColor);

    if (status !== '성공') {
      sendFailureEmail_(dateStr, timeStr, system, status, message);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, row: rowIndex }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendFailureEmail_(dateStr, timeStr, system, status, message) {
  const props = PropertiesService.getScriptProperties();
  const recipients = String(props.getProperty('ALERT_EMAILS') || Session.getEffectiveUser().getEmail() || '').trim();
  if (!recipients) {
    return;
  }

  const subject = `[${system}] 자동화 장애 알림 - ${status}`;
  const body = [
    `날짜: ${dateStr}`,
    `시간: ${timeStr}`,
    `시스템: ${system}`,
    `상태: ${status}`,
    '',
    '메시지:',
    message,
  ].join('\n');

  MailApp.sendEmail({
    to: recipients,
    subject,
    body,
  });
}
