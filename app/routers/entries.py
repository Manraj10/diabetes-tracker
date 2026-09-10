from contextlib import closing
from datetime import datetime

from app.database import get_connection
from fastapi import APIRouter
from app.models.Entry import Entry, EntryCreate

entries_router = APIRouter()

@entries_router.post("/api/entries", response_model=Entry, status_code=201)
def create_entry(entry: EntryCreate) -> Entry:
    created_at = datetime.now().isoformat(timespec="seconds")
    with closing(get_connection()) as connection:
        cursor = connection.execute(
            """
            INSERT INTO entries (glucose, meal, exercise_minutes, notes, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (entry.glucose, entry.meal, entry.exercise_minutes, entry.notes, created_at),
        )
        connection.commit()
        entry_id = cursor.lastrowid
        row = connection.execute(
            "SELECT id, glucose, meal, exercise_minutes, notes, created_at FROM entries WHERE id = ?",
            (entry_id,),
        ).fetchone()

    return Entry(**dict(row))


@entries_router.get("/api/entries", response_model=list[Entry])
def list_entries(limit: int = 20) -> list[Entry]:
    safe_limit = max(1, min(limit, 100))
    with closing(get_connection()) as connection:
        rows = connection.execute(
            """
            SELECT id, glucose, meal, exercise_minutes, notes, created_at
            FROM entries
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (safe_limit,),
        ).fetchall()
    return [Entry(**dict(row)) for row in rows]