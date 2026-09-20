import logging
import sys
import json
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger(name="tulasiai"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = datetime.now(timezone.utc)
        try:
            response = await call_next(request)
            process_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            # Use raw message for basic output, since extra gets tricky with native logging dicts
            logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.4f}s)")
            return response
        except Exception as e:
            process_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.error(
                f"Unhandled Exception: {request.method} {request.url.path} - {str(e)} ({process_time:.4f}s)",
                exc_info=True
            )
            raise e
