from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, sessions, cv, profile, jobs
from services.scheduler_service import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrepMind API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(cv.router)
app.include_router(profile.router)
app.include_router(jobs.router)


@app.on_event("startup")
def startup_event():
    start_scheduler()


@app.get("/health")
def health():
    return {"status": "ok", "service": "PrepMind API", "version": "2.0.0"}
