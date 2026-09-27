from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session
from typing import Optional
from app.core.database import get_session
from app.models.models import User
from app.api.deps import get_current_user
from app.core.ai_client import HybridAIClient

router = APIRouter()

@router.post("/presentation-analysis")
async def analyze_presentation(
    presentation_text: str = Form(...),
    video_audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Hackathon Presentation Mode intelligence.
    """
    ai_client = HybridAIClient()
    
    # 1. Slide Understanding
    slide_prompt = f"""You are a hackathon judge. Analyze these slides/presentation text:
{presentation_text}

Provide:
1. Core Value Proposition (1 sentence)
2. Technical Feasibility Score (1-10)
3. 2 potential weak points to ask about during Q&A."""

    try:
        slide_analysis = await ai_client.generate(slide_prompt)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Slide understanding failed: {str(e)}")
        
    delivery_metrics = "Visual/Audio tracking is handled securely on device via MediaPipe. Backend media processing is currently unavailable."
    
    # 3. Generate Judge Q&A
    qa_prompt = f"""Based on the following slide analysis, generate 2 challenging hackathon judge questions for the team.
{slide_analysis}"""
    
    try:
        judge_qa = await ai_client.generate(qa_prompt)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"QA generation failed: {str(e)}")
        
    return {
        "slide_analysis": slide_analysis,
        "delivery_metrics": delivery_metrics,
        "judge_qa": judge_qa,
        "status": "ANALYZED"
    }
