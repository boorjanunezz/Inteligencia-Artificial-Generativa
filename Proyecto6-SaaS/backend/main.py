from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
from routers import auth, sessions, cv, profile, jobs
from services.scheduler_service import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepMind API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(cv.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    start_scheduler()


@app.get("/health")
def health():
    return {"status": "ok", "service": "PrepMind API", "version": "2.0.0"}


# Servir el frontend compilado (producción)
DIST = Path(__file__).parent.parent / "frontend" / "dist"
if DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa():
        return FileResponse(DIST / "index.html")
