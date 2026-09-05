from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScreeningResultResponse(BaseModel):
    id: str
    application_id: str
    overall_score: float
    skills_score: float
    experience_score: float
    education_score: float
    project_score: float
    certification_score: float
    semantic_similarity_score: float
    matched_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    experience_analysis: Dict[str, Any]
    education_analysis: Dict[str, Any]
    project_analysis: Dict[str, Any]
    certification_analysis: Dict[str, Any]
    explanation: str
    ai_summary: Optional[str]
    interview_recommendation: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class CandidateRankingResponse(BaseModel):
    rank: int
    candidate: Dict[str, Any] # nested info
    overall_score: float
    ai_recommendation: str
    status: str
    application_id: str

class ComparisonRequest(BaseModel):
    application_ids: List[str]

class ComparisonResponse(BaseModel):
    candidates: List[Dict[str, Any]]

class WhatIfRequest(BaseModel):
    job_id: str
    candidate_id: str
    modified_required_skills: Optional[List[str]] = None
    modified_preferred_skills: Optional[List[str]] = None
    modified_experience: Optional[str] = None
    modified_education: Optional[str] = None

class WhatIfResponse(BaseModel):
    original_score: float
    new_score: float
    score_change: float
    changed_components: Dict[str, Any]
    explanation: str

class ShortlistRequest(BaseModel):
    application_id: str
    decision: str # shortlisted, rejected, interview
    reason: Optional[str] = None

class BatchShortlistRequest(BaseModel):
    job_id: str
    threshold_score: float
