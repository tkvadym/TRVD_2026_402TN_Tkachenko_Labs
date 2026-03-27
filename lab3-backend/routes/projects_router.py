from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from services.project_service import ProjectService
from dependencies import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, current_user_id: int = Query(..., description="ID of the user creating project"), db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.create_project(project, current_user_id)

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.get_project(project_id)

@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.update_project(project_id, project_update)

@router.get("/user/{user_id}", response_model=List[ProjectRead])
def get_user_projects(user_id: int, db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.get_projects_by_user(user_id)
