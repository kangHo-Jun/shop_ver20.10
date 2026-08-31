"""Google Sheet Hub factory for ledger uploads."""

from google_sheet_hub import GoogleSheetHub


LEDGER_SPREADSHEET_ID = "1G2M05l7YbtV4CtXBn7StYE9ytYH1QM_mkcfCZnbu_EA"


def get_ledger_sheet_hub():
    return GoogleSheetHub(spreadsheet_id=LEDGER_SPREADSHEET_ID)
