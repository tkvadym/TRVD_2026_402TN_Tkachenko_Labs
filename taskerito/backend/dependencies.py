from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import SessionLocal
from repositories.user_repository import UserRepository
from services.auth_service import SECRET_KEY, ALGORITHM
from models.user import User
from models.role import Role
from repositories.role_repository import RoleRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception
        
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def verify_manager(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    role_repo = RoleRepository(db)
    role = role_repo.get_by_name("Manager")
    admin_role = role_repo.get_by_name("Admin")
    # Допускаем и менеджера, и админа
    allowed_role_ids = []
    if role: allowed_role_ids.append(role.id)
    if admin_role: allowed_role_ids.append(admin_role.id)
    
    if current_user.role_id not in allowed_role_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions (requires Manager or Admin)")
    return current_user

def verify_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    role_repo = RoleRepository(db)
    admin_role = role_repo.get_by_name("Admin")
    if not admin_role or current_user.role_id != admin_role.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions (requires Admin)")
    return current_user
