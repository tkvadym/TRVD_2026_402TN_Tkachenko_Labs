from sqlalchemy.orm import Session
from models.project_member import ProjectMember
from repositories.project_member_repository import ProjectMemberRepository
from repositories.project_repository import ProjectRepository
from repositories.user_repository import UserRepository
from repositories.task_repository import TaskRepository

class ProjectMemberService:
    def __init__(self, db: Session):
        self.repo = ProjectMemberRepository(db)
        self.project_repo = ProjectRepository(db)
        self.user_repo = UserRepository(db)
        self.task_repo = TaskRepository(db)

    def add_member(self, project_id: int, user_id: int) -> ProjectMember:
        if not self.project_repo.get_by_id(project_id):
            raise ValueError(f"Project {project_id} not found")
        if not self.user_repo.get_by_id(user_id):
            raise ValueError(f"User {user_id} not found")
        
        if self.repo.is_member(project_id, user_id):
            raise ValueError(f"User {user_id} is already a member of project {project_id}")

        member = ProjectMember(project_id=project_id, user_id=user_id)
        return self.repo.add_member(member)

    def remove_member(self, project_id: int, user_id: int):
        if not self.repo.is_member(project_id, user_id):
            raise ValueError(f"User {user_id} is not a member of project {project_id}")
        
        # Unassign from all project tasks first
        self.task_repo.unassign_user_from_project_tasks(project_id, user_id)
        
        self.repo.remove_member(project_id, user_id)

    def get_project_members(self, project_id: int):
        return self.repo.get_members_by_project(project_id)
