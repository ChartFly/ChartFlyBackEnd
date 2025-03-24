import os
import requests
import logging

# ✅ Load API Key and Proxy from environment variables
NASDAQ_API_KEY = os.getenv("NASDAQ_API_KEY")
if not NASDAQ_API_KEY:
    raise ValueError("❌ NASDAQ_API_KEY is not set in environment variables.")

# ✅ Set the API URL and headers
url = "https://api.nasdaq.com/api/marketmovers/halted"
headers = {"Authorization": f"Bearer {NASDAQ_API_KEY}"}

# Optionally load proxy from environment variables (if needed)
proxies = {
    "http": os.getenv("HTTP_PROXY"),
    "https": os.getenv("HTTPS_PROXY")
} if os.getenv("HTTP_PROXY") and os.getenv("HTTPS_PROXY") else {}

# ✅ Setup logging
logging.basicConfig(level=logging.INFO)

try:
    response = requests.get(url, headers=headers, proxies=proxies, timeout=5)
    response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)
    logging.info(f"✅ Status Code: {response.status_code}")
    logging.info(f"✅ Response (first 500 chars): {response.text[:500]}")  # Print first 500 characters of response
except requests.exceptions.Timeout:
    logging.error("❌ Request timed out! Nasdaq API is not responding.")
except requests.exceptions.RequestException as e:
    logging.error(f"❌ Request failed: {e}")