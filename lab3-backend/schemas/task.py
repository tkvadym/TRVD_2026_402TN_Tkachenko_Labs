from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=250)
    description: Optional[str] = None
    status: str = Field("To Do", min_length=1, max_length=50)
    priority: str = Field("Medium", min_length=1, max_length=50)

class TaskCreate(TaskBase):
    project_id: int
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=250)
    description: Optional[str] = None
    priority: Optional[str] = Field(None, min_length=1, max_length=50)
    assigned_to: Optional[int] = None
    deadline: Optional[datetime] = None

class TaskStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=50)

class TaskRead(TaskBase):
    id: int
    project_id: int
    created_by: int
    assigned_to: Optional[int]
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
