from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.core.config import settings
from app.core.database import engine
from app.core.seeder import run_seeds
from app.middleware.logging import LoggingMiddleware
from app.routers import attendees, auth, events, roles, sessions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    with Session(engine) as session:
        run_seeds(session)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(attendees.router, prefix="/api/attendees", tags=["attendees"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(roles.router, prefix="/api/roles", tags=["roles"])


@app.get("/", tags=["health"])
def health_check():
    """Verifica que la API esté corriendo."""
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}