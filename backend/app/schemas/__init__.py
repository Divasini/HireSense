from app.schemas.auth import UserRegister, UserLogin, Token, TokenData
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse, ScoreWeightUpdate
from app.schemas.candidate import CandidateResponse, CandidateListResponse, CandidateSearchParams
from app.schemas.resume import ResumeResponse, ParsedResumeResponse, ResumeQualityResponse, ATSScoreResponse
from app.schemas.screening import ScreeningResultResponse, CandidateRankingResponse, ComparisonRequest, ComparisonResponse, WhatIfRequest, WhatIfResponse, ShortlistRequest, BatchShortlistRequest
from app.schemas.analytics import DashboardKPIs, ScoreDistribution, SkillDemandData, RecruitmentFunnelData, JobMetrics
