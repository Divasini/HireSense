from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=list[UserResponse])
def api_list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/{id}", response_model=UserResponse)
def api_get_user(id: str, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

@router.put("/{id}", response_model=UserResponse)
def api_update_user(id: str, data: UserUpdate, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name is not None:
        u.full_name = data.full_name
    if data.email is not None:
        u.email = data.email
    if data.is_active is not None:
        u.is_active = data.is_active
    db.commit()
    db.refresh(u)
    return u
