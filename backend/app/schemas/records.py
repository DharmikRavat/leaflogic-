import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class WateringLogCreate(BaseModel):
    plant_id: uuid.UUID
    watered_at: Optional[datetime] = None
    amount_ml: Optional[float] = None
    soil_condition: str
    notes: Optional[str] = None


class WateringLogResponse(WateringLogCreate):
    id: uuid.UUID
    watered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiagnosisResponse(BaseModel):
    id: uuid.UUID
    plant_id: uuid.UUID
    image_url: str
    predicted_class: Optional[str]
    confidence: Optional[float]
    status: str
    symptoms: list[str]
    recommendations: list[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)