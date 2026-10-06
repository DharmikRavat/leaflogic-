import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PlantBase(BaseModel):
    name: str
    species: str
    planted_at: Optional[datetime] = None
    growth_stage: Optional[str] = None
    pot_size: Optional[str] = None
    growing_location: Optional[str] = None
    sunlight_hours: Optional[float] = None
    drainage_quality: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    health_status: Optional[str] = "Healthy"

class PlantCreate(PlantBase):
    pass

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    planted_at: Optional[datetime] = None
    growth_stage: Optional[str] = None
    pot_size: Optional[str] = None
    growing_location: Optional[str] = None
    sunlight_hours: Optional[float] = None
    drainage_quality: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    health_status: Optional[str] = None

class PlantResponse(PlantBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
