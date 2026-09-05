from sqlalchemy import Column, String, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("jobs.id"))
    resume_id: Mapped[str] = mapped_column(String, ForeignKey("resumes.id"))
    status: Mapped[str] = mapped_column(String, default="applied")
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint('candidate_id', 'job_id', name='uq_candidate_job'),)

class CandidateStatus(Base):
    __tablename__ = "candidate_statuses"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str] = mapped_column(String, ForeignKey("applications.id"), unique=True)
    ai_recommendation: Mapped[str] = mapped_column(String)
    recruiter_decision: Mapped[str] = mapped_column(String, nullable=True)
    override_reason: Mapped[str] = mapped_column(Text, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    decided_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
