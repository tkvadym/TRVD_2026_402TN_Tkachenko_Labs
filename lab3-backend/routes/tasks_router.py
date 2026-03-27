from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from schemas.task import TaskCreate, TaskRead, TaskUpdate, TaskStatusUpdate
from services.task_service import TaskService
from dependencies import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, current_user_id: int = Query(..., description="ID of the task author"), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.create_task(task, current_user_id)

@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.get_task(task_id)

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.update_task(task_id, task_update)

@router.patch("/{task_id}/status", response_model=TaskRead)
def update_task_status(task_id: int, status_update: TaskStatusUpdate, db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.update_task_status(task_id, status_update)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    service = TaskService(db)
    service.delete_task(task_id)
    return None
