import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.api.dependencies import get_current_user
from app.db.session import get_db, serialize_document
from app.schemas.records import WateringLogCreate, WateringLogResponse

router = APIRouter()


@router.get("/waterings", response_model=List[WateringLogResponse])
def read_waterings(
    db: Database = Depends(get_db), current_user=Depends(get_current_user)
):
    records = db.waterings.find({"user_id": current_user["_id"]}).sort("watered_at", -1)
    return [serialize_document(record) for record in records]


@router.post("/waterings", response_model=WateringLogResponse, status_code=status.HTTP_201_CREATED)
def create_watering(
    log_in: WateringLogCreate,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plant_id = str(log_in.plant_id)
    plant = db.plants.find_one({"_id": plant_id, "user_id": current_user["_id"]}, {"_id": 1})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    log = log_in.model_dump()
    log.update({
        "_id": str(uuid.uuid4()),
        "plant_id": plant_id,
        "user_id": current_user["_id"],
        "watered_at": log_in.watered_at or datetime.now(timezone.utc),
    })
    db.waterings.insert_one(log)
    return serialize_document(log)