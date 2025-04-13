# ============================================================
# ✅ test_nasdaq_api.py
# 📍 One-off diagnostic for Nasdaq Halted Stocks Endpoint
# 🔐 Requires: NASDAQ_API_KEY set in environment
# 🔍 Logs status code + trimmed response (500 char max)
# Author: Captain & Chatman
# Version: MPA Phase I — API Diagnostic Kit
# ============================================================

import os
import requests
import logging

# ✅ Load API key from environment
NASDAQ_API_KEY = os.getenv("NASDAQ_API_KEY")
if not NASDAQ_API_KEY:
    raise ValueError("❌ NASDAQ_API_KEY is not set in environment variables.")

# ✅ API Endpoint + Auth Header
url = "https://api.nasdaq.com/api/marketmovers/halted"
headers = {"Authorization": f"Bearer {NASDAQ_API_KEY}"}

# ✅ Optional proxy support
proxies = (
    {
        "http": os.getenv("HTTP_PROXY"),
        "https": os.getenv("HTTPS_PROXY"),
    }
    if os.getenv("HTTP_PROXY") and os.getenv("HTTPS_PROXY")
    else {}
)

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ Send test request
try:
    response = requests.get(url, headers=headers, proxies=proxies, timeout=5)
    response.raise_for_status()

    logging.info(f"✅ Status Code: {response.status_code}")
    logging.info(f"📦 Response Preview (500 chars):\n{response.text[:500]}")
except requests.exceptions.Timeout:
    logging.error("❌ Request timed out! Nasdaq API is not responding.")
except requests.exceptions.RequestException as e:
    logging.error(f"❌ Request failed: {e}")
