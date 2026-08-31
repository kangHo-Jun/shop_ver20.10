# Ledger Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert existing 30-column ledger parser rows into the 22-column schema consumed by the Google Sheet Hub without changing the estimate pipeline.

**Architecture:** Add one pure adapter module with a single public function. Tests exercise only that public seam and use literal input/output rows so no Google API, browser, parser, or server integration is involved.

**Tech Stack:** Python 3, pytest

**Spec:** `docs/superpowers/specs/2026-08-31-ledger-adapter-design.md`

## Global Constraints

- Do not modify `local_file_processor.py`, `google_sheet_hub.py`, or `run_server.py`.
- Do not add VAT, tax, total, or document-type branching logic.
- Preserve the input row count, order, values, and row objects.
- Output exactly 22 cells per input row.
- Use fixed customer code `00166`, customer name `기타매출처/doo`, and display manager `두현숙`.

---

### Task 1: Lock the adapter contract in failing tests

**Files:**
- Create: `tests/test_ledger_adapter.py`
- Test: `tests/test_ledger_adapter.py`

**Interfaces:**
- Consumes: `map_ledger_to_estimate_schema(rows)` imported from `ledger_file_processor`
- Produces: executable behavior specifications for one-row mapping, empty input, short rows, multiple rows, and input immutability

- [ ] **Step 1: Create representative ledger rows with literal values**

```python
def ledger_row(*, date="2026/08/31", item_name="영림195 도어", item_code="Y195", qty="2", amount="30000", note="메모"):
    row = [""] * 30
    row[0] = date
    row[16] = item_name
    row[17] = item_code
    row[18] = qty
    row[19] = amount
    row[29] = note
    return row
```

- [ ] **Step 2: Write public-seam tests**

Tests must assert these literal behaviors:

```python
assert len(result[0]) == 22
assert result[0][1] == "00166"
assert result[0][2] == "기타매출처/doo"
assert result[0][3] == "2026/08/31"
assert result[0][5] == "두현숙"
assert result[0][14:17] == ["Y195", "영림195 도어", "2"]
assert result[0][18:22] == ["30000", "", "", "메모"]
assert map_ledger_to_estimate_schema([]) == []
```

Add separate tests proving that a one-cell row is padded safely, multiple rows keep their order, and the original rows remain unchanged.

- [ ] **Step 3: Run the focused test and verify RED**

Run: `pytest -q tests/test_ledger_adapter.py`

Expected: collection fails because `ledger_file_processor` does not exist. This is the intended missing-feature failure.

- [ ] **Step 4: Commit RED**

```bash
git add tests/test_ledger_adapter.py docs/superpowers/plans/2026-08-31-ledger-adapter.md
git commit -m "[TDD-RED] specify ledger row adapter"
```

### Task 2: Implement the pure adapter

**Files:**
- Create: `ledger_file_processor.py`
- Test: `tests/test_ledger_adapter.py`

**Interfaces:**
- Consumes: an iterable of sequence-like 30-column ledger rows
- Produces: `map_ledger_to_estimate_schema(rows) -> list[list]`

- [ ] **Step 1: Implement only the approved mapping**

```python
def map_ledger_to_estimate_schema(rows):
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
```

- [ ] **Step 2: Run the focused test and verify GREEN**

Run: `pytest -q tests/test_ledger_adapter.py`

Expected: all adapter tests pass.

- [ ] **Step 3: Run the available regression suite**

Run: `pytest -q`

Expected: all collected tests pass. If the repository has unrelated pre-existing collection failures, record them explicitly and run every relevant local processor test separately.

- [ ] **Step 4: Confirm integration files are untouched**

Run: `git diff HEAD -- run_server.py local_file_processor.py google_sheet_hub.py`

Expected: no output.

- [ ] **Step 5: Commit GREEN**

```bash
git add ledger_file_processor.py
git commit -m "[TDD-GREEN] implement ledger row adapter"
```
