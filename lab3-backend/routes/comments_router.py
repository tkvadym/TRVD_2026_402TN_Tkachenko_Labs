from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from schemas.comment import CommentCreate, CommentRead
from services.comment_service import CommentService
from dependencies import get_db

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def add_comment(comment: CommentCreate, current_user_id: int = Query(...), db: Session = Depends(get_db)):
    service = CommentService(db)
    return service.add_comment(comment, current_user_id)

@router.get("/task/{task_id}", response_model=List[CommentRead])
def get_task_comments(task_id: int, db: Session = Depends(get_db)):
    service = CommentService(db)
    return service.get_comments_by_task(task_id)
