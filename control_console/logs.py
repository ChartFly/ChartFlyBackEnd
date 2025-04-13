# ===================================================
# ✅ FILE: control_console/logs.py
# 📌 PURPOSE: Handles viewing, inserting, and cleaning admin logs
# 🛠️ STATUS: Active (MPA Phase I) — Author: Captain & Chatman
# ===================================================

from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

router = APIRouter()

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ Log Entry Model
class LogEntry(BaseModel):
    admin_id: int
    action: str
    details: str

# ✅ GET All Logs (Optional Filtering)
@router.get("/", tags=["logs"])
async def get_logs(
    request: Request,
    admin_id: int = Query(None),
    action: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    db = request.state.db

    query = "SELECT id, admin_id, action, details, timestamp FROM system_logs WHERE 1=1"
    params = []
    index = 1

    if admin_id is not None:
        query += f" AND admin_id = ${index}"
        params.append(admin_id)
        index += 1

    if action is not None:
        query += f" AND action = ${index}"
        params.append(action)
        index += 1

    if start_date is not None:
        query += f" AND timestamp >= ${index}"
        params.append(start_date)
        index += 1

    if end_date is not None:
        query += f" AND timestamp <= ${index}"
        params.append(end_date)
        index += 1

    query += " ORDER BY timestamp DESC"

    rows = await db.fetch(query, *params)
    if not rows:
        raise HTTPException(status_code=404, detail="No logs found for the given criteria")

    return [dict(row) for row in rows]

# ✅ ADD New Log Entry
@router.post("/", tags=["logs"])
async def add_log_entry(log: LogEntry, request: Request):
    db = request.state.db

    await db.execute(
        """
        INSERT INTO system_logs (admin_id, action, details, timestamp)
        VALUES ($1, $2, $3, $4)
        """,
        log.admin_id, log.action, log.details, datetime.utcnow()
    )

    logging.info(f"📝 Log entry added for admin {log.admin_id}: {log.action}")
    return {"message": "Log entry added successfully"}

# ✅ DELETE Old Logs (Cleanup)
@router.delete("/cleanup", tags=["logs"])
async def delete_old_logs(days_old: int = Query(...), request: Request = None):
    db = request.state.db

    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    result = await db.execute(
        "DELETE FROM system_logs WHERE timestamp < $1",
        cutoff_date
    )

    logging.info(f"🧹 Deleted logs older than {days_old} days (before {cutoff_date.isoformat()})")
    return {"message": f"Deleted logs older than {days_old} days"}
