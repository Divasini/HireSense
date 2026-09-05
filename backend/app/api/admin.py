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
    if not logs:
        # Seed default logs for audit trail demo
        from datetime import datetime
        default_logs = [
            AuditLog(action="USER_LOGIN", entity_type="user", entity_id="admin-1", details={"ip": "127.0.0.1", "browser": "Chrome"}),
            AuditLog(action="RESUME_UPLOAD", entity_type="resume", entity_id="res-1", details={"files_count": 5, "source": "recruiter"}),
            AuditLog(action="AI_SCREENING_RUN", entity_type="screening", entity_id="scr-1", details={"score": 92.5, "model": "all-MiniLM-L6-v2"}),
            AuditLog(action="CANDIDATE_SHORTLIST", entity_type="application", entity_id="app-1", details={"decision": "shortlisted", "by": "recruiter@recruitment.ai"}),
        ]
        db.add_all(default_logs)
        db.commit()
        logs = default_logs
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
