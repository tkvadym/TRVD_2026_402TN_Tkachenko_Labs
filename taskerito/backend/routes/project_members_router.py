from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from services.project_member_service import ProjectMemberService
from dependencies import get_db, verify_manager, get_current_user
from models.user import User
from schemas.project_member import ProjectMemberRead

router = APIRouter(prefix="/projects/{project_id}/members", tags=["Project Members"])

@router.post("/{user_id}", status_code=status.HTTP_201_CREATED)
def add_member(project_id: int, user_id: int, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    try:
        service.add_member(project_id, user_id)
        return {"message": "Member added successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(project_id: int, user_id: int, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    try:
        service.remove_member(project_id, user_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ProjectMemberRead])
def get_project_members(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    return service.get_project_members(project_id)
