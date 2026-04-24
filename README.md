# Diabetes Tracker

A local-first health tracking app with a FastAPI backend, SQLite storage, and a simple browser dashboard. The project focuses on turning raw daily entries into something easier to review over time.

## Overview

The app supports:

- logging glucose readings with context
- tracking recent history
- summarizing daily averages and ranges
- exporting the data to CSV
- viewing trends in a lightweight frontend dashboard

## Built with

- Python
- FastAPI
- SQLite
- HTML
- JavaScript

## Features

- save glucose entries with meal and exercise context
- list recent records
- compute same-day summary stats
- group recent data into daily trend summaries
- export recorded entries as CSV
- use a browser dashboard for quick review

## API

### `POST /api/entries`
Create a new glucose entry.

### `GET /api/entries`
Return recent entries.

### `GET /api/summary/today`
Return summary stats for the current day.

### `GET /api/summary/recent?days=7`
Return grouped daily summaries.

### `GET /api/export/csv`
Export all tracked entries as CSV.

## Running locally

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

Open the app:

```text
http://127.0.0.1:8000/
```

Interactive docs:

```text
http://127.0.0.1:8000/docs
```

## Notes

This project keeps everything local and lightweight. It is meant to show a practical full-stack workflow rather than depend on hosted databases or external services.
