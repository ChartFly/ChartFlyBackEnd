import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")


def send_reset_email(to_email: str, temp_password: str):
    subject = "🔐 ChartFly Temporary Password Reset"
    body = f"""
We received a request to reset your ChartFly account password.  
If you did not make this request, you can safely ignore this message.  
If you receive this request again and you do have a ChartFly account, we recommend resetting your username and password.

🕒 Temporary Reset Code: {temp_password}  
(Expires in 15 minutes)

Follow these simple steps to reset your password:

1. Go to the ChartFly login page.
2. Enter your **username** and this **temporary code** as your password.
3. You’ll be redirected to a secure screen to create a **new permanent password**.
4. Once saved, you’ll return to the normal login page.
5. Enter your **username** and **new password** to access ChartFly.

ChartFly Trading Tools. All Rights Reserved.
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