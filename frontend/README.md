# LeafLogic

LeafLogic is a React dashboard backed by FastAPI and MongoDB. Plant data, users, diagnoses, and watering logs are stored in the `leaflogic` MongoDB database.

## Run locally on Windows

Open two PowerShell terminals from the repository root.

### Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Before starting the backend, make sure MongoDB Community Server is running locally, or create a MongoDB Atlas database. In `backend`, copy `.env.example` to `.env` and set `MONGODB_URL` to `mongodb://localhost:27017` or your Atlas connection string. The backend creates its indexes at startup. `/ready` reports whether MongoDB is reachable.

The backend is at `http://127.0.0.1:8000`. API docs: `http://127.0.0.1:8000/api/v1/docs`.

If you have an existing SQLite database, migrate its records after configuring and starting MongoDB:

```powershell
cd backend
.\.venv\Scripts\python.exe migrate_sqlite_to_mongo.py --source leaflogic.db
```

The migration is idempotent and does not delete the SQLite file.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`. Create an account from the sign-in screen. The API defaults to `http://127.0.0.1:8000/api/v1`; copy `.env.example` to `.env.local` to override it. The API base URL can also be edited and tested in Settings.

## Workflows

- Register, sign in, and sign out with bearer-token authentication.
- Create, view, edit, search, and delete user-owned plants.
- Record watering events and review care/history records.
- Review current plant health counts from persisted plant data.
- Submit a leaf image to the diagnosis endpoint.

Image diagnosis returns HTTP 503 until a real ML model/provider is configured. The app does not generate fabricated diagnosis results. Live weather data is not shown because no weather provider is configured.

## Checks

```powershell
npm run lint
npm run build
```

The backend readiness endpoint `http://127.0.0.1:8000/ready` checks database connectivity.
