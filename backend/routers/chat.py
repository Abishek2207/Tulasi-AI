# backend/routers/chat.py
from fastapi import APIRouter, UploadFile, File, Form, WebSocket
from fastapi.responses import StreamingResponse
from services.langchain_service import detect_and_respond, process_pdf
import gtts
import io
import json

router = APIRouter()

@router.post("/message")
async def send_message(
    question: str = Form(...),
    session_id: str = Form(...),
    user_id: str = Form(...),
    language: str = Form("auto")
):
    result = await detect_and_respond(question, session_id, user_id)
    return result

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    content = await file.read()
    result = await process_pdf(content, user_id, file.filename)
    return result

@router.get("/text-to-speech")
async def text_to_speech(text: str, lang: str = "en"):
    tts = gtts.gTTS(text=text, lang=lang)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return StreamingResponse(audio_bytes, media_type="audio/mpeg")

@router.websocket("/stream/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_json()
            result = await detect_and_respond(
                data["question"], 
                session_id, 
                data["user_id"]
            )
            await websocket.send_json(result)
        except Exception as e:
            print(f"WebSocket error: {e}")
            break
