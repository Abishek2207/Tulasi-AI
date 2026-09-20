from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlmodel import Session
from typing import Optional
from app.core.database import get_session
from app.models.models import User
from app.api.deps import get_current_user
from app.core.ai_router import get_ai_response
import base64

router = APIRouter()

@router.post("/presentation-analysis")
async def analyze_presentation(
    presentation_text: str = Form(...),
    video_audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Simulates the Hackathon Presentation Mode intelligence.
    Accepts slides (extracted text) and optionally a video/audio file from the user's pitch.
    Returns: Slide understanding, timer analysis, camera/mic analysis, and judge Q&A.
    """
    
    # 1. Slide Understanding
    slide_prompt = f"""You are a hackathon judge. Analyze these slides/presentation text:
{presentation_text}

Provide:
1. Core Value Proposition (1 sentence)
2. Technical Feasibility Score (1-10)
3. 2 potential weak points to ask about during Q&A."""

    try:
        slide_analysis = get_ai_response(slide_prompt)
    except Exception:
        slide_analysis = "Slide understanding failed."
        
    # 2. Camera / Mic / Timer Analysis
    # In a full implementation, we'd pass the file to a multimodal model.
    # We will simulate structural metrics based on file existence.
    delivery_metrics = "No delivery media provided."
    if video_audio_file:
        file_size = 0
        try:
            content = await video_audio_file.read()
            file_size = len(content)
        except:
            pass
        
        if file_size > 0:
            delivery_metrics = "Media analyzed. (Simulated) Timer: 3m 45s. Pacing: Good. (Note: True multimodal analysis would be executed here with Gemini)."

    # 3. Generate Judge Q&A
    qa_prompt = f"""Based on the following slide analysis, generate 2 challenging hackathon judge questions for the team.
{slide_analysis}"""
    
    try:
        judge_qa = get_ai_response(qa_prompt)
    except Exception:
        judge_qa = "Could not generate questions."
        
    return {
        "slide_analysis": slide_analysis,
        "delivery_metrics": delivery_metrics,
        "judge_qa": judge_qa,
        "status": "ANALYZED"
    }
