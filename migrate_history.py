import json
from config import config
from state_manager import state_manager

def migrate():
    if not config.HISTORY_FILE.exists():
        print("History file not found. Nothing to migrate.")
        return

    print(f"Loading history from {config.HISTORY_FILE}...")
    with open(config.HISTORY_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, list):
            history = {"ledger": data, "estimate": []}
        else:
            history = data

    print("Migrating to state manager...")
    total = 0
    for doc_type in ["ledger", "estimate"]:
        keys = history.get(doc_type, [])
        for key in keys:
            state_manager.update_state(doc_type, key, state_manager.STATUS_COMPLETED)
            total += 1
    
    print(f"Migration complete. Total {total} items migrated to {config.STATE_FILE}.")

if __name__ == "__main__":
    migrate()
