from contextlib import closing
import csv
import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.database import get_connection

from app.routers.entries import entries_router
from app.routers.summary import summary_router

api_router = APIRouter()
api_router.include_router(entries_router)
api_router.include_router(summary_router)

@api_router.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@api_router.get("/api/export/csv")
def export_csv() -> StreamingResponse:
    with closing(get_connection()) as connection:
        rows = connection.execute(
            """
            SELECT id, glucose, meal, exercise_minutes, notes, created_at
            FROM entries
            ORDER BY created_at DESC
            """
        ).fetchall()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "glucose", "meal", "exercise_minutes", "notes", "created_at"])
    for row in rows:
        writer.writerow(
            [
                row["id"],
                row["glucose"],
                row["meal"],
                row["exercise_minutes"],
                row["notes"],
                row["created_at"],
            ]
        )
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=diabetes-tracker-export.csv"},
    )