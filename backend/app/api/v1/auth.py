from datetime import datetime, timedelta, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.db.session import serialize_document
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token
from app.api.dependencies import get_current_user

router = APIRouter()


def normalize_email(value: str) -> str:
    return str(value).strip().lower()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Database = Depends(get_db)):
    email = normalize_email(user_in.email)
    user = {
        "_id": str(uuid.uuid4()),
        "email": email,
        "hashed_password": security.get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    }
    try:
        db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")
    user.pop("hashed_password")
    return serialize_document(user)

@router.post("/login", response_model=Token)
def login(
    db: Database = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    email = normalize_email(form_data.username)
    user = db.users.find_one({"email": email})
    if not user:
        user = next(
            (
                candidate
                for candidate in db.users.find({"email": {"$exists": True}})
                if normalize_email(candidate.get("email")) == email
            ),
            None,
        )
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=400, detail="Incorrect email or password"
        )

    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user["_id"], expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout():
    # Real logout would involve token blocklisting
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    current_user.pop("hashed_password", None)
    return serialize_document(current_user)
