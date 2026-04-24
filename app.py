from __future__ import annotations

import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


DB_PATH = Path(__file__).with_name("diabetes_tracker.db")


class EntryCreate(BaseModel):
    glucose: int = Field(..., ge=40, le=500)
    meal: Optional[str] = None
    exercise_minutes: int = Field(default=0, ge=0, le=600)
    notes: Optional[str] = Field(default=None, max_length=300)


class Entry(BaseModel):
    id: int
    glucose: int
    meal: Optional[str]
    exercise_minutes: int
    notes: Optional[str]
    created_at: str


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with closing(get_connection()) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                glucose INTEGER NOT NULL,
                meal TEXT,
                exercise_minutes INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


app = FastAPI(title="Diabetes Tracker API", version="1.0.0")


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Diabetes Tracker API is running"}


@app.post("/entries", response_model=Entry, status_code=201)
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


@app.get("/entries", response_model=list[Entry])
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


@app.get("/summary/today")
def summary_today() -> dict[str, Optional[float]]:
    today_prefix = datetime.now().date().isoformat()
    with closing(get_connection()) as connection:
        row = connection.execute(
            """
            SELECT
                COUNT(*) AS total_entries,
                AVG(glucose) AS average_glucose,
                MIN(glucose) AS min_glucose,
                MAX(glucose) AS max_glucose
            FROM entries
            WHERE created_at LIKE ?
            """,
            (f"{today_prefix}%",),
        ).fetchone()

    total_entries = int(row["total_entries"])
    if total_entries == 0:
        raise HTTPException(status_code=404, detail="No entries found for today")

    return {
        "date": today_prefix,
        "total_entries": total_entries,
        "average_glucose": round(row["average_glucose"], 2),
        "min_glucose": row["min_glucose"],
        "max_glucose": row["max_glucose"],
    }


@app.get("/summary/recent")
def summary_recent(days: int = 7) -> dict[str, object]:
    safe_days = max(1, min(days, 30))
    with closing(get_connection()) as connection:
        rows = connection.execute(
            """
            SELECT
                substr(created_at, 1, 10) AS entry_date,
                COUNT(*) AS total_entries,
                AVG(glucose) AS average_glucose,
                MIN(glucose) AS min_glucose,
                MAX(glucose) AS max_glucose
            FROM entries
            GROUP BY substr(created_at, 1, 10)
            ORDER BY entry_date DESC
            LIMIT ?
            """,
            (safe_days,),
        ).fetchall()

    return {
        "days_requested": safe_days,
        "daily_summaries": [
            {
                "date": row["entry_date"],
                "total_entries": row["total_entries"],
                "average_glucose": round(row["average_glucose"], 2),
                "min_glucose": row["min_glucose"],
                "max_glucose": row["max_glucose"],
            }
            for row in rows
        ],
    }
