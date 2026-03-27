from sqlalchemy.orm import Session
from models.project import Project
from models.project_member import ProjectMember

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, project_id: int):
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_by_user(self, user_id: int):
        # User is either author or member
        authored = self.db.query(Project).filter(Project.created_by == user_id).all()
        # Find projects where user is member
        memberships = self.db.query(ProjectMember).filter(ProjectMember.user_id == user_id).all()
        member_project_ids = [m.project_id for m in memberships]
        member_projects = self.db.query(Project).filter(Project.id.in_(member_project_ids)).all()
        
        # Combine and deduplicate
        all_projects = {p.id: p for p in authored + member_projects}
        return list(all_projects.values())

    def create(self, project: Project):
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project: Project):
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project):
        self.db.delete(project)
        self.db.commit()
