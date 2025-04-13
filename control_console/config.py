# ==========================================================
# ✅ FILE: control_console/config.py
# 📌 PURPOSE: Centralized environment configuration values
# 🛠️ STATUS: Active (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

import os

# === Database (used in database.py, fallback mode) ===
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_SSL = os.getenv("DB_SSL", "require")

# Used in database.py fallback
def build_database_url():
    if not all([DB_USER, DB_PASS, DB_HOST, DB_NAME]):
        raise EnvironmentError("❌ Missing DB env variables for fallback URL.")
    return f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode={DB_SSL}"

# === Session Management ===
SESSION_PREFIX = os.getenv("SESSION_PREFIX")
SESSION_SUFFIX = os.getenv("SESSION_SUFFIX")
SESSION_SECRET = (
    os.getenv("SESSION_SECRET") or f"{SESSION_PREFIX}-{SESSION_SUFFIX}"
)

# === Developer Reset Token ===
DEV_RESET_TOKEN = os.getenv("DEV_RESET_TOKEN")

# === Email / SMTP ===
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_DOMAIN = os.getenv("EMAIL_DOMAIN")
EMAIL_FROM = os.getenv("EMAIL_FROM") or f"{EMAIL_USER}@{EMAIL_DOMAIN}"
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = EMAIL_FROM  # Using built EMAIL_FROM as login
SMTP_PASSWORD = os.getenv("EMAIL_APP_PASS")  # Modular password key

# === Default Admin for Dev Reset ===
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL")
DEFAULT_ADMIN_USER = os.getenv("DEFAULT_ADMIN_USER")
DEFAULT_ADMIN_PASS = os.getenv("DEFAULT_ADMIN_PASS")
DEFAULT_ADMIN_CODE = os.getenv("DEFAULT_ADMIN_CODE")
DEFAULT_ADMIN_ROLE = os.getenv("DEFAULT_ADMIN_ROLE", "SuperAdmin")
