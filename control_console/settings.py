from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from control_console.database import engine
from pydantic import BaseModel

router = APIRouter()


# ✅ Define Setting Model
class Setting(BaseModel):
    setting_key: str
    setting_value: str


# ✅ GET All Settings
@router.get("/", tags=["settings"])
def get_all_settings():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, setting_key, setting_value FROM global_settings ORDER BY setting_key"))
        settings = [dict(row) for row in result.mappings()]

    if not settings:
        raise HTTPException(status_code=404, detail="No settings found")

    return settings


# ✅ GET a Specific Setting
@router.get("/{setting_key}", tags=["settings"])
def get_setting(setting_key: str):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, setting_key, setting_value FROM global_settings WHERE setting_key = :setting_key"),
            {"setting_key": setting_key})
        setting = result.mappings().first()

    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")

    return setting


# ✅ ADD or UPDATE a Setting
@router.post("/", tags=["settings"])
def add_or_update_setting(setting: Setting):
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id FROM global_settings WHERE setting_key = :setting_key"),
                                    {"setting_key": setting.setting_key})
        existing = result.fetchone()

        if existing:
            connection.execute(
                text("UPDATE global_settings SET setting_value = :setting_value WHERE setting_key = :setting_key"),
                {"setting_key": setting.setting_key, "setting_value": setting.setting_value})
        else:
            connection.execute(
                text("INSERT INTO global_settings (setting_key, setting_value) VALUES (:setting_key, :setting_value)"),
                {"setting_key": setting.setting_key, "setting_value": setting.setting_value})

        connection.commit()

    return {"message": f"Setting '{setting.setting_key}' updated successfully"}


# ✅ DELETE a Setting
@router.delete("/{setting_key}", tags=["settings"])
def delete_setting(setting_key: str):
    with engine.connect() as connection:
        result = connection.execute(text("DELETE FROM global_settings WHERE setting_key = :setting_key"),
                                    {"setting_key": setting_key})
        connection.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")

    return {"message": f"Setting '{setting_key}' deleted successfully"}