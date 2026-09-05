from sqlalchemy import Column, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String)
    company: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    employment_type: Mapped[str] = mapped_column(String)
    experience_required: Mapped[str] = mapped_column(String, nullable=True)
    salary_range: Mapped[str] = mapped_column(String, nullable=True)
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    preferred_skills: Mapped[list] = mapped_column(JSON, default=list)
    required_education: Mapped[str] = mapped_column(String, nullable=True)
    responsibilities: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String, default="active")
    recruiter_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class JobSkill(Base):
    __tablename__ = "job_skills"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("jobs.id"))
    skill_name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)

class ScoreWeight(Base):
    __tablename__ = "score_weights"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("jobs.id"), unique=True)
    skills_weight: Mapped[float] = mapped_column(Float, default=0.40)
    experience_weight: Mapped[float] = mapped_column(Float, default=0.25)
    education_weight: Mapped[float] = mapped_column(Float, default=0.15)
    project_weight: Mapped[float] = mapped_column(Float, default=0.10)
    certification_weight: Mapped[float] = mapped_column(Float, default=0.10)
