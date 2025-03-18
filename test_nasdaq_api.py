import requests

NASDAQ_API_KEY = "your_real_nasdaq_api_key"
url = "https://api.nasdaq.com/api/marketmovers/halted"
headers = {"Authorization": f"Bearer {NASDAQ_API_KEY}"}
proxies = {
    "http": "http://proxy.example.com:8080",
    "https": "https://proxy.example.com:8080"
}  # Replace with a working proxy if needed

try:
    response = requests.get(url, headers=headers, proxies=proxies, timeout=5)
    print(response.status_code)
    print(response.text[:500])  # Print first 500 characters
except requests.exceptions.Timeout:
    print("❌ Request timed out! Nasdaq API is not responding.")
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {e}")