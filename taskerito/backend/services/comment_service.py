from sqlalchemy.orm import Session
from models.comment import Comment
from schemas.comment import CommentCreate
from repositories.comment_repository import CommentRepository
from repositories.task_repository import TaskRepository

class CommentService:
    def __init__(self, db: Session):
        self.repo = CommentRepository(db)
        self.task_repo = TaskRepository(db)

    def add_comment(self, comment_create: CommentCreate, current_user_id: int) -> Comment:
        if not self.task_repo.get_by_id(comment_create.task_id):
            raise ValueError(f"Task {comment_create.task_id} not found")

        db_comment = Comment(
            task_id=comment_create.task_id,
            user_id=current_user_id,
            content=comment_create.content
        )
        return self.repo.create(db_comment)

    def get_comments_by_task(self, task_id: int):
        return self.repo.get_by_task(task_id)
