from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(db: Session, user_id: str, type: str, title: str, message: str, link: str = None):
    n = Notification(user_id=user_id, type=type, title=title, message=message, link=link)
    db.add(n)
    db.commit()

def get_notifications(db: Session, user_id: str, unread_only: bool = False) -> list:
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    return q.order_by(Notification.created_at.desc()).all()

def mark_as_read(db: Session, notification_id: str, user_id: str):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if n:
        n.is_read = True
        db.commit()

def mark_all_as_read(db: Session, user_id: str):
    db.query(Notification).filter(Notification.user_id == user_id).update({'is_read': True})
    db.commit()
