# Diabetes Tracker

A phone-responsive React + TypeScript frontend for the existing FastAPI diabetes tracker API.

## Start the app

Use Node.js 20.19+, 22.12+, or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. During development, Vite proxies `/api` requests to `http://127.0.0.1:8000`.

Run a production check with:

```bash
npm run build
npm run preview
```

## API contract

The frontend uses these endpoints:

- `GET /api/entries`
- `POST /api/entries`
- `GET /api/summary/recent?days=7`
- `GET /api/summary/today`
- `GET /api/export/csv`

The create-entry request body is:

```json
{
  "glucose": 6.4,
  "meal": "Breakfast",
  "exercise_minutes": 20,
  "notes": "Optional notes"
}
```

Optional `meal` and `notes` values are sent as `null` when empty. Your FastAPI model should therefore declare them as nullable, for example `str | None = None`.

To use a different API host, create `.env.local`:

```dotenv
VITE_API_BASE_URL=https://api.example.com
```
