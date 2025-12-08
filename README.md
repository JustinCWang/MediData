# MediData
A platform that connects patients with doctors, specialists, and healthcare providers who best match their unique needs, preferences, and circumstances.

## 🚀 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** TypeScript
- **Routing:** React Router DOM

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Language:** Python 3.x
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** Google Gemini AI
- **Testing:** Pytest

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Python 3.x](https://www.python.org/)
- A [Supabase](https://supabase.com/) project
- A [Google Cloud](https://console.cloud.google.com/) project with Gemini API enabled

## 🚦 Local Development

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MediData
```

### 2. Backend Setup
Navigate to the backend directory and set up the environment.

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

**Environment Variables (.env)**
Create a `.env` file in the `backend` directory based on `.env.example`:

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# App Configuration
FRONTEND_URL=http://localhost:5173
```

**Run the Server**
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
Navigate to the frontend directory.

```bash
cd frontend
npm install
```

**Environment Variables (.env)**
Create a `.env` file in the `frontend` directory:

```ini
# Defaults to https://medidata-backend.vercel.app if not set
VITE_API_BASE_URL=http://localhost:8000
```

**Run the Development Server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🧪 Testing

All backend tests live in `backend/tests` and use `pytest` + `coverage`.

### 1. Run full backend test suite
```bash
cd backend
pytest
```

### 2. Run individual test modules (by feature)
```bash
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

### 3. Run tests with coverage for app/main.py
```bash
cd backend
coverage erase
coverage run -m pytest -q
coverage report -m app/main.py
```

### 4. Generate HTML coverage report
```bash
cd backend
coverage html app/main.py
```
Then open `backend/htmlcov/index.html` in your browser to inspect line-by-line coverage.

## 📦 Database Schema

All tables are in the `public` schema. RLS policies are enabled for each table to ensure security.

```sql
-- WARNING: This schema is for context only and is not meant to be run directly.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.FavProviders (
  patient_id uuid NOT NULL,
  provider_id uuid,
  favorite_id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_npi integer,
  CONSTRAINT FavProviders_pkey PRIMARY KEY (favorite_id),
  CONSTRAINT FavProviders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.Patients(patient_id)
);

CREATE TABLE public.Patients (
  patient_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone_num text,
  gender text,
  state text,
  city text,
  insurance text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT Patients_pkey PRIMARY KEY (patient_id),
  CONSTRAINT Patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES auth.users(id)
);

CREATE TABLE public.Providers (
  provider_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone_num text,
  gender text,
  state text,
  city text,
  insurance text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  location text,
  taxonomy text,
  email character varying,
  CONSTRAINT Providers_pkey PRIMARY KEY (provider_id),
  CONSTRAINT Providers_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES auth.users(id)
);

CREATE TABLE public.Requests (
  appointment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  date date,
  time time with time zone,
  npi_num integer,
  status text,
  provider_id uuid,
  message text,
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  response text,
  CONSTRAINT Requests_pkey PRIMARY KEY (appointment_id),
  CONSTRAINT Requests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.Patients(patient_id),
  CONSTRAINT Requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.Providers(provider_id)
);
```

## 🚀 Deployment

### Frontend
The frontend is deployed on [Vercel](https://vercel.com).
- Connect your GitHub repository to Vercel.
- Set the Build Command to `npm run build`.
- Set the Output Directory to `dist`.

### Backend
The backend can be deployed to any Python-supporting platform (Render, Fly.io, Vercel, etc.).
- Ensure all environment variables are set in the deployment platform.
- Configure the start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## 🌐 Live Demo

- **Frontend:** [medidata-frontend.vercel.app](https://medidata-frontend.vercel.app)
- **Backend:** [medidata-backend.vercel.app](https://medidata-backend.vercel.app)
