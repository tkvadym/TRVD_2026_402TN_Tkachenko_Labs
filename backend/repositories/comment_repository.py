from sqlalchemy.orm import Session
from models.comment import Comment

class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_task(self, task_id: int):
        return self.db.query(Comment).filter(Comment.task_id == task_id).all()

    def create(self, comment: Comment):
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def delete(self, comment: Comment):
        self.db.delete(comment)
        self.db.commit()
