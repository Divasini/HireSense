from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DashboardKPIs(BaseModel):
    total_candidates: int
    total_jobs: int
    total_shortlisted: int
    total_rejected: int
    avg_match_score: float
    interviews_recommended: int

class ScoreDistribution(BaseModel):
    ranges: List[Dict[str, Any]]

class SkillDemandData(BaseModel):
    skill_name: str
    demand_count: int
    percentage: float

class RecruitmentFunnelData(BaseModel):
    stage: str
    count: int
    percentage: float

class JobMetrics(BaseModel):
    job_id: str
    title: str
    total_candidates: int
    avg_score: float
    shortlisted: int
    rejected: int
