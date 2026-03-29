from sqlalchemy.orm import Session

from models.role import Role

DEFAULT_ROLES = ["User", "Manager", "Admin"]

def seed_roles(db: Session):
    for role_name in DEFAULT_ROLES:
        if not db.query(Role).filter(Role.name == role_name).first():
            db.add(Role(name=role_name))
    db.commit()
