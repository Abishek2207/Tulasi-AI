"""
Certificates endpoints — list, upload (local disk stub), and delete.
Swap the local disk storage for Cloudflare R2 in production.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads", "certificates")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory cert store (swap for Supabase in production)
certs_db: dict = {}


class Certificate(BaseModel):
    id: str
    name: str
    issuer: str
    category: str
    file_url: str
    issued_date: Optional[str] = None
    credential_id: Optional[str] = None
    uploaded_at: str


@router.get("", response_model=List[Certificate], summary="List user certificates")
def list_certificates():
    return list(certs_db.values())


@router.post("/upload", response_model=Certificate, summary="Upload a certificate file")
async def upload_certificate(
    file: UploadFile = File(...),
    name: str = "Certificate",
    issuer: str = "Unknown",
    category: str = "General",
):
    allowed_types = {"application/pdf", "image/jpeg", "image/png"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG files are supported")

    cert_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if file.filename else "file"
    filename = f"{cert_id}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    cert = {
        "id": cert_id,
        "name": name,
        "issuer": issuer,
        "category": category,
        "file_url": f"/uploads/certificates/{filename}",
        "issued_date": None,
        "credential_id": None,
        "uploaded_at": datetime.utcnow().isoformat(),
    }
    certs_db[cert_id] = cert
    return cert


@router.delete("/{cert_id}", summary="Delete a certificate")
def delete_certificate(cert_id: str):
    if cert_id not in certs_db:
        raise HTTPException(status_code=404, detail="Certificate not found")
    cert = certs_db[cert_id]
    # Remove file from disk
    file_path = os.path.join(UPLOAD_DIR, cert["file_url"].split("/")[-1])
    if os.path.exists(file_path):
        os.remove(file_path)
    del certs_db[cert_id]
    return {"message": "Certificate deleted"}
