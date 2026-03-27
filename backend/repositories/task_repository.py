from sqlalchemy.orm import Session
from models.task import Task
from datetime import datetime

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int):
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_by_project(self, project_id: int):
        return self.db.query(Task).filter(Task.project_id == project_id).all()

    def get_by_assignee(self, user_id: int):
        return self.db.query(Task).filter(Task.assigned_to == user_id).all()

    def get_overdue(self, project_id: int):
        now = datetime.utcnow()
        return self.db.query(Task).filter(
            Task.project_id == project_id,
            Task.deadline < now,
            Task.status != 'Done',
            Task.status != 'Cancelled'
        ).all()

    def create(self, task: Task):
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task):
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task):
        self.db.delete(task)
        self.db.commit()
