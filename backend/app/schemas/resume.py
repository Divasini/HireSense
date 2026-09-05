from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    candidate_id: str
    filename: str
    file_path: str
    file_type: str
    file_size: int
    raw_text: Optional[str]
    parsed_sections: Optional[Dict[str, Any]]
    quality_score: Optional[float]
    ats_score: Optional[float]
    improvement_suggestions: Optional[List[str]]
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ParsedResumeResponse(BaseModel):
    personal_info: Dict[str, Any]
    skills: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]

class ResumeQualityResponse(BaseModel):
    overall_score: float
    breakdown: Dict[str, float]
    suggestions: List[str]

class ATSScoreResponse(BaseModel):
    overall_score: float
    breakdown: Dict[str, float]
    suggestions: List[str]
