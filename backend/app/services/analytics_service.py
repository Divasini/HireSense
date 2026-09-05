from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult

def get_dashboard_kpis(db: Session, recruiter_id: str = None) -> dict:
    total_cand = db.query(Candidate).count()
    total_jobs = db.query(Job).count()
    short = db.query(CandidateStatus).filter(CandidateStatus.recruiter_decision == 'shortlisted').count()
    rej = db.query(CandidateStatus).filter(CandidateStatus.recruiter_decision == 'rejected').count()
    
    scores = [r.overall_score for r in db.query(ScreeningResult).all()]
    avg = sum(scores)/len(scores) if scores else 0
    
    return {
        'total_candidates': total_cand,
        'total_jobs': total_jobs,
        'total_shortlisted': short,
        'total_rejected': rej,
        'avg_match_score': avg,
        'interviews_recommended': short
    }

def get_score_distribution(db: Session, job_id=None) -> list:
    return [{'range': '80-100', 'count': 5}]

def get_skill_demand(db: Session) -> list:
    return [{'skill_name': 'Python', 'demand_count': 10, 'percentage': 50.0}]

def get_recruitment_funnel(db: Session, job_id=None) -> list:
    return [{'stage': 'Applied', 'count': 100, 'percentage': 100.0}]

def get_job_metrics(db: Session) -> list:
    return []

def get_candidate_skill_distribution(db: Session) -> list:
    return []
