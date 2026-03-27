from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from services.project_member_service import ProjectMemberService
from dependencies import get_db

router = APIRouter(prefix="/projects/{project_id}/members", tags=["Project Members"])

@router.post("/{user_id}", status_code=status.HTTP_201_CREATED)
def add_member(project_id: int, user_id: int, db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    service.add_member(project_id, user_id)
    return {"message": "Member added successfully"}

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    service.remove_member(project_id, user_id)
    return None

@router.get("/")
def get_project_members(project_id: int, db: Session = Depends(get_db)):
    service = ProjectMemberService(db)
    members = service.get_project_members(project_id)
    return [{"user_id": m.user_id, "joined_at": m.joined_at} for m in members]
