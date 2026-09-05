from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.resume_service import (
    upload_resume, process_resume, get_resume,
    get_resume_quality, get_ats_score, get_improvement_suggestions
)
from app.services.candidate_service import create_candidate
from app.services.screening_service import analyze_candidate
from app.models.application import Application
from app.models.resume import Resume
from app.models.candidate import Candidate

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.post("/upload")
def api_upload_resumes(
    files: List[UploadFile] = File(...),
    job_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    created_resumes = []
    created_candidates = []
    
    for f in files:
        # Create candidate placeholder
        name_guess = f.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        cand = create_candidate(db, {'full_name': name_guess, 'email': f"{f.filename.split('.')[0].lower()}@candidate.net"})
        resume = upload_resume(db, f, cand.id)
        # Process resume synchronously for instant display
        try:
            resume = process_resume(db, resume.id)
        except Exception as e:
            print(f"Error processing resume {resume.id}: {e}")
            
        if job_id:
            app = Application(candidate_id=cand.id, job_id=job_id, resume_id=resume.id)
            db.add(app)
            db.commit()
            db.refresh(app)
            try:
                analyze_candidate(db, app.id)
            except Exception as e:
                print(f"Error analyzing app {app.id}: {e}")
                
        created_resumes.append(resume)
        created_candidates.append(cand)
        
    return {
        "resumes": created_resumes,
        "candidates": created_candidates,
        "count": len(created_resumes)
    }

@router.post("/upload-to-job/{job_id}")
def api_upload_to_job(
    job_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    name_guess = file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
    cand = create_candidate(db, {'full_name': name_guess, 'email': f"{file.filename.split('.')[0].lower()}@candidate.net"})
    resume = upload_resume(db, file, cand.id)
    process_resume(db, resume.id)
    
    app = Application(candidate_id=cand.id, job_id=job_id, resume_id=resume.id)
    db.add(app)
    db.commit()
    db.refresh(app)
    analyze_candidate(db, app.id)
    
    return {"resume_id": resume.id, "application_id": app.id, "candidate_id": cand.id}

@router.get("/{id}")
def api_get_resume(id: str, db: Session = Depends(get_db)):
    r = get_resume(db, id)
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    return r

@router.post("/{id}/process")
def api_process_resume(id: str, db: Session = Depends(get_db)):
    resume = process_resume(db, id)
    return resume

@router.get("/{id}/parsed")
def api_get_parsed(id: str, db: Session = Depends(get_db)):
    resume = get_resume(db, id)
    if not resume or not resume.parsed_sections:
        return {}
    return resume.parsed_sections

@router.get("/{id}/quality")
def api_get_quality(id: str, db: Session = Depends(get_db)):
    return get_resume_quality(db, id)

@router.get("/{id}/ats-score")
def api_get_ats(id: str, db: Session = Depends(get_db)):
    return get_ats_score(db, id)

@router.get("/{id}/improvements")
def api_get_improvements(id: str, db: Session = Depends(get_db)):
    return get_improvement_suggestions(db, id)
