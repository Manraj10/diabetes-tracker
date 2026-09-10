from contextlib import closing
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from app.database import get_connection

summary_router = APIRouter()

@summary_router.get("/api/summary/today")
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


@summary_router.get("/api/summary/recent")
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