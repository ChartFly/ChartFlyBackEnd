import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")

def send_reset_email(to_email: str, reset_token: str):
    subject = "🔐 ChartFly Password Reset"
    reset_link = f"https://chartflybackend.onrender.com/auth/reset-password?token={reset_token}"

    body = f"""
    Hi there,

    A password reset was requested for your ChartFly account.

    🔗 Click the link below to reset your password:
    {reset_link}

    If you didn't request this, you can safely ignore this email.

    -- The ChartFly Team
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print("❌ Failed to send email:", e)
        return False