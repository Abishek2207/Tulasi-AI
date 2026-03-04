from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

class CodeExecuteRequest(BaseModel):
    language: str
    code: str
    stdin: str = ""

class CodeExecuteResponse(BaseModel):
    output: str
    error: str = ""
    exit_code: int = 0

LANG_MAP = {
    "python": ("python3", "3.10.0"),
    "javascript": ("javascript", "18.15.0"),
    "typescript": ("typescript", "5.0.3"),
    "java": ("java", "15.0.2"),
    "cpp": ("c++", "10.2.0"),
    "c": ("c", "10.2.0"),
    "go": ("go", "1.16.2"),
    "rust": ("rust", "1.68.2"),
}

PISTON_URL = "https://emkc.org/api/v2/piston/execute"

@router.post("/execute", response_model=CodeExecuteResponse)
async def execute_code(request: CodeExecuteRequest):
    """
    Execute code using the free Piston API.
    Supports Python, JavaScript, TypeScript, Java, C++, C, Go, Rust.
    """
    lang_info = LANG_MAP.get(request.language.lower())
    if not lang_info:
        return CodeExecuteResponse(
            output="",
            error=f"Unsupported language: {request.language}. Supported: {', '.join(LANG_MAP.keys())}",
            exit_code=1,
        )

    piston_lang, piston_version = lang_info

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PISTON_URL,
                json={
                    "language": piston_lang,
                    "version": piston_version,
                    "files": [{"content": request.code}],
                    "stdin": request.stdin,
                },
            )
            data = response.json()
            run_data = data.get("run", {})
            return CodeExecuteResponse(
                output=run_data.get("stdout", "") or run_data.get("output", ""),
                error=run_data.get("stderr", ""),
                exit_code=run_data.get("code", 0),
            )
    except Exception as e:
        return CodeExecuteResponse(
            output="",
            error=f"Execution service error: {str(e)}",
            exit_code=1,
        )
