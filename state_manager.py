import json
import os
import threading
from datetime import datetime
from config import config
from logging_config import logger

class StateManager:
    """Manages the state of order files (DOWNLOADED -> READY -> COMPLETED/FAILED)."""
    
    STATUS_DOWNLOADED = "DOWNLOADED"
    STATUS_READY = "READY"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_FAILED = "FAILED"
    
    def __init__(self):
        self.state_file = config.STATE_FILE
        self.lock = threading.Lock()
        self._init_state()

    def _init_state(self):
        """Initialize state file if it doesn't exist."""
        if not self.state_file.exists():
            with self.lock:
                default_state = {"ledger": {}, "estimate": {}}
                with open(self.state_file, 'w', encoding='utf-8') as f:
                    json.dump(default_state, f, ensure_ascii=False, indent=2)

    def load_state(self):
        """Load all states from JSON."""
        with self.lock:
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[State] Failed to load state: {e}")
                return {"ledger": {}, "estimate": {}}

    def save_state(self, state):
        """Save all states to JSON."""
        with self.lock:
            try:
                with open(self.state_file, 'w', encoding='utf-8') as f:
                    json.dump(state, f, ensure_ascii=False, indent=2)
            except Exception as e:
                logger.error(f"[State] Failed to save state: {e}")

    def update_state(self, doc_type, key, status, error_msg=None):
        """Update or create the state of a specific order."""
        state = self.load_state()
        if doc_type not in state:
            state[doc_type] = {}
        
        now = datetime.now().isoformat()
        
        if key not in state[doc_type]:
            state[doc_type][key] = {
                "id": key,
                "doc_type": doc_type,
                "status": status,
                "timestamps": {status: now},
                "error_msg": error_msg
            }
        else:
            state[doc_type][key]["status"] = status
            state[doc_type][key]["timestamps"][status] = now
            if error_msg:
                state[doc_type][key]["error_msg"] = error_msg
                
        self.save_state(state)
        logger.info(f"[State] {doc_type}/{key} updated to {status}")

    def get_count_by_status(self, doc_type, status, today_only=False):
        """Count items by status, optionally filtered by today's date."""
        state = self.load_state()
        items = state.get(doc_type, {}).values()
        
        if today_only:
            today_str = datetime.now().strftime("%Y-%m-%d")
            return sum(1 for item in items if item["status"] == status and item["timestamps"].get(status, "").startswith(today_str))
        
        return sum(1 for item in items if item["status"] == status)

    def get_total_downloaded_today(self, doc_type):
        """Count total items downloaded today regardless of current status."""
        state = self.load_state()
        items = state.get(doc_type, {}).values()
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        return sum(1 for item in items if item["timestamps"].get(self.STATUS_DOWNLOADED, "").startswith(today_str))

    def get_keys_by_status(self, doc_type, status):
        """Return list of keys for a specific status."""
        state = self.load_state()
        return [k for k, v in state.get(doc_type, {}).items() if v["status"] == status]

# Singleton instance
state_manager = StateManager()
