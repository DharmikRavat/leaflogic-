import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pymongo import ReturnDocument
from pymongo.database import Database
from app.api.dependencies import get_current_user
from app.db.session import get_db, serialize_document
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse
from app.schemas.records import DiagnosisResponse

router = APIRouter()


def owned_plant_filter(plant_id: uuid.UUID, current_user: dict) -> dict:
    return {"_id": str(plant_id), "user_id": current_user["_id"]}


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def create_plant(
    plant_in: PlantCreate,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plant = plant_in.model_dump()
    plant.update({
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    })
    db.plants.insert_one(plant)
    return serialize_document(plant)


@router.get("", response_model=List[PlantResponse])
def read_plants(
    skip: int = 0,
    limit: int = 100,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plants = db.plants.find({"user_id": current_user["_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    return [serialize_document(plant) for plant in plants]


@router.get("/{plant_id}", response_model=PlantResponse)
def read_plant(
    plant_id: uuid.UUID,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    plant = db.plants.find_one(owned_plant_filter(plant_id, current_user))
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return serialize_document(plant)


@router.patch("/{plant_id}", response_model=PlantResponse)
def update_plant(
    plant_id: uuid.UUID,
    plant_in: PlantUpdate,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = owned_plant_filter(plant_id, current_user)
    update_data = plant_in.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    result = db.plants.find_one_and_update(query, {"$set": update_data}, return_document=ReturnDocument.AFTER)
    if not result:
        raise HTTPException(status_code=404, detail="Plant not found")
    return serialize_document(result)


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(
    plant_id: uuid.UUID,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = owned_plant_filter(plant_id, current_user)
    result = db.plants.delete_one(query)
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Plant not found")
    db.waterings.delete_many({"plant_id": str(plant_id), "user_id": current_user["_id"]})
    db.diagnoses.delete_many({"plant_id": str(plant_id)})
    return None


@router.get("/{plant_id}/diagnoses", response_model=List[DiagnosisResponse])
def read_plant_diagnoses(
    plant_id: uuid.UUID,
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not db.plants.find_one(owned_plant_filter(plant_id, current_user), {"_id": 1}):
        raise HTTPException(status_code=404, detail="Plant not found")
    diagnoses = db.diagnoses.find({"plant_id": str(plant_id)}).sort("created_at", -1)
    return [serialize_document(diagnosis) for diagnosis in diagnoses]


@router.post("/{plant_id}/diagnose")
def diagnose_plant_image(
    plant_id: uuid.UUID,
    image: UploadFile = File(...),
    db: Database = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not db.plants.find_one(owned_plant_filter(plant_id, current_user), {"_id": 1}):
        raise HTTPException(status_code=404, detail="Plant not found")
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="Upload a JPEG or PNG image")
    raise HTTPException(
        status_code=503,
        detail="Image diagnosis is unavailable because no ML model is configured.",
    )