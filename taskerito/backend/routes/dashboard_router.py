from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from schemas.dashboard import DashboardStats
from services.dashboard_service import DashboardService
from dependencies import get_db, verify_manager
from models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/{project_id}", response_model=DashboardStats)
def get_project_dashboard(project_id: int, current_user: User = Depends(verify_manager), db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_project_stats(project_id)
