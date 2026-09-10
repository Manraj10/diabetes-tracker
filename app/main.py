from __future__ import annotations


from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.database import init_db
from app.routers.api  import api_router

# TODO: consolidate as this is also redefined in database.py
BASE_DIR = Path(__file__).parent

INDEX_HTML = BASE_DIR / "templates" / "index.html"


app = FastAPI(title="Diabetes Tracker API", version="2.0.")

# TODO: update to lifespan as on_event is deprecated
@app.on_event("startup")
def startup() -> None:
    init_db()

@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return INDEX_HTML.read_text(encoding="utf-8")

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)