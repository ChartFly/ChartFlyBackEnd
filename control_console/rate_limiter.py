# control_console/rate_limiter.py

from datetime import datetime, timedelta, UTC
from typing import Tuple

# Configuration
MAX_ATTEMPTS = 6
WINDOW_MINUTES = 30


async def is_rate_limited(db, ip_address: str) -> Tuple[bool, int]:
    """
    Checks if an IP address has exceeded the allowed number of login attempts.
    Returns (True, seconds_remaining) if rate-limited, otherwise (False, 0).
    """
    cutoff_time = datetime.now(UTC) - timedelta(minutes=WINDOW_MINUTES)

    query = """
        SELECT attempt_time FROM login_attempts
        WHERE ip_address = $1 AND attempt_time > $2
        ORDER BY attempt_time ASC
    """
    rows = await db.fetch(query, ip_address, cutoff_time)

    if len(rows) >= MAX_ATTEMPTS:
        oldest_attempt = rows[0]["attempt_time"]
        seconds_remaining = int((oldest_attempt + timedelta(minutes=WINDOW_MINUTES) - datetime.now(UTC)).total_seconds())
        return True, max(0, seconds_remaining)

    return False, 0


async def record_attempt(db, ip_address: str):
    """Records a failed login attempt for the given IP."""
    query = """
        INSERT INTO login_attempts (ip_address, attempt_time)
        VALUES ($1, $2)
    """
    await db.execute(query, ip_address, datetime.now(UTC))