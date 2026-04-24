# Diabetes Tracker

A lightweight health-tracking app for logging glucose readings, meals, exercise, and notes. This project is designed as a portfolio-friendly example of building a simple backend system with Python, FastAPI, and SQLite.

## Why this project matters

This project shows how software can support practical everyday decisions through:

- structured data collection
- trend visibility over time
- simple API design
- lightweight persistence with SQLite

## Tech stack

- Python
- FastAPI
- SQLite

## Features

- add glucose entries with notes, meals, exercise, and timestamps
- list recent entries
- get a quick daily summary with average, min, and max glucose values
- store data locally in SQLite

## Run locally

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

Then open:

```text
http://127.0.0.1:8000/docs
```

## Example API flow

Create an entry:

```bash
curl -X POST http://127.0.0.1:8000/entries ^
  -H "Content-Type: application/json" ^
  -d "{\"glucose\":118,\"meal\":\"Lunch\",\"exercise_minutes\":30,\"notes\":\"Post-walk reading\"}"
```

List entries:

```bash
curl http://127.0.0.1:8000/entries
```

Daily summary:

```bash
curl http://127.0.0.1:8000/summary/today
```

## Resume-ready description

Built a Python and FastAPI health-tracking application that stores glucose readings and daily activity data in SQLite, exposing API endpoints for data logging, history retrieval, and summary insights.
