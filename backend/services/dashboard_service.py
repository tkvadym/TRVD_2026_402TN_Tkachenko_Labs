from sqlalchemy.orm import Session
from models.task import Task
from schemas.dashboard import DashboardStats
from datetime import datetime

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_project_stats(self, project_id: int) -> DashboardStats:
        now = datetime.utcnow()
        tasks = self.db.query(Task).filter(Task.project_id == project_id).all()
        
        total = len(tasks)
        to_do = sum(1 for t in tasks if t.status == 'To Do')
        in_progress = sum(1 for t in tasks if t.status == 'In Progress')
        done = sum(1 for t in tasks if t.status == 'Done')
        overdue = sum(1 for t in tasks if t.deadline and t.deadline < now and t.status not in ('Done', 'Cancelled'))

        return DashboardStats(
            total_tasks=total,
            tasks_to_do=to_do,
            tasks_in_progress=in_progress,
            tasks_done=done,
            overdue_tasks_count=overdue
        )
