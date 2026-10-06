from fastapi import APIRouter
from app.api.v1 import auth, care, plants

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(plants.router, prefix="/plants", tags=["plants"])
api_router.include_router(care.router, prefix="/care", tags=["care"])
