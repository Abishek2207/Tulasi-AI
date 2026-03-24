import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@tulasiai.com")
        self.is_configured = bool(self.smtp_host and self.smtp_user and self.smtp_pass)

    def send_email(self, to_email: str, subject: str, html_content: str):
        if not self.is_configured:
            print("\n" + "="*50)
            print(f"📧 [EMAIL MOCK] To: {to_email}")
            print(f"📧 [EMAIL MOCK] Subject: {subject}")
            print(f"📧 [EMAIL MOCK] Body:\n{html_content}")
            print("="*50 + "\n")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Tulasi AI <{self.from_email}>"
            msg["To"] = to_email

            part1 = MIMEText(html_content.replace("<br>", "\n"), "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.sendmail(self.from_email, to_email, msg.as_string())
            server.quit()
            print(f"✅ Successfully sent email to {to_email}")
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")

    def send_welcome_email(self, to_email: str, name: str):
        subject = "Welcome to Tulasi AI 🚀 - Your Autonomous Career Engine"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #05070D; color: #ffffff; padding: 40px; text-align: center;">
            <h1 style="color: #43E97B;">Welcome to the Vanguard of Learning, {name}</h1>
            <p style="font-size: 16px; color: #a1a1aa; line-height: 1.6;">
              You've officially joined Tulasi AI.<br><br>
              Get ready to engineer your career with high-fidelity Mock Interviews, 
              intelligently generated Flashcards, and real-time System Design feedback.
            </p>
            <div style="margin: 30px 0;">
              <a href="https://tulasiai.vercel.app/dashboard" style="background: linear-gradient(135deg, #10B981, #06B6D4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                Launch Dashboard
              </a>
            </div>
            <p style="font-size: 12px; color: #52525b;">© {os.getenv("CURRENT_YEAR", "2026")} Tulasi AI. All systems operational.</p>
          </body>
        </html>
        """
        self.send_email(to_email, subject, html)

# Singleton Instance
email_service = EmailService()
