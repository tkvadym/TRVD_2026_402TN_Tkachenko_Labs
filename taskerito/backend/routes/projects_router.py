from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from services.project_service import ProjectService
from dependencies import get_db, get_current_user, verify_manager
from models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.create_project(project, current_user.id)

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.get_project(project_id)

@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: int, project_update: ProjectUpdate, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = ProjectService(db)
    return service.update_project(project_id, project_update)

@router.get("/user/{user_id}", response_model=List[ProjectRead])
def get_user_projects(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ProjectService(db)
    if current_user.role and current_user.role.name in ["Admin", "Manager"]:
        return service.get_all_projects()
    return service.get_projects_by_user(user_id)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = ProjectService(db)
    service.delete_project(project_id)
    return None
