from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database import Base

class Certification(Base):
    __tablename__ = "certifications"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("candidates.id"))
    name: Mapped[str] = mapped_column(String)
    issuing_organization: Mapped[str] = mapped_column(String, nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=True)
    credential_id: Mapped[str] = mapped_column(String, nullable=True)
