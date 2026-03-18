import datetime
import json
import pickle
import socket
import threading
from pathlib import Path

import pyperclip
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.service_account import Credentials as ServiceAccountCredentials

from config import config
from logging_config import logger


class GoogleSheetHub:
    SHEET1_NAME = "Sheet1"
    SHEET2_NAME = "Sheet2"
    SHEET3_NAME = "Sheet3"
    SHEET4_NAME = "Sheet4"
    SHEET5_NAME = "Sheet5"
    SHEET1_META_HEADERS = [
        "status",
        "processor",
        "started_at",
        "doc_type",
        "file_names",
        "row_count",
        "completed_at",
    ]
    SHEET1_HEADERS = [[
        "순번", "거래처코드", "거래처명", "일자", "출하창고", "표시담당자",
        "거래처담당자", "거래처연락처", "거래유형", "결제조건", "견적유효기간",
        "이행기반", "수령고객정보", "NO.", "품목코드", "품목명", "수량",
        "단가", "공급가액", "부가세", "합계", "비고",
    ]]
    SHEET2_HEADERS = [["품목명", "품목코드"]]
    SHEET3_HEADERS = [["completed_at", "doc_type", "processor", "file_names", "row_json"]]
    SHEET4_HEADERS = [["completed_at", "file_names", "item_name", "item_code"]]
    SHEET5_HEADERS = [["date", "count", "file_names"]]
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

    def __init__(self, spreadsheet_id=None):
        self.spreadsheet_id = spreadsheet_id or config.GS_SPREADSHEET_ID
        self.machine_id = self._build_machine_id()
        self.lock_timeout_sec = config.SHEET_HUB_LOCK_TIMEOUT_SEC
        self._client = None
        self._spreadsheet = None
        self._worksheets = {}
        self._lock = threading.RLock()

    def _build_machine_id(self):
        try:
            return f"{socket.gethostname()}_{socket.gethostbyname(socket.gethostname())}"
        except Exception:
            return socket.gethostname() or "unknown-machine"

    def _column_letter(self, index):
        result = ""
        while index > 0:
            index, remainder = divmod(index - 1, 26)
            result = chr(65 + remainder) + result
        return result

    def _get_credentials(self):
        credentials_path = Path(config.GOOGLE_CREDENTIALS_PATH)
        token_path = Path(config.GOOGLE_TOKEN_PATH)

        if not credentials_path.exists():
            raise FileNotFoundError(f"Google credentials file not found: {credentials_path}")

        credentials_payload = json.loads(credentials_path.read_text(encoding="utf-8"))
        if credentials_payload.get("type") == "service_account":
            return ServiceAccountCredentials.from_service_account_file(
                str(credentials_path),
                scopes=self.SCOPES,
            )

        if "installed" not in credentials_payload and "web" not in credentials_payload:
            raise ValueError(
                "Google credentials JSON must be a service account or an installed/web OAuth client."
            )

        creds = None
        if token_path.exists():
            with open(token_path, "rb") as token_file:
                creds = pickle.load(token_file)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), self.SCOPES)
                creds = flow.run_local_server(port=0)

            with open(token_path, "wb") as token_file:
                pickle.dump(creds, token_file)

        return creds

    def connect(self):
        with self._lock:
            if self._spreadsheet:
                return self._spreadsheet

            import gspread

            creds = self._get_credentials()
            self._client = gspread.authorize(creds)
            self._spreadsheet = self._client.open_by_key(self.spreadsheet_id)
            self._ensure_structure()
            logger.info("[SheetHub] Connected to Google Sheet hub")
            return self._spreadsheet

    def _worksheet(self, name):
        self.connect()
        worksheet = self._worksheets.get(name)
        if worksheet:
            return worksheet

        try:
            worksheet = self._spreadsheet.worksheet(name)
        except Exception:
            worksheet = self._spreadsheet.add_worksheet(title=name, rows=2000, cols=60)
        self._worksheets[name] = worksheet
        return worksheet

    def _ensure_structure(self):
        sheet1 = self._worksheet(self.SHEET1_NAME)
        sheet2 = self._worksheet(self.SHEET2_NAME)
        sheet3 = self._worksheet(self.SHEET3_NAME)
        sheet4 = self._worksheet(self.SHEET4_NAME)
        sheet5 = self._worksheet(self.SHEET5_NAME)

        if not sheet1.row_values(1):
            sheet1.update("A1:G2", [self.SHEET1_META_HEADERS, ["", "", "", "", "", "", ""]])
        if not sheet1.row_values(4):
            sheet1.update("A4:V4", self.SHEET1_HEADERS)

        if not sheet2.row_values(1):
            sheet2.update("A1:B1", self.SHEET2_HEADERS)

        if not sheet3.row_values(1):
            sheet3.update("A1:E1", self.SHEET3_HEADERS)

        if not sheet4.row_values(1):
            sheet4.update("A1:D1", self.SHEET4_HEADERS)

        if not sheet5.row_values(1):
            sheet5.update("A1:C1", self.SHEET5_HEADERS)

    def _sheet1_meta(self):
        values = self._worksheet(self.SHEET1_NAME).get("A2:G2")
        row = values[0] if values else []
        row = row + [""] * (7 - len(row))
        return {
            "status": row[0] or "대기중",
            "processor": row[1] or "",
            "started_at": row[2] or "",
            "doc_type": row[3] or "",
            "file_names": row[4] or "",
            "row_count": row[5] or "0",
            "completed_at": row[6] or "",
        }

    def _write_sheet1_meta(self, meta):
        ordered = [[
            meta.get("status", "대기중"),
            meta.get("processor", ""),
            meta.get("started_at", ""),
            meta.get("doc_type", ""),
            meta.get("file_names", ""),
            str(meta.get("row_count", "0")),
            meta.get("completed_at", ""),
        ]]
        self._worksheet(self.SHEET1_NAME).update("A2:G2", ordered)

    def _clear_sheet1_data_area(self):
        self._worksheet(self.SHEET1_NAME).batch_clear(["A5:AZ2000"])

    def _clear_sheet2_data_area(self):
        self._worksheet(self.SHEET2_NAME).batch_clear(["A2:AZ2000"])

    def _release_expired_lock(self, meta=None):
        meta = meta or self._sheet1_meta()
        if meta["status"] != "처리중" or not meta["started_at"]:
            return False

        try:
            started_at = datetime.datetime.fromisoformat(meta["started_at"])
        except ValueError:
            return False

        if (datetime.datetime.now() - started_at).total_seconds() < self.lock_timeout_sec:
            return False

        logger.warning("[SheetHub] Releasing expired processing lock")
        self._write_sheet1_meta({
            "status": "대기중",
            "processor": "",
            "started_at": "",
            "doc_type": "",
            "file_names": "",
            "row_count": "0",
            "completed_at": "",
        })
        return True

    def get_status(self):
        self.connect()
        meta = self._sheet1_meta()
        self._release_expired_lock(meta)
        meta = self._sheet1_meta()
        locked = meta["status"] == "처리중"
        return {
            "locked": locked,
            "locked_by_me": locked and meta["processor"] == self.machine_id,
            "machine_id": self.machine_id,
            "archived_at": meta["completed_at"],
            **meta,
        }

    def _extract_sheet2_rows(self, rows):
        extracted = []
        for row in rows:
            padded = list(row) + [""] * max(0, 16 - len(row))
            item_name = padded[15].strip() if len(padded) > 15 and padded[15] else ""
            item_code = padded[14].strip() if len(padded) > 14 and padded[14] else ""
            if item_name or item_code:
                extracted.append([item_name, item_code])
        return extracted

    def _write_sheet1_rows(self, rows):
        self._clear_sheet1_data_area()
        if not rows:
            return

        sheet1 = self._worksheet(self.SHEET1_NAME)
        end_col = self._column_letter(max(len(row) for row in rows))
        normalized = [list(row) for row in rows]
        sheet1.update(f"A5:{end_col}{4 + len(normalized)}", normalized)

    def _write_sheet2_rows(self, extracted_rows):
        self._clear_sheet2_data_area()
        if not extracted_rows:
            return

        sheet2 = self._worksheet(self.SHEET2_NAME)
        sheet2.update(f"A2:B{1 + len(extracted_rows)}", extracted_rows)

    def _sheet1_data_rows(self):
        values = self._worksheet(self.SHEET1_NAME).get("A5:AZ2000")
        return [row for row in values if any(str(cell).strip() for cell in row)]

    def _sheet2_data_rows(self):
        values = self._worksheet(self.SHEET2_NAME).get("A2:B2000")
        return [row for row in values if any(str(cell).strip() for cell in row)]

    def stage_and_copy(self, doc_type, rows, file_names):
        self.connect()
        status = self.get_status()
        if status["locked"] and not status["locked_by_me"]:
            raise RuntimeError(f"다른 처리자가 사용 중입니다: {status['processor']}")

        now_iso = datetime.datetime.now().isoformat()
        joined_files = ", ".join(file_names)
        extracted_rows = self._extract_sheet2_rows(rows)

        self._write_sheet1_rows(rows)
        self._write_sheet2_rows(extracted_rows)
        self._write_sheet1_meta({
            "status": "처리중",
            "processor": self.machine_id,
            "started_at": now_iso,
            "doc_type": doc_type,
            "file_names": joined_files,
            "row_count": str(len(rows)),
            "completed_at": "",
        })

        clipboard_text = "\r\n".join(
            "\t".join("" if cell is None else str(cell) for cell in row)
            for row in rows
        )
        pyperclip.copy(clipboard_text)
        logger.info(
            "[SheetHub] Staged %s rows to Sheet1/Sheet2 and extracted %s item rows",
            len(rows),
            len(extracted_rows),
        )

        return {
            "row_count": len(rows),
            "item_count": len(extracted_rows),
            "file_count": len(file_names),
            "processor": self.machine_id,
            "started_at": now_iso,
        }

    def complete(self):
        self.connect()
        status = self.get_status()
        meta = self._sheet1_meta()
        sheet1_rows = self._sheet1_data_rows()
        sheet2_rows = self._sheet2_data_rows()
        completed_at = datetime.datetime.now().isoformat()
        file_names = meta.get("file_names", "")
        doc_type = meta.get("doc_type", "")

        if sheet1_rows:
            backup_rows_1 = [
                [completed_at, doc_type, self.machine_id, file_names, json.dumps(row, ensure_ascii=False)]
                for row in sheet1_rows
            ]
            self._worksheet(self.SHEET3_NAME).append_rows(backup_rows_1, value_input_option="USER_ENTERED")

        if sheet2_rows:
            backup_rows_2 = [
                [completed_at, file_names, row[0] if len(row) > 0 else "", row[1] if len(row) > 1 else ""]
                for row in sheet2_rows
            ]
            self._worksheet(self.SHEET4_NAME).append_rows(backup_rows_2, value_input_option="USER_ENTERED")

        self._worksheet(self.SHEET5_NAME).append_row(
            [completed_at, len(sheet1_rows), file_names],
            value_input_option="USER_ENTERED",
        )

        self._clear_sheet1_data_area()
        self._clear_sheet2_data_area()
        self._write_sheet1_meta({
            "status": "완료",
            "processor": "",
            "started_at": "",
            "doc_type": "",
            "file_names": "",
            "row_count": "0",
            "completed_at": completed_at,
        })
        logger.info(
            "[SheetHub] Completed backup: Sheet1->Sheet3 %s rows, Sheet2->Sheet4 %s rows, logged Sheet5",
            len(sheet1_rows),
            len(sheet2_rows),
        )
        return {
            "status": "완료",
            "completed_at": completed_at,
            "sheet1_backup_count": len(sheet1_rows),
            "sheet2_backup_count": len(sheet2_rows),
        }
