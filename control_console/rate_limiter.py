# ===================================================
# ✅ FILE: rate_limiter.py
# 🧠 Author: Captain & Chatman
# 🛡️ Purpose: Track and enforce login attempt rate limits
# ===================================================

import logging
from datetime import datetime, timedelta
from typing import Tuple

# ✅ Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ✅ Configuration
MAX_ATTEMPTS = 6
WINDOW_MINUTES = 30


# ✅ Check if IP is rate-limited
async def is_rate_limited(db, ip_address: str) -> Tuple[bool, int]:
    """
    Checks if an IP address has exceeded the allowed number of login attempts.
    Returns (True, seconds_remaining) if rate-limited, otherwise (False, 0).
    """
    cutoff_time = datetime.utcnow() - timedelta(minutes=WINDOW_MINUTES)

    query = """
        SELECT attempt_time FROM login_attempts
        WHERE ip_address = $1 AND attempt_time > $2
        ORDER BY attempt_time ASC
        LIMIT $3
    """
    try:
        rows = await db.fetch(query, ip_address, cutoff_time, MAX_ATTEMPTS)

        if len(rows) >= MAX_ATTEMPTS:
            oldest_attempt = rows[0]["attempt_time"]
            seconds_remaining = int(
                (
                    oldest_attempt
                    + timedelta(minutes=WINDOW_MINUTES)
                    - datetime.utcnow()
                ).total_seconds()
            )
            return True, max(0, seconds_remaining)
        return False, 0

    except Exception as e:
        logger.error("❌ Error checking rate limit for IP %s: %s", ip_address, e)
        return False, 0  # Fail open (avoid false lockouts)


# ✅ Record failed login attempt
async def record_attempt(db, ip_address: str):
    """
    Records a failed login attempt for the given IP address.
    """
    query = """
        INSERT INTO login_attempts (ip_address, attempt_time)
        VALUES ($1, $2)
    """
    try:
        await db.execute(query, ip_address, datetime.utcnow())
    except Exception as e:
        logger.error("❌ Error recording login attempt for IP %s: %s", ip_address, e)
