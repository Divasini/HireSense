from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database import Base

class Experience(Base):
    __tablename__ = "experiences"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    company: Mapped[str] = mapped_column(String)
    job_title: Mapped[str] = mapped_column(String)
    start_date: Mapped[str] = mapped_column(String, nullable=True)
    end_date: Mapped[str] = mapped_column(String, nullable=True)
    duration_months: Mapped[int] = mapped_column(Integer, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    technologies: Mapped[list] = mapped_column(JSON, nullable=True)
