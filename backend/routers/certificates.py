# backend/routers/certificates.py
from fastapi import APIRouter
from fastapi.responses import FileResponse
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
import os
import uuid
from datetime import date
from supabase import create_client

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@router.post("/generate")
async def generate_certificate(user_id: str, course_name: str, completion_date: str = None):
    if not completion_date:
        completion_date = str(date.today())
    
    # Get user info
    try:
        user = supabase.table("users").select("*").eq("id", user_id).single().execute()
        user_name = user.data.get("name", "Student")
    except Exception:
        user_name = "Student"
    
    cert_id = str(uuid.uuid4())[:8].upper()
    
    # Ensure dir exists
    os.makedirs("assets/certificates", exist_ok=True)
    filename = f"assets/certificates/cert_{cert_id}.pdf"
    
    # Create PDF Certificate
    c = canvas.Canvas(filename, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Background
    c.setFillColorRGB(0.05, 0.05, 0.15)
    c.rect(0, 0, width, height, fill=True)
    
    # Gold border
    c.setStrokeColorRGB(1, 0.84, 0)
    c.setLineWidth(5)
    c.rect(20, 20, width-40, height-40, fill=False)
    
    # Title
    c.setFillColorRGB(1, 0.84, 0)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height-100, "CERTIFICATE OF COMPLETION")
    
    # Subtitle
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height-150, "This is to certify that")
    
    # Name
    c.setFillColorRGB(0.4, 0.8, 1)
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(width/2, height-220, user_name)
    
    # Course
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height-270, "has successfully completed the course")
    
    c.setFillColorRGB(1, 0.84, 0)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height-320, course_name)
    
    # Date and ID
    c.setFillColorRGB(0.7, 0.7, 0.7)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, 80, f"Date: {completion_date}  |  Certificate ID: {cert_id}  |  Issued by Tulasi AI")
    
    # Tulasi AI logo text
    c.setFillColorRGB(0.4, 0.8, 1)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, 50, "🌿 TULASI AI - Educational Platform")
    
    c.save()
    
    # Upload to Supabase Storage
    try:
        with open(filename, "rb") as f:
            cert_data = f.read()
        
        storage_path = f"certificates/{user_id}/{cert_id}.pdf"
        supabase.storage.from_("certificates").upload(storage_path, cert_data)
        cert_url = supabase.storage.from_("certificates").get_public_url(storage_path)
        
        # Save to database
        supabase.table("certificates").insert({
            "user_id": user_id,
            "title": course_name,
            "issued_date": completion_date,
            "certificate_url": cert_url
        }).execute()
    except Exception as e:
        print(f"Error uploading certificate: {e}")
    
    return FileResponse(filename, media_type="application/pdf", filename=f"certificate_{cert_id}.pdf")
