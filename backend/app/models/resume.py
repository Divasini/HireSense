from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    filename: Mapped[str] = mapped_column(String)
    file_path: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    file_size: Mapped[int] = mapped_column(Integer)
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    parsed_sections: Mapped[dict] = mapped_column(JSON, nullable=True)
    quality_score: Mapped[float] = mapped_column(Float, nullable=True)
    ats_score: Mapped[float] = mapped_column(Float, nullable=True)
    improvement_suggestions: Mapped[list] = mapped_column(JSON, nullable=True)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class ResumeSkill(Base):
    __tablename__ = "resume_skills"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id: Mapped[str] = mapped_column(String, ForeignKey("resumes.id"))
    skill_name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    proficiency_level: Mapped[str] = mapped_column(String, nullable=True)
