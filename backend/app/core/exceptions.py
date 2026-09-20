from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.encoders import jsonable_encoder
import traceback

# Maintain allowed origins to mirror main.py config
ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://tulasiai.in",
    "https://tulasi-ai.vercel.app",
    "https://tulasi-ai-soda.onrender.com",
    "https://www.tulasiai.in",
]

def _get_cors_headers(origin: str):
    is_valid = origin in ALLOW_ORIGINS or ".vercel.app" in origin
    return {
        "Access-Control-Allow-Origin": origin if is_valid else "https://tulasiai.in",
        "Access-Control-Allow-Credentials": "true"
    } if is_valid else {}

def setup_exception_handlers(app: FastAPI):
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        origin = request.headers.get("origin", "*")
        return JSONResponse(
            status_code=400,
            content=jsonable_encoder({
                "success": False,
                "error": "Bad Request",
                "detail": exc.errors(),
                "message": "Validation failed. Check your request payload.",
            }),
            headers=_get_cors_headers(origin)
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        origin = request.headers.get("origin", "*")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.detail,
            },
            headers=_get_cors_headers(origin)
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        tb = traceback.format_exc()
        error_msg = f"❌ CRITICAL ERROR on {request.method} {request.url}"
        print(f"{error_msg}:\n{tb}")
        
        if isinstance(exc, ImportError):
            print("🚩 Detected ImportError — This usually indicates a missing dependency in requirements.txt")

        origin = request.headers.get("origin", "*")
        return PlainTextResponse(
            content=f"--- TULASI AI: CRITICAL BACKEND ERROR ---\n\n{tb}\n\nCheck Render logs for dependency or environment conflicts.",
            status_code=500,
            headers=_get_cors_headers(origin)
        )
