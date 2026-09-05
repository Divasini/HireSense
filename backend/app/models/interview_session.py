from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Integer, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
import uuid
from app.database import Base

class InterviewSession(Base):
    __tablename__ = 'interview_sessions'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey('candidates.id'), index=True)
    resume_id: Mapped[str] = mapped_column(String, ForeignKey('resumes.id'), nullable=True)
    job_id: Mapped[str] = mapped_column(String, ForeignKey('jobs.id'), nullable=True)
    
    target_role: Mapped[str] = mapped_column(String, default='Software Engineer')
    company: Mapped[str] = mapped_column(String, nullable=True)
    interview_mode: Mapped[str] = mapped_column(String, default='mixed')
    answer_mode: Mapped[str] = mapped_column(String, default='text')
    difficulty: Mapped[str] = mapped_column(String, default='medium')
    question_count: Mapped[int] = mapped_column(Integer, default=5)
    
    questions_data: Mapped[list] = mapped_column(JSON, default=list)
    answers_data: Mapped[list] = mapped_column(JSON, default=list)
    evaluations_data: Mapped[list] = mapped_column(JSON, default=list)
    
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    readiness_level: Mapped[str] = mapped_column(String, default='Not Ready')
    category_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    weak_areas: Mapped[list] = mapped_column(JSON, default=list)
    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default='completed')
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
