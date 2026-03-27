from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from loguru import logger

from database import engine
from models.base import Base

# Model imports so Base.metadata knows about them
from models import role, user, project, project_member, task, comment

from routes import (
    users_router,
    projects_router,
    project_members_router,
    tasks_router,
    comments_router,
    dashboard_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Taskerito API (Lab 3)", version="1.0.0")

# Catch-all business logic validation errors
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Business Logic or Validation Error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )

# Catch database integrity errors (like foreign key constraint failures)
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database Integrity Error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Database integrity error. Check references or unique constraints."},
    )

# Include routers
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
