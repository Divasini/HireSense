from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import hash_password, verify_password

from app.models.candidate import Candidate
import uuid

def register_user(db: Session, user_data: UserRegister) -> User:
    db_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user_data.role == "candidate":
        cand = Candidate(
            id=str(uuid.uuid4()),
            user_id=db_user.id,
            full_name=user_data.full_name,
            email=user_data.email,
            location=None,
            parsed_data={}
        )
        db.add(cand)
        db.commit()

    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def get_user_by_id(db: Session, user_id: str) -> User:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()
