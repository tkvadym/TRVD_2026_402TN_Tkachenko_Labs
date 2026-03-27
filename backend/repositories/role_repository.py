from sqlalchemy.orm import Session
from models.role import Role

class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_name(self, name: str):
        return self.db.query(Role).filter(Role.name == name).first()

    def get_all(self):
        return self.db.query(Role).all()
