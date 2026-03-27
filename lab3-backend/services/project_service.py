from sqlalchemy.orm import Session
from models.project import Project
from schemas.project import ProjectCreate, ProjectUpdate
from repositories.project_repository import ProjectRepository

class ProjectService:
    def __init__(self, db: Session):
        self.repo = ProjectRepository(db)
        
    def create_project(self, project_create: ProjectCreate, current_user_id: int) -> Project:
        db_project = Project(
            name=project_create.name,
            description=project_create.description,
            status=project_create.status,
            created_by=current_user_id
        )
        return self.repo.create(db_project)

    def get_project(self, project_id: int) -> Project:
        project = self.repo.get_by_id(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    def update_project(self, project_id: int, project_update: ProjectUpdate) -> Project:
        project = self.get_project(project_id)
        
        if project_update.name is not None:
            project.name = project_update.name
        if project_update.description is not None:
            project.description = project_update.description
        if project_update.status is not None:
            project.status = project_update.status
            
        return self.repo.update(project)
    
    def get_projects_by_user(self, user_id: int):
        return self.repo.get_by_user(user_id)
