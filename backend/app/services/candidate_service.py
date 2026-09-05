from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateSearchParams
from app.ai.summary_generator import generate_candidate_summary
from app.ai.recommendation import recommend_jobs_for_candidate
from app.models.job import Job

def create_candidate(db: Session, candidate_data: dict, user_id: str = None) -> Candidate:
    cand = Candidate(
        user_id=user_id,
        full_name=candidate_data.get('full_name', 'Unknown'),
        email=candidate_data.get('email', ''),
        phone=candidate_data.get('phone'),
        location=candidate_data.get('location'),
        linkedin=candidate_data.get('linkedin'),
        github=candidate_data.get('github'),
        portfolio=candidate_data.get('portfolio'),
        parsed_data=candidate_data.get('parsed_data', {})
    )
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return cand

def get_candidates(db: Session, params: CandidateSearchParams):
    query = db.query(Candidate)
    if params.search:
        query = query.filter(Candidate.full_name.ilike(f"%{params.search}%"))
    if params.location:
        query = query.filter(Candidate.location.ilike(f"%{params.location}%"))
        
    return query.offset((params.page - 1) * params.per_page).limit(params.per_page).all()

def get_candidate(db: Session, candidate_id: str) -> Candidate:
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()

def update_candidate(db: Session, candidate_id: str, data: dict) -> Candidate:
    cand = get_candidate(db, candidate_id)
    if not cand:
        return None
    for k, v in data.items():
        setattr(cand, k, v)
    db.commit()
    db.refresh(cand)
    return cand

def get_candidate_summary(db: Session, candidate_id: str, job_id: str) -> str:
    cand = get_candidate(db, candidate_id)
    return generate_candidate_summary(cand.parsed_data or {}, {})

def get_recommended_jobs(db: Session, candidate_id: str) -> list:
    cand = get_candidate(db, candidate_id)
    jobs = db.query(Job).filter(Job.status == 'active').all()
    skills = cand.parsed_data.get('skills', []) if cand.parsed_data else []
    exp = cand.parsed_data.get('experience', []) if cand.parsed_data else []
    return recommend_jobs_for_candidate(skills, exp, jobs)

def search_candidates(db: Session, query: str, filters: dict) -> list:
    return []
