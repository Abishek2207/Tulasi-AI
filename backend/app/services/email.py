import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

# ── Shared HTML Template Shell ─────────────────────────────────────────────
def _wrap_template(body_html: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tulasi AI</title>
</head>
<body style="margin:0;padding:0;background-color:#05070D;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:linear-gradient(145deg,#0d1117,#111827);border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#06b6d4);padding:28px 40px;text-align:center;">
              <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                🌿 Tulasi AI
              </span>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                Your Autonomous Career Engine
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              {body_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#0a0f1a;border-top:1px solid #1f2937;text-align:center;">
              <p style="margin:0;color:#4b5563;font-size:12px;">
                © 2026 Tulasi AI — Built by Abishek R &nbsp;·&nbsp;
                <a href="https://tulasiai.vercel.app" style="color:#10b981;text-decoration:none;">Visit Platform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


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
            print("\n" + "="*55)
            print(f"📧 [EMAIL MOCK] To: {to_email}")
            print(f"📧 [EMAIL MOCK] Subject: {subject}")
            print("="*55 + "\n")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Tulasi AI <{self.from_email}>"
            msg["To"] = to_email

            plain = html_content.replace("<br>", "\n").replace("</p>", "\n").replace("<li>", "• ")
            import re
            plain = re.sub(r"<[^>]+>", "", plain)
            msg.attach(MIMEText(plain, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.sendmail(self.from_email, to_email, msg.as_string())
            print(f"✅ Email sent → {to_email} | {subject}")
        except Exception as e:
            print(f"❌ Email failed → {to_email}: {e}")

    # ── Email Templates ────────────────────────────────────────────────────

    def send_welcome_email(self, to_email: str, name: str):
        body = f"""
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
          Welcome to the Vanguard, <span style="color:#10b981;">{name}</span> 🚀
        </h1>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:16px 0;">
          You've officially joined <strong style="color:#ffffff;">Tulasi AI</strong> — the world's most
          personalized autonomous career engine for engineers.
        </p>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;">Here's what's waiting for you:</p>
        <ul style="list-style:none;padding:0;margin:20px 0;">
          <li style="margin:10px 0;color:#d1fae5;font-size:14px;">🧠 &nbsp;<strong>AI Career Intelligence</strong> — Personalized roadmaps built on your profile</li>
          <li style="margin:10px 0;color:#d1fae5;font-size:14px;">🎯 &nbsp;<strong>Mock Interviews</strong> — RAG-powered structured feedback</li>
          <li style="margin:10px 0;color:#d1fae5;font-size:14px;">⚡ &nbsp;<strong>System Design Simulations</strong> — FAANG-caliber challenges</li>
          <li style="margin:10px 0;color:#d1fae5;font-size:14px;">📈 &nbsp;<strong>XP & Streak System</strong> — Gamified daily progress tracking</li>
        </ul>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://tulasiai.vercel.app/dashboard"
             style="background:linear-gradient(135deg,#10b981,#06b6d4);color:#ffffff;padding:14px 32px;
                    text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;
                    display:inline-block;letter-spacing:0.3px;">
            Launch Your Dashboard →
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
          Have questions? Reply to this email — we read every one.
        </p>
        """
        self.send_email(to_email, "Welcome to Tulasi AI 🚀 — Your Career Engine is Ready", _wrap_template(body))

    def send_streak_milestone_email(self, to_email: str, name: str, streak: int):
        emojis = {3: "🔥", 7: "⚡", 14: "💎", 30: "👑", 50: "🏆", 100: "🌟"}
        emoji = emojis.get(streak, "🔥")
        body = f"""
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
          {emoji} {streak}-Day Streak, <span style="color:#f59e0b;">{name}</span>!
        </h1>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:16px 0;">
          You've maintained a <strong style="color:#f59e0b;">{streak}-day</strong> learning streak on Tulasi AI.
          That's elite-level consistency that separates top 1% engineers from the rest.
        </p>
        <div style="background:#1a1f2e;border:1px solid #f59e0b33;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <p style="margin:0;font-size:48px;">{emoji}</p>
          <p style="margin:8px 0 0;color:#f59e0b;font-size:20px;font-weight:700;">{streak} Days Strong</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Don't break the chain — come back tomorrow</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://tulasiai.vercel.app/dashboard"
             style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#ffffff;padding:14px 32px;
                    text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
            Continue Your Streak →
          </a>
        </div>
        """
        self.send_email(to_email, f"{emoji} {streak}-Day Streak on Tulasi AI — Keep Going!", _wrap_template(body))

    def send_xp_milestone_email(self, to_email: str, name: str, xp: int, level: int):
        body = f"""
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
          ⚡ Level <span style="color:#8b5cf6;">{level}</span> Unlocked, {name}!
        </h1>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:16px 0;">
          You've earned <strong style="color:#8b5cf6;">{xp:,} XP</strong> on Tulasi AI and reached
          a new level. Your trajectory is accelerating.
        </p>
        <div style="background:linear-gradient(135deg,#1e1b4b,#2e1065);border:1px solid #7c3aed55;
                    border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
          <p style="margin:0;font-size:56px;">⚡</p>
          <p style="margin:8px 0 0;color:#a78bfa;font-size:22px;font-weight:800;">Level {level}</p>
          <p style="margin:4px 0 0;color:#7c3aed;font-size:14px;">{xp:,} XP Total</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://tulasiai.vercel.app/dashboard"
             style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#ffffff;padding:14px 32px;
                    text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
            View Your Progress →
          </a>
        </div>
        """
        self.send_email(to_email, f"⚡ You reached Level {level} on Tulasi AI!", _wrap_template(body))

    def send_interview_complete_email(self, to_email: str, name: str, role: str, score: int, grade: str):
        color = "#10b981" if score >= 70 else "#f59e0b" if score >= 50 else "#ef4444"
        body = f"""
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#ffffff;">
          🎯 Interview Complete, {name}
        </h1>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:16px 0;">
          Your results for the <strong style="color:#ffffff;">{role}</strong> mock interview are in.
        </p>
        <div style="background:#0d1117;border:1px solid {color}44;border-radius:12px;padding:24px;
                    margin:24px 0;text-align:center;">
          <p style="margin:0;font-size:52px;font-weight:900;color:{color};">{score}</p>
          <p style="margin:4px 0;color:{color};font-size:16px;font-weight:700;">{grade}</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Job Readiness Score / 100</p>
        </div>
        <p style="color:#9ca3af;font-size:14px;line-height:1.7;">
          Review your per-question breakdown, improve your weak areas, and attempt again to climb
          to <strong style="color:#10b981;">Strong Hire</strong> territory.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://tulasiai.vercel.app/dashboard/interview"
             style="background:linear-gradient(135deg,#10b981,#06b6d4);color:#ffffff;padding:14px 32px;
                    text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
            View Full Feedback →
          </a>
        </div>
        """
        self.send_email(to_email, f"🎯 Your {role} Interview Results — Tulasi AI", _wrap_template(body))

    def send_invite_reward_email(self, to_email: str, name: str, invited_name: str, xp_earned: int):
        body = f"""
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#ffffff;">
          🎉 Referral Bonus, {name}!
        </h1>
        <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:16px 0;">
          <strong style="color:#10b981;">{invited_name}</strong> just joined Tulasi AI using your invite code.
          Your community is growing!
        </p>
        <div style="background:#052e16;border:1px solid #10b98144;border-radius:12px;padding:20px;
                    margin:24px 0;text-align:center;">
          <p style="margin:0;font-size:40px;">🎁</p>
          <p style="margin:8px 0 0;color:#10b981;font-size:20px;font-weight:700;">+{xp_earned} XP Earned</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Referral reward added to your account</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://tulasiai.vercel.app/dashboard"
             style="background:linear-gradient(135deg,#10b981,#06b6d4);color:#ffffff;padding:14px 32px;
                    text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
            Check Your XP →
          </a>
        </div>
        """
        self.send_email(to_email, f"🎉 You earned {xp_earned} XP for inviting {invited_name}!", _wrap_template(body))


# Singleton Instance
email_service = EmailService()
