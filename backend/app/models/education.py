from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database import Base

class Education(Base):
    __tablename__ = "educations"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    degree: Mapped[str] = mapped_column(String)
    field_of_study: Mapped[str] = mapped_column(String, nullable=True)
    institution: Mapped[str] = mapped_column(String)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=True)
    gpa: Mapped[str] = mapped_column(String, nullable=True)
