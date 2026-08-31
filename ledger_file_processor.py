"""Adapters for converting ledger rows to the Google Sheet Hub row schema."""


def map_ledger_to_estimate_schema(rows):
    """Map existing 30-column ledger rows to the 22-column Sheet Hub schema."""
    mapped_rows = []
    for source in rows:
        padded = list(source) + [""] * max(0, 30 - len(source))
        target = [""] * 22
        target[1] = "00166"
        target[2] = "기타매출처/doo"
        target[3] = padded[0]
        target[5] = "두현숙"
        target[14] = padded[17]
        target[15] = padded[16]
        target[16] = padded[18]
        target[18] = padded[19]
        target[21] = padded[29]
        mapped_rows.append(target)
    return mapped_rows
