from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.application import Application

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def api_admin_stats(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_recruiters": db.query(User).filter(User.role == "recruiter").count(),
        "total_candidates": db.query(Candidate).count(),
        "total_jobs": db.query(Job).count(),
        "total_applications": db.query(Application).count(),
        "system_status": "healthy",
        "nlp_model": "spaCy + MiniLM-L6-v2",
        "version": "2.4.0"
    }

@router.get("/audit-logs")
def api_get_audit_logs(page: int = 1, per_page: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return logs

@router.get("/users")
def api_get_users(page: int = 1, per_page: int = 50, db: Session = Depends(get_db)):
    return db.query(User).offset((page - 1) * per_page).limit(per_page).all()

@router.put("/users/{id}/role")
def api_update_user_role(id: str, body: dict = Body(...), db: Session = Depends(get_db)):
    role = body.get("role")
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.role = role
    db.commit()
    return u

@router.delete("/users/{id}")
def api_delete_user(id: str, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if u:
        db.delete(u)
        db.commit()
    return {"message": "User deleted"}
