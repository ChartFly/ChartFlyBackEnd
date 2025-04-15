# ============================================================
# ✅ test_nasdaq_api.py
# 📍 One-off diagnostic for Nasdaq Halted Stocks Endpoint
# 🔐 Requires: NASDAQ_API_KEY set in environment
# 🔍 Logs status code + trimmed response (500 char max)
# Author: Captain & Chatman
# Version: MPA Phase I — API Diagnostic Kit
# ============================================================

import logging
import os

import requests
from dotenv import load_dotenv

# ✅ Load from .env file
load_dotenv()

# ✅ Load API key from environment
NASDAQ_API_KEY = os.getenv("NASDAQ_API_KEY")
if not NASDAQ_API_KEY:
    raise ValueError("❌ NASDAQ_API_KEY is not set in environment variables.")

# ✅ API Endpoint + Auth Header
URL = "https://api.nasdaq.com/api/marketmovers/halted"
HEADERS = {"Authorization": f"Bearer {NASDAQ_API_KEY}"}

# ✅ Optional proxy support
PROXIES = (
    {
        "http": os.getenv("HTTP_PROXY"),
        "https": os.getenv("HTTPS_PROXY"),
    }
    if os.getenv("HTTP_PROXY") and os.getenv("HTTPS_PROXY")
    else {}
)

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ Send test request
try:
    response = requests.get(URL, headers=HEADERS, proxies=PROXIES, timeout=5)
    response.raise_for_status()

    logger.info("✅ Status Code: %s", response.status_code)
    logger.info("📦 Response Preview (500 chars):\n%s", response.text[:500])
except requests.exceptions.Timeout:
    logger.error("❌ Request timed out! Nasdaq API is not responding.")
except requests.exceptions.RequestException as e:
    logger.error("❌ Request failed: %s", e)
