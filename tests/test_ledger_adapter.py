from copy import deepcopy

import pytest

from ledger_file_processor import map_ledger_to_estimate_schema
from v10_auto_server import sheet_hub as estimate_sheet_hub
from ledger_sheet_hub import get_ledger_sheet_hub


def make_ledger_row():
    row = [""] * 30
    row[0] = "2026/08/31"
    row[16] = "영림195 도어"
    row[17] = "Y195"
    row[18] = "2"
    row[19] = "30000"
    row[29] = "메모"
    return row


def test_maps_ledger_values_to_the_22_column_estimate_schema():
    result = map_ledger_to_estimate_schema([make_ledger_row()])

    assert len(result) == 1
    assert len(result[0]) == 22
    assert result[0][1] == "00166"
    assert result[0][2] == "기타매출처/doo"
    assert result[0][5] == "두현숙"
    assert result[0][3] == "2026/08/31"
    assert result[0][14] == "Y195"
    assert result[0][15] == "영림195 도어"
    assert result[0][16] == "2"
    assert result[0][18] == "30000"
    assert result[0][21] == "메모"


def test_leaves_all_other_estimate_columns_empty_without_vat_or_total_logic():
    result = map_ledger_to_estimate_schema([make_ledger_row()])[0]
    populated_indexes = {1, 2, 3, 5, 14, 15, 16, 18, 21}

    assert all(value == "" for index, value in enumerate(result) if index not in populated_indexes)
    assert result[19] == ""
    assert result[20] == ""


def test_returns_empty_list_for_empty_input():
    assert map_ledger_to_estimate_schema([]) == []


def test_pads_short_rows_with_empty_values_instead_of_raising():
    result = map_ledger_to_estimate_schema([["2026/08/31"]])

    assert len(result) == 1
    assert len(result[0]) == 22
    assert result[0][3] == "2026/08/31"
    assert result[0][14] == ""
    assert result[0][15] == ""
    assert result[0][16] == ""
    assert result[0][18] == ""
    assert result[0][21] == ""


def test_preserves_row_order_and_does_not_mutate_input_rows():
    first = make_ledger_row()
    second = make_ledger_row()
    second[16] = "두 번째 품목"
    rows = [first, second]
    original = deepcopy(rows)

    result = map_ledger_to_estimate_schema(rows)

    assert [row[15] for row in result] == ["영림195 도어", "두 번째 품목"]
    assert rows == original


def test_ledger_hub_uses_new_spreadsheet_id():
    assert get_ledger_sheet_hub().spreadsheet_id == "1G2M05l7YbtV4CtXBn7StYE9ytYH1QM_mkcfCZnbu_EA"


def test_ledger_hub_id_differs_from_default_estimate_hub():
    assert get_ledger_sheet_hub().spreadsheet_id != estimate_sheet_hub.spreadsheet_id
