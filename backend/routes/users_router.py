from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from schemas.user import UserCreate, UserRead, UserUpdate
from services.user_service import UserService
from dependencies import get_db, verify_admin, get_current_user
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.create_user(user)

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_user(user_id)

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, user_update: UserUpdate, current_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    service = UserService(db)
    return service.update_user(user_id, user_update)

@router.get("/", response_model=List[UserRead])
def get_all_users(current_user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_all()
