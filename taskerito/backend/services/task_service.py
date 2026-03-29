from sqlalchemy.orm import Session
from models.task import Task
from schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate
from repositories.task_repository import TaskRepository
from repositories.project_repository import ProjectRepository

class TaskService:
    def __init__(self, db: Session):
        self.repo = TaskRepository(db)
        self.project_repo = ProjectRepository(db)

    def create_task(self, task_create: TaskCreate, current_user_id: int) -> Task:
        if not self.project_repo.get_by_id(task_create.project_id):
            raise ValueError(f"Project {task_create.project_id} not found")

        db_task = Task(
            project_id=task_create.project_id,
            title=task_create.title,
            description=task_create.description,
            status=task_create.status,
            priority=task_create.priority,
            assigned_to=task_create.assigned_to,
            created_by=current_user_id,
            deadline=task_create.deadline
        )
        return self.repo.create(db_task)

    def get_task(self, task_id: int) -> Task:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        return task

    def get_tasks_by_project(self, project_id: int):
        if not self.project_repo.get_by_id(project_id):
            raise ValueError(f"Project {project_id} not found")
        return self.repo.get_by_project_with_comment_count(project_id)

    def update_task(self, task_id: int, task_update: TaskUpdate) -> Task:
        task = self.get_task(task_id)

        update_data = task_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        return self.repo.update(task)

    def update_task_status(self, task_id: int, status_update: TaskStatusUpdate) -> Task:
        task = self.get_task(task_id)
        task.status = status_update.status
        return self.repo.update(task)

    def delete_task(self, task_id: int):
        task = self.get_task(task_id)
        self.repo.delete(task)
