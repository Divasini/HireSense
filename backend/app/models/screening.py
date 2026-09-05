from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class ScreeningResult(Base):
    __tablename__ = "screening_results"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str] = mapped_column(String, ForeignKey("applications.id"))
    overall_score: Mapped[float] = mapped_column(Float)
    skills_score: Mapped[float] = mapped_column(Float)
    experience_score: Mapped[float] = mapped_column(Float)
    education_score: Mapped[float] = mapped_column(Float)
    project_score: Mapped[float] = mapped_column(Float)
    certification_score: Mapped[float] = mapped_column(Float)
    semantic_similarity_score: Mapped[float] = mapped_column(Float)
    matched_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)
    experience_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    education_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    project_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    certification_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    explanation: Mapped[str] = mapped_column(Text)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=True)
    interview_recommendation: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class SkillGap(Base):
    __tablename__ = "skill_gaps"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    screening_result_id: Mapped[str] = mapped_column(String, ForeignKey("screening_results.id"))
    skill_name: Mapped[str] = mapped_column(String)
    is_required: Mapped[bool] = mapped_column(Boolean)
    candidate_has: Mapped[bool] = mapped_column(Boolean)
    category: Mapped[str] = mapped_column(String)
