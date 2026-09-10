from contextlib import closing

import sqlite3
import os

from pathlib import Path

BASE_DIR = Path(__file__).parent

# Vercel serverless functions can only write to /tmp at runtime.
DB_PATH = Path("/tmp/diabetes_tracker.db") if os.getenv("VERCEL") else BASE_DIR / "diabetes_tracker.db"

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
