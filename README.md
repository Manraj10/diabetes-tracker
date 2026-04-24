# Diabetes Tracker

A small FastAPI backend for logging glucose readings, meals, exercise, and notes. The project focuses on building a clean local health-data workflow with persistent storage and simple summaries.

## Overview

The app stores entries in SQLite and exposes endpoints for:

- logging readings
- listing recent entries
- viewing same-day summaries
- viewing recent daily trend summaries

## Built with

- Python
- FastAPI
- SQLite

## What it does

- saves glucose entries with timestamps
- records optional meal and exercise context
- returns recent history
- calculates min, max, and average glucose values
- groups recent readings into daily summaries

## API

### `POST /entries`
Create a new glucose entry.

### `GET /entries`
Return the most recent entries.

### `GET /summary/today`
Return a summary for the current day.

### `GET /summary/recent?days=7`
Return grouped daily summaries for the most recent days with recorded data.

## Running locally

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

Interactive docs:

```text
http://127.0.0.1:8000/docs
```

## Example request

```bash
curl -X POST http://127.0.0.1:8000/entries ^
  -H "Content-Type: application/json" ^
  -d "{\"glucose\":118,\"meal\":\"Lunch\",\"exercise_minutes\":30,\"notes\":\"Post-walk reading\"}"
```

## Notes

This project is intentionally lightweight and local-first. It is designed to show backend structure, persistence, and summary logic without needing external services.
