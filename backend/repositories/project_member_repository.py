from sqlalchemy.orm import Session
from models.project_member import ProjectMember

class ProjectMemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_members_by_project(self, project_id: int):
        return self.db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()

    def is_member(self, project_id: int, user_id: int) -> bool:
        member = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        ).first()
        return member is not None

    def add_member(self, project_member: ProjectMember):
        self.db.add(project_member)
        self.db.commit()
        self.db.refresh(project_member)
        return project_member

    def remove_member(self, project_id: int, user_id: int):
        member = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        ).first()
        if member:
            self.db.delete(member)
            self.db.commit()
