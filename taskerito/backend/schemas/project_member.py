from pydantic import BaseModel, ConfigDict
from datetime import datetime
from .user import UserRead

class ProjectMemberBase(BaseModel):
    project_id: int
    user_id: int

class ProjectMemberRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    joined_at: datetime
    user: UserRead

    model_config = ConfigDict(from_attributes=True)
