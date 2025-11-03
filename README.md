# MediData
A platform that connects patients with doctors, specialists, and healthcare providers who best match their unique needs, preferences, and circumstances.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI (Uvicorn)

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

## Project Structure
```
MediData/
  backend/      # FastAPI app (run Uvicorn here)
  frontend/     # React + Vite + Tailwind app
```

---

## Backend Setup (FastAPI)

From the project root:

```powershell
cd backend
python -m venv .venv
 .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install fastapi uvicorn[standard] python-dotenv pydantic-settings
```

Start the API (default port 8000):

```powershell
uvicorn app.main:app --reload --port 8000
```

Expected health check (if implemented): `GET http://127.0.0.1:8000/api/health`

Notes:
- Put your FastAPI app in `backend/app/main.py` (module path: `app.main:app`).
- If you add dependencies, freeze them (optional): `pip freeze > requirements.txt`.

---

## Frontend Setup (React + Vite + TailwindCSS)

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173`.

### TailwindCSS
This project uses Tailwind v4 with the Vite plugin. Core stylesheet is at `frontend/src/index.css` and imports Tailwind:

```css
@import "tailwindcss";
```

You can use Tailwind utility classes directly in React components (see `frontend/src/App.tsx`).

### Optional: Dev Proxy to FastAPI
To call the backend as `/api/...` during development, add a proxy in `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
```

Now fetches like `fetch('/api/health')` will be proxied to FastAPI.

---

## Running Everything (Local Dev)
Open two terminals from the project root:

1) Backend (FastAPI):
```powershell
cd backend
 .\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

2) Frontend (Vite):
```powershell
cd frontend
npm run dev
```

Visit `http://localhost:5173`.

---

## Environment Variables
- Backend: create `backend/.env` for secrets (e.g., DB URL, API keys); load via `python-dotenv` or `pydantic-settings`.
- Frontend: use `frontend/.env` for Vite variables prefixed with `VITE_` (e.g., `VITE_API_URL`).

---

## Troubleshooting
- PowerShell execution policy blocks venv activation:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
- Port already in use: change `--port` for Uvicorn or `server.port` in Vite config.
- CORS errors without proxy: enable FastAPI CORS for `http://localhost:5173` or use the Vite dev proxy.
- Node version issues: ensure Node 18+ (`node -v`).

---

## Scripts Reference
- Backend: start API
  ```powershell
  uvicorn app.main:app --reload --port 8000
  ```
- Frontend: start web
  ```powershell
  npm run dev
  ```