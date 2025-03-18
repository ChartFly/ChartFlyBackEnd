from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from control_console.database import engine
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# ✅ Log Entry Model
class LogEntry(BaseModel):
    admin_id: int
    action: str
    details: str

# ✅ GET All Logs (Optional Filtering)
@router.get("/", tags=["logs"])
def get_logs(admin_id: int = None, action: str = None, start_date: str = None, end_date: str = None):
    query = "SELECT id, admin_id, action, details, timestamp FROM system_logs WHERE 1=1"
    params = {}

    if admin_id is not None:
        query += " AND admin_id = :admin_id"
        params["admin_id"] = admin_id

    if action is not None:
        query += " AND action = :action"
        params["action"] = action

    if start_date is not None:
        query += " AND timestamp >= :start_date"
        params["start_date"] = start_date

    if end_date is not None:
        query += " AND timestamp <= :end_date"
        params["end_date"] = end_date

    query += " ORDER BY timestamp DESC"

    with engine.connect() as connection:
        result = connection.execute(text(query), params)
        logs = [dict(row) for row in result.mappings()]

    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for the given criteria")

    return logs

# ✅ ADD New Log Entry
@router.post("/", tags=["logs"])
def add_log_entry(log: LogEntry):
    with engine.connect() as connection:
        connection.execute(
            text("INSERT INTO system_logs (admin_id, action, details, timestamp) VALUES (:admin_id, :action, :details, :timestamp)"),
            {
                "admin_id": log.admin_id,
                "action": log.action,
                "details": log.details,
                "timestamp": datetime.utcnow()
            }
        )
        connection.commit()
    return {"message": "Log entry added successfully"}

# ✅ DELETE Old Logs (Cleanup)
@router.delete("/cleanup", tags=["logs"])
def delete_old_logs(days_old: int):
    with engine.connect() as connection:
        result = connection.execute(text("DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL ':days_old days'"), {"days_old": days_old})
        connection.commit()
    return {"message": f"Deleted logs older than {days_old} days"}