from sqlalchemy.orm import Session
import bcrypt
from models.user import User
from schemas.user import UserCreate, UserUpdate
from repositories.user_repository import UserRepository
from repositories.role_repository import RoleRepository

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.role_repo = RoleRepository(db)

    def create_user(self, user_create: UserCreate) -> User:
        if self.repo.get_by_email(user_create.email):
            raise ValueError("User with this email already exists")

        default_role = self.role_repo.get_by_name("User")
        if not default_role:
            raise ValueError("Default role 'User' not found in database")

        hashed_password = bcrypt.hashpw(user_create.password.encode(), bcrypt.gensalt()).decode()
        db_user = User(
            full_name=user_create.full_name,
            email=user_create.email,
            password_hash=hashed_password,
            role_id=default_role.id
        )
        return self.repo.create(db_user)

    def get_user(self, user_id: int) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        return user

    def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        user = self.get_user(user_id)
        
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        if user_update.role_id is not None:
            user.role_id = user_update.role_id
        if user_update.is_active is not None:
            user.is_active = user_update.is_active
            
        return self.repo.update(user)
    
    def get_all(self):
        return self.repo.get_all()
