from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    technologies: Mapped[list] = mapped_column(JSON, nullable=True)
    role: Mapped[str] = mapped_column(String, nullable=True)
    url: Mapped[str] = mapped_column(String, nullable=True)
