from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse, ScoreWeightUpdate
from app.services.job_service import create_job, get_jobs, get_job, update_job, delete_job, update_score_weights, get_score_weights
from app.services.screening_service import analyze_candidate
from app.models.job import Job
from app.models.application import Application, CandidateStatus
from app.models.candidate import Candidate
from app.models.screening import ScreeningResult
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=JobResponse)
def api_create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    # Fallback to demo recruiter id if current_user header not provided
    recruiter_id = "recruiter-1"
    return create_job(db, job_data, recruiter_id)

@router.get("", response_model=List[JobListResponse])
def api_get_jobs(page: int = 1, per_page: int = 50, db: Session = Depends(get_db)):
    jobs = get_jobs(db, page=page, per_page=per_page)
    res = []
    for j in jobs:
        cnt = db.query(Application).filter(Application.job_id == j.id).count()
        res.append(JobListResponse(
            id=j.id,
            title=j.title,
            company=j.company,
            location=j.location,
            status=j.status,
            candidate_count=cnt,
            created_at=j.created_at
        ))
    return res

@router.get("/{id}", response_model=JobResponse)
def api_get_job(id: str, db: Session = Depends(get_db)):
    job = get_job(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{id}/candidates")
def api_get_job_candidates(id: str, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.job_id == id).all()
    results = []
    for a in apps:
        cand = db.query(Candidate).filter(Candidate.id == a.candidate_id).first()
        scr = db.query(ScreeningResult).filter(ScreeningResult.application_id == a.id).first()
        if not scr:
            scr = analyze_candidate(db, a.id)
        stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == a.id).first()
        
        results.append({
            "application_id": a.id,
            "candidate_id": cand.id if cand else "",
            "candidate_name": cand.full_name if cand else "Unknown",
            "candidate_email": cand.email if cand else "",
            "overall_score": scr.overall_score if scr else 50.0,
            "skills_score": scr.skills_score if scr else 0.0,
            "experience_score": scr.experience_score if scr else 0.0,
            "education_score": scr.education_score if scr else 0.0,
            "project_score": scr.project_score if scr else 0.0,
            "certification_score": scr.certification_score if scr else 0.0,
            "ai_recommendation": stat.ai_recommendation if stat else (scr.interview_recommendation if scr else "consider"),
            "recruiter_decision": stat.recruiter_decision if stat else None,
            "status": a.status or "applied",
            "matched_skills": scr.matched_skills if scr else [],
            "missing_skills": scr.missing_skills if scr else []
        })
    results = sorted(results, key=lambda x: x["overall_score"], reverse=True)
    for idx, r in enumerate(results):
        r["rank"] = idx + 1
    return results

@router.put("/{id}", response_model=JobResponse)
def api_update_job(id: str, job_data: JobUpdate, db: Session = Depends(get_db)):
    return update_job(db, id, job_data)

@router.delete("/{id}")
def api_delete_job(id: str, db: Session = Depends(get_db)):
    delete_job(db, id)
    return {"message": "Job deleted"}

@router.put("/{id}/weights")
def api_update_weights(id: str, weights: ScoreWeightUpdate, db: Session = Depends(get_db)):
    return update_score_weights(db, id, weights)

@router.get("/{id}/weights")
def api_get_weights(id: str, db: Session = Depends(get_db)):
    return get_score_weights(db, id)
