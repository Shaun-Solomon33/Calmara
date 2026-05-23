import logging
import re
import time

from fastapi import FastAPI, Request
from fastapi.responses import Response

from app.routers import ai, auth, export, insurance, logs, profile
from app.schemas.common import HealthResponse


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("calmara.api")

app = FastAPI(title="Calmara API", version="1.0")

LOCAL_ORIGIN_PATTERN = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")


def is_allowed_origin(origin: str | None) -> bool:
    return bool(origin and LOCAL_ORIGIN_PATTERN.match(origin))


@app.middleware("http")
async def handle_local_cors(request: Request, call_next):
    origin = request.headers.get("origin")

    if request.method == "OPTIONS" and request.headers.get("access-control-request-method"):
        if not is_allowed_origin(origin):
            return Response("Disallowed CORS origin", status_code=400)

        requested_headers = request.headers.get("access-control-request-headers", "*")
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin or ""
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
        response.headers["Access-Control-Allow-Headers"] = requested_headers
        response.headers["Access-Control-Max-Age"] = "600"
        return response

    response = await call_next(request)

    if is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin or ""
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", version="1.0")


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(logs.router, prefix="/logs", tags=["logs"])
app.include_router(insurance.router, prefix="/insurance", tags=["insurance"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
