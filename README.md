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

For Mac Users: 
```powershell
cd backend
python3 -m venv .venv
source .venv/bin/activate or . .venv/bin/activate
pip install fastapi " uvicorn[standard]"  python-dotenv pydantic-settings
```

**Configure Environment Variables:**

1. Copy the example environment file:
   ```powershell
   copy .env.example .env

   #For MAC users its
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous/public key
   - Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

Start the API (default port 8000):

```powershell
python -m venv .venv
 .\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

python3 -m venv .venv
source .venv/bin/activate or . .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Expected health check (if implemented): `GET http://127.0.0.1:8000/api/health`

Notes:
- Put your FastAPI app in `backend/app/main.py` (module path: `app.main:app`).
- If you add dependencies, freeze them (optional): `pip freeze > requirements.txt`.
- Never commit your `.env` file (it's in `.gitignore`). Use `.env.example` as a template.

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

## Testing Scripts

All backend tests live in `backend/tests` and use `pytest` + `coverage`.

- **Run full backend test suite**

  ```powershell
  cd backend
  pytest
  ```

- **Run individual test modules (by feature)**

  ```powershell
  cd backend
  # Auth (register/login)
  pytest tests/test_auth.py

  # AI Chatbot
  pytest tests/test_chat.py

  # Favorites (add/remove/list)
  pytest tests/test_favorites.py

  # Misc helpers (health, get_current_user, provider search helpers)
  pytest tests/test_misc.py

  # Profiles (get/update)
  pytest tests/test_profile.py

  # Requests (create/view/update/cancel)
  pytest tests/test_requests.py

  # Provider search (NPI + affiliated search)
  pytest tests/test_search.py
  ```

- **Run tests with coverage for `app/main.py`**

  ```powershell
  cd backend
  coverage erase
  coverage run -m pytest -q
  coverage report -m app/main.py
  ```

- **Generate HTML coverage report**

  ```powershell
  cd backend
  coverage html app/main.py
  ```

  Then open `backend/htmlcov/index.html` in your browser to inspect line-by-line coverage.
