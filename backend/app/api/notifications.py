from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("")
def api_get_notifications(db: Session = Depends(get_db)):
    notes = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    if not notes:
        # Generate initial notifications
        default_notes = [
            Notification(type="resume_processed", title="Resumes Analyzed", message="5 candidate resumes have been screened for Senior Data Analyst."),
            Notification(type="shortlisted", title="Candidate Shortlisted", message="Sarah Chen was recommended with 92% match score."),
            Notification(type="system", title="System Ready", message="AI Matching Engine v2.0 initialized successfully.")
        ]
        db.add_all(default_notes)
        db.commit()
        notes = default_notes
    return notes

@router.put("/{id}/read")
def api_mark_read(id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}

@router.put("/read-all")
def api_mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"status": "ok"}
