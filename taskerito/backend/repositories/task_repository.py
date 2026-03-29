from sqlalchemy.orm import Session
from sqlalchemy import func
from models.task import Task
from models.comment import Comment
from datetime import datetime

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int):
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_by_project(self, project_id: int):
        return self.db.query(Task).filter(Task.project_id == project_id).all()

    def get_by_project_with_comment_count(self, project_id: int):
        tasks = self.db.query(
            Task,
            func.count(Comment.id).label('comment_count')
        ).outerjoin(Comment, Task.id == Comment.task_id)\
         .filter(Task.project_id == project_id)\
         .group_by(Task.id)\
         .all()
        
        result = []
        for task, count in tasks:
            task.comment_count = count
            result.append(task)
        return result

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

    def unassign_user_from_project_tasks(self, project_id: int, user_id: int):
        self.db.query(Task).filter(
            Task.project_id == project_id,
            Task.assigned_to == user_id
        ).update({Task.assigned_to: None}, synchronize_session=False)
        self.db.commit()
