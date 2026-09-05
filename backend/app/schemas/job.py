from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    employment_type: str
    experience_required: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[List[str]] = []
    preferred_skills: Optional[List[str]] = []
    required_education: Optional[str] = None
    responsibilities: Optional[List[str]] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    employment_type: Optional[str] = None
    experience_required: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    required_education: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    status: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: str
    employment_type: str
    experience_required: Optional[str]
    salary_range: Optional[str]
    required_skills: List[Any]
    preferred_skills: List[Any]
    required_education: Optional[str]
    responsibilities: List[Any]
    status: str
    recruiter_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    status: str
    candidate_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class ScoreWeightUpdate(BaseModel):
    skills_weight: float
    experience_weight: float
    education_weight: float
    project_weight: float
    certification_weight: float
