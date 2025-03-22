# control_console/rate_limiter.py

import time
from collections import defaultdict
from typing import Tuple

# Track attempts per IP: { ip_address: [timestamp1, timestamp2, ...] }
attempt_log = defaultdict(list)

# Configuration
MAX_ATTEMPTS = 6
WINDOW_SECONDS = 30 * 60  # 30 minutes

def is_rate_limited(ip_address: str) -> Tuple[bool, int]:
    """
    Returns:
        (True, seconds_remaining) if rate-limited
        (False, 0) if not rate-limited
    """
    now = time.time()
    attempts = attempt_log[ip_address]

    # Remove expired timestamps
    attempt_log[ip_address] = [ts for ts in attempts if now - ts < WINDOW_SECONDS]
    attempts = attempt_log[ip_address]

    if len(attempts) >= MAX_ATTEMPTS:
        seconds_remaining = int(WINDOW_SECONDS - (now - attempts[0]))
        return True, seconds_remaining

    return False, 0

def record_attempt(ip_address: str):
    """Record a new failed attempt for the IP address."""
    now = time.time()
    attempt_log[ip_address].append(now)