from fastapi import APIRouter, HTTPException
from services.certificate_service import certificate_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

class CertificateRequest(BaseModel):
    user_id: str
    user_name: str
    course_title: str

@router.post("/generate")
async def generate_certificate(request: CertificateRequest):
    try:
        path = await certificate_service.generate_certificate(request.user_name, request.course_title)
        return {"status": "success", "download_url": f"/files/certificates/{path.split('/')[-1]}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verify/{certificate_id}")
async def verify_certificate(certificate_id: str):
    # Logic to check if certificate exists in DB
    return {"valid": True, "issued_to": "Student Name", "course": "React Mastery"}
