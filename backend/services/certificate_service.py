import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from dotenv import load_dotenv

load_dotenv()

class CertificateService:
    def __init__(self):
        self.output_dir = "assets/certificates"
        os.makedirs(self.output_dir, exist_ok=True)

    async def generate_certificate(self, user_name: str, course_title: str) -> str:
        """Generates a professional PDF certificate."""
        certificate_id = str(uuid.uuid4())
        filename = f"cert_{certificate_id}.pdf"
        file_path = os.path.join(self.output_dir, filename)
        
        c = canvas.Canvas(file_path, pagesize=landscape(A4))
        width, height = landscape(A4)
        
        # Background color
        c.setFillColor(HexColor('#030712'))
        c.rect(0, 0, width, height, fill=1)
        
        # Border
        c.setStrokeColor(HexColor('#4f46e5'))
        c.setLineWidth(5)
        c.rect(0.2*inch, 0.2*inch, width - 0.4*inch, height - 0.4*inch)
        
        # Header
        c.setFillColor(HexColor('#ffffff'))
        c.setFont("Helvetica-Bold", 40)
        c.drawCentredString(width/2, height - 2*inch, "CERTIFICATE OF ACHIEVEMENT")
        
        c.setFont("Helvetica", 20)
        c.drawCentredString(width/2, height - 2.5*inch, "This is to certify that")
        
        # User Name
        c.setFillColor(HexColor('#4f46e5'))
        c.setFont("Helvetica-Bold", 50)
        c.drawCentredString(width/2, height - 3.5*inch, user_name.upper())
        
        # Course
        c.setFillColor(HexColor('#ffffff'))
        c.setFont("Helvetica", 20)
        c.drawCentredString(width/2, height - 4.2*inch, "has successfully completed the course")
        
        c.setFont("Helvetica-Bold", 30)
        c.drawCentredString(width/2, height - 5*inch, course_title)
        
        # Date and ID
        c.setFont("Helvetica", 12)
        c.drawCentredString(width/2, height - 6*inch, f"Issued on: {datetime.now().strftime('%B %d, %Y')}")
        c.drawCentredString(width/2, height - 6.3*inch, f"Verification ID: {certificate_id}")
        
        # Footer
        c.setFont("Helvetica-Bold", 25)
        c.drawCentredString(width/2, 1*inch, "TulasiAI Educational Platform")
        
        c.save()
        return file_path

certificate_service = CertificateService()
