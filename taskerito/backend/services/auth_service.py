from sqlalchemy.orm import Session
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from models.user import User
from repositories.user_repository import UserRepository

# Загружаем переменные из .env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("ОШИБКА: Переменная SECRET_KEY не найдена в файле .env!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 час
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def authenticate_user(self, email: str, password: str) -> User | None:
        user = self.repo.get_by_email(email)
        if not user:
            return None
        
        # Verify password using raw bcrypt
        # bcrypt.checkpw requires bytes
        try:
            is_correct = bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
        except ValueError:
            # Handle malformed hash
            return None
            
        if not is_correct:
            return None
            
        return user

    def create_access_token(self, data: dict, expires_delta: timedelta = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def refresh_access_token(self, refresh_token: str) -> tuple[str, str]:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")
            user_id_str: str = payload.get("sub")
            role_id: int = payload.get("role_id")
            if user_id_str is None:
                raise ValueError("Invalid token")
            
            # Create new pair
            access_token = self.create_access_token(data={"sub": user_id_str, "role_id": role_id})
            new_refresh = self.create_refresh_token(data={"sub": user_id_str, "role_id": role_id})
            return access_token, new_refresh
        except JWTError:
            raise ValueError("Could not validate refresh token")
