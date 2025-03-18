from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from control_console.database import engine
from pydantic import BaseModel

router = APIRouter()

# ✅ API Key Model
class APIKey(BaseModel):
    name: str
    provider: str
    priority_order: int
    is_active: bool
    cost_per_month: float
    cost_per_year: float
    key_label: str
    api_secret: str

# ✅ GET All API Keys
@router.get("/", tags=["api_keys"])
def get_all_api_keys():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, name, provider, priority_order, is_active, cost_per_month, cost_per_year, key_label FROM api_keys_table ORDER BY priority_order ASC"))
        api_keys = [dict(row) for row in result.mappings()]
    return api_keys

# ✅ ADD New API Key
@router.post("/", tags=["api_keys"])
def add_api_key(api_key: APIKey):
    with engine.connect() as connection:
        connection.execute(
            text("INSERT INTO api_keys_table (name, provider, priority_order, is_active, cost_per_month, cost_per_year, key_label, api_secret) VALUES (:name, :provider, :priority_order, :is_active, :cost_per_month, :cost_per_year, :key_label, :api_secret)"),
            {
                "name": api_key.name,
                "provider": api_key.provider,
                "priority_order": api_key.priority_order,
                "is_active": api_key.is_active,
                "cost_per_month": api_key.cost_per_month,
                "cost_per_year": api_key.cost_per_year,
                "key_label": api_key.key_label,
                "api_secret": api_key.api_secret
            }
        )
        connection.commit()
    return {"message": "API key added successfully"}

# ✅ DELETE API Key
@router.delete("/{api_key_id}", tags=["api_keys"])
def delete_api_key(api_key_id: int):
    with engine.connect() as connection:
        result = connection.execute(text("DELETE FROM api_keys_table WHERE id = :id"), {"id": api_key_id})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key deleted successfully"}

# ✅ UPDATE API Key Status
@router.put("/{api_key_id}/status", tags=["api_keys"])
def update_api_key_status(api_key_id: int, is_active: bool):
    with engine.connect() as connection:
        result = connection.execute(text("UPDATE api_keys_table SET is_active = :is_active WHERE id = :id"), {"id": api_key_id, "is_active": is_active})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key status updated successfully"}

# ✅ UPDATE API Key Priority
@router.put("/{api_key_id}/priority", tags=["api_keys"])
def update_api_key_priority(api_key_id: int, priority_order: int):
    with engine.connect() as connection:
        result = connection.execute(text("UPDATE api_keys_table SET priority_order = :priority_order WHERE id = :id"), {"id": api_key_id, "priority_order": priority_order})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key priority updated successfully"}

# ✅ TRACK API Key Errors
@router.put("/{api_key_id}/error", tags=["api_keys"])
def log_api_key_error(api_key_id: int, error_code: str):
    with engine.connect() as connection:
        result = connection.execute(text("UPDATE api_keys_table SET error_code = :error_code WHERE id = :id"), {"id": api_key_id, "error_code": error_code})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key error logged successfully"}