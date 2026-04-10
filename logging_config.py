import logging
import json
from datetime import datetime
from config import config

class JsonFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    def format(self, record):
        log_record = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
            "line": record.lineno
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record, ensure_ascii=False)


class DailyJsonFileHandler(logging.Handler):
    """Write logs to app_YYYYMMDD.json and switch automatically at date boundaries."""

    def __init__(self, logs_dir, encoding='utf-8'):
        super().__init__()
        self.logs_dir = logs_dir
        self.encoding = encoding
        self._current_date = None
        self._stream = None

    def _ensure_stream(self):
        current_date = datetime.now().strftime("%Y%m%d")
        if self._stream is not None and self._current_date == current_date:
            return

        if self._stream is not None:
            self._stream.close()

        log_file = self.logs_dir / f"app_{current_date}.json"
        self._stream = open(log_file, "a", encoding=self.encoding)
        self._current_date = current_date

    def emit(self, record):
        try:
            self._ensure_stream()
            self._stream.write(self.format(record) + "\n")
            self._stream.flush()
        except Exception:
            self.handleError(record)

    def close(self):
        try:
            if self._stream is not None:
                self._stream.close()
                self._stream = None
        finally:
            super().close()

def setup_logging():
    """Setup structured logging with JSON formatting and rotation."""
    logger = logging.getLogger()
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO if not config.FLASK_DEBUG else logging.DEBUG)
    
    # Console Handler (Human-friendly)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s'))
    logger.addHandler(console_handler)
    
    # JSON file handler with automatic daily rollover.
    file_handler = DailyJsonFileHandler(config.LOGS_DIR, encoding='utf-8')
    file_handler.setFormatter(JsonFormatter())
    logger.addHandler(file_handler)
    
    return logger

# Initialize logging when imported
logger = setup_logging()
