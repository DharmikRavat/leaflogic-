import argparse
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from app.db.session import create_indexes, database


def normalize_id(value):
    if value is None:
        return None
    if isinstance(value, bytes):
        return str(uuid.UUID(bytes=value))
    try:
        return str(uuid.UUID(str(value)))
    except ValueError:
        return str(value)


def normalize_email(value):
    return str(value).strip().lower() if value is not None else None


def normalize_datetime(value):
    if not value or isinstance(value, datetime):
        return value
    parsed = datetime.fromisoformat(value)
    return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed


def normalize_json(value):
    return json.loads(value) if isinstance(value, str) else value


def read_rows(connection, table):
    try:
        connection.row_factory = sqlite3.Row
        return [dict(row) for row in connection.execute(f'SELECT * FROM "{table}"')]
    except sqlite3.OperationalError:
        return []


def migrate_collection(collection, documents):
    inserted = 0
    for document in documents:
        result = collection.update_one(
            {"_id": document["_id"]}, {"$setOnInsert": document}, upsert=True
        )
        inserted += int(result.upserted_id is not None)
    return inserted


def main():
    parser = argparse.ArgumentParser(description="Copy existing LeafLogic SQLite records into MongoDB.")
    parser.add_argument("--source", default="leaflogic.db", help="SQLite database file to migrate")
    args = parser.parse_args()
    source = Path(args.source)
    if not source.is_file():
        parser.error(f"SQLite database not found: {source}")

    create_indexes()
    connection = sqlite3.connect(source)
    try:
        users = read_rows(connection, "users")
        plants = read_rows(connection, "plants")
        diagnoses = read_rows(connection, "diagnoses")
        waterings = read_rows(connection, "watering_logs")
    finally:
        connection.close()

    owner_by_plant = {}
    for user in users:
        user["_id"] = normalize_id(user.pop("id"))
        user["email"] = normalize_email(user.get("email"))
        user["created_at"] = normalize_datetime(user.get("created_at"))
        user["updated_at"] = normalize_datetime(user.get("updated_at"))

    for plant in plants:
        plant["_id"] = normalize_id(plant.pop("id"))
        plant["user_id"] = normalize_id(plant["user_id"])
        owner_by_plant[plant["_id"]] = plant["user_id"]
        plant["planted_at"] = normalize_datetime(plant.get("planted_at"))
        plant["created_at"] = normalize_datetime(plant.get("created_at"))
        plant["updated_at"] = normalize_datetime(plant.get("updated_at"))

    for diagnosis in diagnoses:
        diagnosis["_id"] = normalize_id(diagnosis.pop("id"))
        diagnosis["plant_id"] = normalize_id(diagnosis["plant_id"])
        diagnosis["created_at"] = normalize_datetime(diagnosis.get("created_at"))
        diagnosis["symptoms"] = normalize_json(diagnosis.get("symptoms")) or []
        diagnosis["recommendations"] = normalize_json(diagnosis.get("recommendations")) or []

    for watering in waterings:
        watering["_id"] = normalize_id(watering.pop("id"))
        watering["plant_id"] = normalize_id(watering["plant_id"])
        watering["user_id"] = owner_by_plant.get(watering["plant_id"])
        watering["watered_at"] = normalize_datetime(watering.get("watered_at"))

    counts = {
        "users": migrate_collection(database.users, users),
        "plants": migrate_collection(database.plants, plants),
        "diagnoses": migrate_collection(database.diagnoses, diagnoses),
        "waterings": migrate_collection(database.waterings, waterings),
    }
    print("Inserted documents:", counts)


if __name__ == "__main__":
    main()