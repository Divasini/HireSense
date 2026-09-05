from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.models.resume import Resume, ResumeSkill
from app.models.candidate import Candidate
from app.models.experience import Experience
from app.models.education import Education
from app.models.project import Project
from app.models.certification import Certification
from app.ai.text_extractor import extract_text
from app.ai.resume_parser import parse_resume
from app.ai.scoring_engine import calculate_resume_quality, calculate_ats_score
from app.ai.summary_generator import generate_improvement_suggestions
import os
import shutil
import uuid

def upload_resume(db: Session, file: UploadFile, candidate_id: str) -> Resume:
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    filename = f"{file_id}.{ext}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    
    resume = Resume(
        candidate_id=candidate_id,
        filename=file.filename,
        file_path=file_path,
        file_type=ext,
        file_size=file_size
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

def process_resume(db: Session, resume_id: str) -> Resume:
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        return None
        
    with open(resume.file_path, "rb") as f:
        file_bytes = f.read()
        
    raw_text = extract_text(file_bytes, resume.file_type)
    parsed = parse_resume(raw_text)
    
    resume.raw_text = raw_text
    resume.parsed_sections = parsed
    resume.is_processed = True
    
    qual = calculate_resume_quality(parsed)
    ats = calculate_ats_score(parsed, raw_text)
    
    resume.quality_score = qual['overall_score']
    resume.ats_score = ats['overall_score']
    resume.improvement_suggestions = qual['suggestions']
    
    db.commit()
    
    # Update candidate info if needed
    cand = db.query(Candidate).filter(Candidate.id == resume.candidate_id).first()
    if cand and parsed.get('personal_info'):
        cand.parsed_data = parsed
        db.commit()
        
    return resume

def get_resume(db: Session, resume_id: str) -> Resume:
    return db.query(Resume).filter(Resume.id == resume_id).first()

def get_resume_quality(db: Session, resume_id: str) -> dict:
    resume = get_resume(db, resume_id)
    if not resume:
        return {'overall_score': 0.0, 'breakdown': {}, 'suggestions': []}
    if resume.parsed_sections:
        return calculate_resume_quality(resume.parsed_sections)
    return {'overall_score': resume.quality_score, 'breakdown': {}, 'suggestions': resume.improvement_suggestions}

def get_ats_score(db: Session, resume_id: str) -> dict:
    resume = get_resume(db, resume_id)
    if not resume:
        return {'overall_score': 0.0, 'breakdown': {}, 'suggestions': []}
    if resume.parsed_sections and resume.raw_text:
        return calculate_ats_score(resume.parsed_sections, resume.raw_text)
    return {'overall_score': resume.ats_score, 'breakdown': {}, 'suggestions': resume.improvement_suggestions}

def get_improvement_suggestions(db: Session, resume_id: str) -> list:
    resume = get_resume(db, resume_id)
    return resume.improvement_suggestions if resume else []

def detect_duplicates(db: Session, candidate_data: dict) -> list:
    email = candidate_data.get('email')
    if email:
        dups = db.query(Candidate).filter(Candidate.email == email).all()
        return dups
    return []
