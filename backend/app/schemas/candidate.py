from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class CandidateResponse(BaseModel):
    id: str
    user_id: Optional[str]
    full_name: str
    email: EmailStr
    phone: Optional[str]
    location: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    portfolio: Optional[str]
    total_experience_years: Optional[float]
    parsed_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CandidateListResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    location: Optional[str]
    total_experience_years: Optional[float]
    top_skills: List[str] = []

    class Config:
        from_attributes = True

class CandidateSearchParams(BaseModel):
    search: Optional[str] = None
    skills: Optional[List[str]] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    location: Optional[str] = None
    education: Optional[str] = None
    page: int = 1
    per_page: int = 20
