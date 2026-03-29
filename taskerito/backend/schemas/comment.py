from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

from typing import Optional
from .user import UserRead

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    task_id: int

class CommentRead(CommentBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    author: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)
