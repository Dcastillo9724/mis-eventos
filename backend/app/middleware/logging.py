import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware que loguea cada request con método, ruta, status y tiempo."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000

        logger.info(
            "%s %s | %s | %.2fms | %s",
            request.method,
            request.url.path,
            response.status_code,
            duration,
            request.client.host if request.client else "unknown",
        )

        return response