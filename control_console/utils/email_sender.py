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
    subject = "🔐 ChartFly Password Reset Instructions"
    reset_link = f"https://chartflybackend.onrender.com/auth/reset-password?token={reset_token}"

    body = f"""
Hello,

We received a request to reset the password for your ChartFly account.

🔗 To reset your password, click the secure link below:
{reset_link}

📌 This link contains a unique token tied to your account:
Token: {reset_token}

✅ Please note:
- This link will expire in 15 minutes for your security.
- If you did not request this reset, no action is needed — your account remains safe.

⚠️ Do not share this email or token with anyone.

If you need assistance, please reply to this email or contact support.

—
ChartFly Trading Tools  
All Rights Reserved
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