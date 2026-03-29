from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserRead(UserBase):
    id: int
    role_id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
