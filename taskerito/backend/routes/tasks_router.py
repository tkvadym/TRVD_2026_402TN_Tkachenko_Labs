from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from schemas.task import TaskCreate, TaskRead, TaskUpdate, TaskStatusUpdate
from services.task_service import TaskService
from dependencies import get_db, get_current_user, verify_manager
from models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.create_task(task, current_user.id)

@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.get_task(task_id)

@router.get("/project/{project_id}", response_model=List[TaskRead])
def get_project_tasks(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.get_tasks_by_project(project_id)

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_update: TaskUpdate, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.update_task(task_id, task_update)

@router.patch("/{task_id}/status", response_model=TaskRead)
def update_task_status(task_id: int, status_update: TaskStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.update_task_status(task_id, status_update)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = TaskService(db)
    service.delete_task(task_id)
    return None
