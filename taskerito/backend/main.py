from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from loguru import logger

from database import engine, SessionLocal
from models.base import Base
from utils.seeder import seed_roles

from models import role, user, project, project_member, task, comment

from routes import (
    auth_router,
    users_router,
    projects_router,
    project_members_router,
    tasks_router,
    comments_router,
    dashboard_router
)

# Ініціалізація таблиць бази даних
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_roles(db)

app = FastAPI(title="Taskerito API (Lab 4: Auth & JWT)", version="1.1.0")

# Дозволяємо запити з фронтенду (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Business Logic Error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database Integrity Error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Database integrity error. Check references or unique constraints."},
    )

# Include routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(projects_router.router)
app.include_router(project_members_router.router)
app.include_router(tasks_router.router)
app.include_router(comments_router.router)
app.include_router(dashboard_router.router)

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting up REST API on http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
