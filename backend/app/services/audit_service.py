from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_action(db: Session, user_id: str, action: str, entity_type: str, entity_id: str, details: dict = None):
    log = AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, details=details)
    db.add(log)
    db.commit()

def get_audit_logs(db: Session, user_id=None, entity_type=None, page=1, per_page=20) -> list:
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    return q.order_by(AuditLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
