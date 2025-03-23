# control_console/rate_limiter.py

from datetime import datetime, timedelta, UTC
from typing import Tuple
from db import get_db_connection

# Configuration
MAX_ATTEMPTS = 6
WINDOW_MINUTES = 30


def is_rate_limited(ip_address: str) -> Tuple[bool, int]:
    """
    Checks if an IP address has exceeded the allowed number of login attempts.

    Returns:
        (True, seconds_remaining) if rate-limited
        (False, 0) if not
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cutoff_time = datetime.now(UTC) - timedelta(minutes=WINDOW_MINUTES)

    cur.execute("""
        SELECT attempt_time FROM login_attempts
        WHERE ip_address = %s AND attempt_time > %s
        ORDER BY attempt_time ASC
    """, (ip_address, cutoff_time))

    attempts = cur.fetchall()
    cur.close()
    conn.close()

    if len(attempts) >= MAX_ATTEMPTS:
        oldest_attempt = attempts[0][0]
        seconds_remaining = int((cutoff_time + timedelta(minutes=WINDOW_MINUTES) - oldest_attempt).total_seconds())
        return True, max(0, seconds_remaining)

    return False, 0


def record_attempt(ip_address: str):
    """Records a failed login attempt in the database."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO login_attempts (ip_address, attempt_time)
        VALUES (%s, %s)
    """, (ip_address, datetime.now(UTC)))

    conn.commit()
    cur.close()
    conn.close()