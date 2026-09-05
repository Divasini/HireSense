from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str] = mapped_column(String, ForeignKey("applications.id"), nullable=True)
    job_id: Mapped[str] = mapped_column(String, ForeignKey("jobs.id"), nullable=True)
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"), nullable=True)
    category: Mapped[str] = mapped_column(String)
    question: Mapped[str] = mapped_column(Text)
    context: Mapped[str] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
