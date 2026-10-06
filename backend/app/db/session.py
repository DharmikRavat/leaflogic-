from pymongo import MongoClient
from pymongo.errors import PyMongoError
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
database = client[settings.MONGODB_DATABASE]


def get_db():
    return database


def check_database_connection() -> bool:
    try:
        database.command("ping")
        return True
    except PyMongoError:
        return False


def create_indexes() -> None:
    database.users.create_index("email", unique=True)
    database.plants.create_index([("user_id", 1), ("created_at", -1)])
    database.waterings.create_index([("user_id", 1), ("watered_at", -1)])
    database.diagnoses.create_index([("plant_id", 1), ("created_at", -1)])


def serialize_document(document):
    if document is None:
        return None
    document["id"] = str(document.pop("_id"))
    return document
