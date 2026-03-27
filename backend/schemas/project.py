from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    status: str = Field("Active", min_length=1, max_length=50)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, min_length=1, max_length=50)

class ProjectRead(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
