import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.job import Job
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult
from app.models.notification import Notification
from app.models.interview_session import InterviewSession
from app.schemas.candidate import CandidateResponse, CandidateListResponse, CandidateSearchParams
from app.core.dependencies import get_current_user

from app.services.resume_service import upload_resume, process_resume
from app.services.screening_service import analyze_candidate
from app.ai.recommendation import recommend_jobs_for_candidate, match_candidate_to_multiple_jobs
from app.ai.interview_generator import generate_interview_questions, evaluate_interview_answer, generate_adaptive_follow_up, compile_interview_report
from app.ai.scoring_engine import calculate_resume_quality, calculate_ats_score
from app.ai.skill_extractor import extract_skills

router = APIRouter(prefix="/api/candidates", tags=["candidates"])

def is_resume_valid(resume: Optional[Resume]) -> bool:
    """Strict check ensuring resume is an actual uploaded document with real extracted content."""
    if not resume:
        return False
    if not getattr(resume, 'is_processed', False):
        return False
    if not resume.raw_text or len(resume.raw_text.strip()) < 15:
        return False
    if resume.filename and (resume.filename.endswith('_Profile.txt') or 'Profile.txt' in resume.filename):
        return False
    # Resume is valid if file exists on disk or if actual parsed sections are present
    if resume.file_path and os.path.exists(resume.file_path):
        return True
    if resume.parsed_sections and len(resume.parsed_sections) > 0:
        return True
    return False


def get_or_create_candidate_for_user(db: Session, user: User) -> Candidate:
    cand = db.query(Candidate).filter((Candidate.user_id == user.id) | (Candidate.email == user.email)).first()
    if not cand:
        cand = Candidate(
            id=str(uuid.uuid4()),
            user_id=user.id,
            full_name=user.full_name or "Candidate",
            email=user.email,
            location=None,
            parsed_data={}
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)
    elif not cand.user_id:
        cand.user_id = user.id
        db.commit()
        db.refresh(cand)
    return cand


# ==========================================
# 1. CANDIDATE PROFILE & DASHBOARD ENDPOINTS
# ==========================================

@router.get("/me/profile")
def api_get_my_candidate_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    raw_resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    
    # Strictly validate resume authenticity
    has_valid_resume = is_resume_valid(raw_resume)
    resume = raw_resume if has_valid_resume else None
    apps = db.query(Application).filter(Application.candidate_id == cand.id).all()
    
    parsed = cand.parsed_data or {}
    skills = parsed.get("skills", []) if has_valid_resume else []
    
    # Calculate profile completeness
    completeness = 0
    if cand.full_name: completeness += 15
    if cand.email: completeness += 10
    if cand.phone: completeness += 10
    if cand.location: completeness += 15
    if skills: completeness += 20
    if has_valid_resume and parsed.get("experience"): completeness += 15
    if has_valid_resume and parsed.get("education"): completeness += 15
    completeness = min(100, completeness)

    # Calculate dynamic resume quality analysis if resume is valid
    quality_analysis = None
    ats_analysis = None
    if has_valid_resume and resume.parsed_sections:
        quality_analysis = calculate_resume_quality(resume.parsed_sections)
        ats_analysis = calculate_ats_score(resume.parsed_sections, resume.raw_text or "")
    elif has_valid_resume:
        quality_analysis = {
            'overall_score': resume.quality_score,
            'breakdown': {},
            'section_analysis': {},
            'what_helped': [],
            'what_reduced': [],
            'suggestions': resume.improvement_suggestions or []
        }
        ats_analysis = {
            'overall_score': resume.ats_score,
            'breakdown': {},
            'checklist': [],
            'what_helped': [],
            'what_reduced': [],
            'suggestions': []
        }

    return {
        "candidate": {
            "id": cand.id,
            "user_id": cand.user_id,
            "full_name": cand.full_name,
            "email": cand.email,
            "phone": cand.phone,
            "location": cand.location,
            "linkedin": cand.linkedin,
            "github": cand.github,
            "portfolio": cand.portfolio,
            "headline": parsed.get("headline", ""),
            "summary": parsed.get("summary", "") if has_valid_resume else "",
            "total_experience_years": cand.total_experience_years or (parsed.get("total_experience_years", 0) if has_valid_resume else 0),
            "skills": skills,
            "experience": parsed.get("experience", []) if has_valid_resume else [],
            "education": parsed.get("education", []) if has_valid_resume else [],
            "projects": parsed.get("projects", []) if has_valid_resume else [],
            "certifications": parsed.get("certifications", []) if has_valid_resume else [],
            "achievements": parsed.get("achievements", []) if has_valid_resume else [],
            "languages": parsed.get("languages", ["English"]),
            "parsed_data": parsed if has_valid_resume else {}
        },
        "has_resume": has_valid_resume,
        "resume": {
            "id": resume.id,
            "filename": resume.filename,
            "file_type": resume.file_type,
            "file_size": resume.file_size,
            "quality_score": resume.quality_score,
            "ats_score": resume.ats_score,
            "created_at": str(resume.created_at)
        } if has_valid_resume else None,
        "applications_count": len(apps),
        "quality_score": resume.quality_score if has_valid_resume else None,
        "ats_score": resume.ats_score if has_valid_resume else None,
        "improvement_suggestions": (quality_analysis.get('suggestions') if quality_analysis else resume.improvement_suggestions) if has_valid_resume else [],
        "quality_analysis": quality_analysis if has_valid_resume else None,
        "ats_analysis": ats_analysis if has_valid_resume else None,
        "profile_completeness": completeness
    }


@router.put("/me/profile")
def api_update_my_candidate_profile(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    
    if "full_name" in body and body["full_name"]:
        cand.full_name = body["full_name"]
        current_user.full_name = body["full_name"]
    if "phone" in body:
        cand.phone = body["phone"]
    if "location" in body:
        cand.location = body["location"]
    if "linkedin" in body:
        cand.linkedin = body["linkedin"]
    if "github" in body:
        cand.github = body["github"]
    if "portfolio" in body:
        cand.portfolio = body["portfolio"]
    if "total_experience_years" in body:
        try:
            cand.total_experience_years = float(body["total_experience_years"])
        except (ValueError, TypeError):
            pass
            
    parsed = dict(cand.parsed_data or {})
    for key in ["headline", "summary", "skills", "experience", "education", "projects", "certifications", "achievements", "languages"]:
        if key in body:
            parsed[key] = body[key]
            
    cand.parsed_data = parsed
    flag_modified(cand, "parsed_data")
    db.commit()
    db.refresh(cand)
    
    return {"status": "success", "message": "Profile updated successfully", "candidate": cand}


@router.get("/me/dashboard")
def api_get_my_candidate_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    raw_resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    
    # Strictly validate resume authenticity
    has_valid_resume = is_resume_valid(raw_resume)
    resume = raw_resume if has_valid_resume else None
    apps = db.query(Application).filter(Application.candidate_id == cand.id).all()
    
    parsed = cand.parsed_data or {}
    skills = parsed.get("skills", []) if has_valid_resume else []
    
    # Count application stages
    shortlisted = db.query(Application).join(CandidateStatus).filter(
        Application.candidate_id == cand.id,
        CandidateStatus.recruiter_decision == 'shortlisted'
    ).count()
    
    interviews = db.query(Application).join(CandidateStatus).filter(
        Application.candidate_id == cand.id,
        CandidateStatus.recruiter_decision == 'interview'
    ).count()

    # Completeness
    completeness = 0
    if cand.full_name: completeness += 15
    if cand.email: completeness += 10
    if cand.phone: completeness += 10
    if cand.location: completeness += 15
    if skills: completeness += 20
    if has_valid_resume and parsed.get("experience"): completeness += 15
    if has_valid_resume and parsed.get("education"): completeness += 15
    completeness = min(100, completeness)

    # Job Recommendations ONLY if valid uploaded resume exists
    recommendations = []
    if has_valid_resume:
        active_jobs = db.query(Job).filter(Job.status == 'active').all()
        recommendations = recommend_jobs_for_candidate(
            skills,
            parsed.get("experience", []),
            active_jobs,
            parsed.get("education", []),
            parsed.get("projects", [])
        )[:3]

    # Recent Applications
    recent_apps = []
    for a in apps[:4]:
        job = db.query(Job).filter(Job.id == a.job_id).first()
        scr = db.query(ScreeningResult).filter(ScreeningResult.application_id == a.id).first()
        stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == a.id).first()
        recent_apps.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": job.title if job else "Position",
            "company": job.company if job else "Company",
            "location": job.location if job else "",
            "status": stat.recruiter_decision if (stat and stat.recruiter_decision) else a.status,
            "applied_at": str(a.applied_at),
            "match_score": scr.overall_score if scr else None
        })

    return {
        "user_name": current_user.full_name or "Candidate",
        "has_resume": has_valid_resume,
        "resume": {
            "id": resume.id,
            "filename": resume.filename,
            "file_type": resume.file_type,
            "file_size": resume.file_size,
            "quality_score": resume.quality_score,
            "ats_score": resume.ats_score,
            "created_at": str(resume.created_at)
        } if has_valid_resume else None,
        "quality_score": resume.quality_score if has_valid_resume else None,
        "ats_score": resume.ats_score if has_valid_resume else None,
        "skills_count": len(skills),
        "profile_completeness": completeness,
        "applications_count": len(apps),
        "shortlisted_count": shortlisted,
        "interviews_count": interviews,
        "recommended_jobs": recommendations,
        "recent_applications": recent_apps,
        "interview_readiness": 85 if (has_valid_resume and len(apps) > 0) else None
    }


# ==========================================
# 2. RESUME UPLOAD & VERSION MANAGEMENT
# ==========================================

@router.post("/me/resume")
def api_upload_my_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    
    # 1. Validate file extension
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in ['pdf', 'docx', 'txt']:
        raise HTTPException(
            status_code=400,
            detail="Unable to analyze this resume. Please upload a valid PDF, DOCX, or TXT file."
        )

    # 2. Validate file size and read bytes
    file_bytes = file.file.read()
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded resume file is empty.")
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")
        
    file.file.seek(0)
    
    # 3. Save & Process Resume
    try:
        resume = upload_resume(db, file, cand.id)
        processed_resume = process_resume(db, resume.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to analyze this resume. Please upload a valid PDF, DOCX, or TXT file.")

    if not processed_resume or not processed_resume.raw_text or len(processed_resume.raw_text.strip()) < 15:
        raise HTTPException(status_code=400, detail="Unable to analyze this resume. Please upload a valid PDF, DOCX, or TXT file.")

    # 4. Update candidate parsed_data from actual resume
    parsed = cand.parsed_data or {}
    if processed_resume.parsed_sections:
        sections = processed_resume.parsed_sections
        if "personal_info" in sections and isinstance(sections["personal_info"], dict):
            p_info = sections["personal_info"]
            if not cand.phone and p_info.get("phone"):
                cand.phone = p_info.get("phone")
            if not cand.linkedin and p_info.get("linkedin"):
                cand.linkedin = p_info.get("linkedin")
            if not cand.github and p_info.get("github"):
                cand.github = p_info.get("github")
            if not cand.location and p_info.get("location"):
                cand.location = p_info.get("location")
                
        # Set extracted skills
        extracted_skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in sections.get("skills", [])]
        parsed["skills"] = extracted_skill_names
        
        if sections.get("experience"):
            parsed["experience"] = sections["experience"]
        if sections.get("education"):
            parsed["education"] = sections["education"]
        if sections.get("projects"):
            parsed["projects"] = sections["projects"]
        if sections.get("certifications"):
            parsed["certifications"] = sections["certifications"]
        if sections.get("summary"):
            parsed["summary"] = sections["summary"]
            
        cand.parsed_data = parsed
        flag_modified(cand, "parsed_data")
        db.commit()
        db.refresh(cand)

    # 5. Create real notification
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type="resume_processed",
        title="Resume Analysis Complete",
        message=f"Your resume '{file.filename}' has been analyzed. Quality score: {processed_resume.quality_score}%, ATS readability: {processed_resume.ats_score}%.",
        link="/candidate/quality"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": "Resume uploaded and analyzed successfully",
        "resume": processed_resume,
        "quality_score": processed_resume.quality_score,
        "ats_score": processed_resume.ats_score,
        "extracted_skills": parsed.get("skills", [])
    }


@router.get("/me/resumes")
def api_get_my_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    raw_resumes = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).all()
    
    # Strictly filter out any fake or corrupted resumes
    resumes = [r for r in raw_resumes if is_resume_valid(r)]
    
    result = []
    total = len(resumes)
    for idx, r in enumerate(resumes):
        result.append({
            "id": r.id,
            "filename": r.filename,
            "version_name": f"Resume v{total - idx}",
            "is_current": idx == 0,
            "file_size": r.file_size,
            "file_type": r.file_type,
            "quality_score": r.quality_score,
            "ats_score": r.ats_score,
            "created_at": str(r.created_at)
        })
    return result


@router.delete("/me/resumes/{resume_id}")
def api_delete_my_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.candidate_id == cand.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    db.delete(r)
    db.commit()
    return {"status": "success", "message": "Resume version deleted"}


# ==========================================
# 3. JOB RECOMMENDATIONS & FLEXIBLE SEARCH
# ==========================================

@router.get("/me/recommendations")
def api_get_my_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    
    # If candidate has NO valid resume, return empty list!
    if not is_resume_valid(resume):
        return []

    parsed = cand.parsed_data or {}
    skills = parsed.get("skills", [])
    exp = parsed.get("experience", [])
    edu = parsed.get("education", [])
    proj = parsed.get("projects", [])
    
    active_jobs = db.query(Job).filter(Job.status == 'active').all()
    return recommend_jobs_for_candidate(skills, exp, active_jobs, edu, proj)


@router.get("/me/jobs/search")
def api_search_candidate_jobs(
    title: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    experience: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cand = get_or_create_candidate_for_user(db, current_user)
    resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    has_valid_resume = is_resume_valid(resume)

    query = db.query(Job).filter(Job.status == 'active')
    
    has_custom_title = title and title.strip() and title.lower() not in ['all', 'any']
    has_custom_loc = location and location.strip() and location.lower() not in ['all', 'any']
    
    if has_custom_title:
        query = query.filter(
            (Job.title.ilike(f"%{title.strip()}%")) |
            (Job.description.ilike(f"%{title.strip()}%"))
        )
        
    if has_custom_loc:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if work_mode and work_mode.lower() not in ['any', 'all', '']:
        query = query.filter(Job.location.ilike(f"%{work_mode.strip()}%"))

    if experience and experience.lower() not in ['any', 'all', '']:
        query = query.filter(Job.experience_required.ilike(f"%{experience.strip()}%"))

    jobs = query.all()

    # If user searched for custom title or location and no existing jobs matched:
    # Dynamically create an active Job opening in the database matching their search!
    if len(jobs) == 0 and has_custom_title:
        target_title = title.strip()
        target_loc = location.strip() if has_custom_loc else "Remote"
        
        inferred_skills = extract_skills(target_title)
        req_skills_list = [s['name'] for s in inferred_skills] if inferred_skills else ["Python", "Problem Solving", "System Design"]
        
        custom_job = Job(
            id=str(uuid.uuid4()),
            title=target_title,
            company="Nexora Global Technologies",
            location=target_loc,
            description=f"We are hiring a skilled {target_title} to join our high-impact engineering team in {target_loc}. You will design, build, and scale mission-critical systems and collaborate across cross-functional engineering teams.",
            employment_type="Full-time",
            experience_required="2+ Years",
            salary_range="$95,000 - $145,000",
            required_skills=req_skills_list,
            preferred_skills=["Git", "Docker", "Agile"],
            responsibilities=[
                f"Design, develop, and maintain software solutions for {target_title}.",
                "Collaborate with product and data engineering leads.",
                "Ensure robust automated testing and system reliability."
            ],
            status="active",
            recruiter_id=current_user.id
        )
        db.add(custom_job)
        db.commit()
        db.refresh(custom_job)
        jobs = [custom_job]

    if not has_valid_resume:
        return [
            {
                "id": j.id,
                "job_id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "employment_type": j.employment_type,
                "salary_range": j.salary_range,
                "experience_required": j.experience_required,
                "description": j.description,
                "responsibilities": j.responsibilities or [],
                "required_skills": j.required_skills or [],
                "preferred_skills": j.preferred_skills or [],
                "match_score": None,
                "matched_skills": [],
                "missing_skills": [],
                "explanation": "Upload your resume to receive AI-powered job matches.",
                "has_resume": False
            }
            for j in jobs
        ]

    # Calculate real AI matches
    parsed = cand.parsed_data or {}
    skills = parsed.get("skills", [])
    exp = parsed.get("experience", [])
    edu = parsed.get("education", [])
    proj = parsed.get("projects", [])
    
    matched_results = recommend_jobs_for_candidate(skills, exp, jobs, edu, proj)
    return matched_results


# ==========================================
# 4. REAL APPLICATION MANAGEMENT
# ==========================================

@router.post("/me/apply/{job_id}")
def api_apply_for_job(job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job position not found")
        
    resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    if not is_resume_valid(resume):
        raise HTTPException(
            status_code=400,
            detail="Resume Required: Please upload your resume before applying to jobs."
        )

    # Check if already applied
    existing_app = db.query(Application).filter(Application.candidate_id == cand.id, Application.job_id == job_id).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job position.")

    app = Application(
        id=str(uuid.uuid4()),
        candidate_id=cand.id,
        job_id=job_id,
        resume_id=resume.id,
        status="Applied"
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    
    try:
        analyze_candidate(db, app.id)
    except Exception as e:
        print(f"Error analyzing candidate application {app.id}: {e}")

    cand_notif = Notification(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type="new_application",
        title="Application Submitted",
        message=f"You successfully applied for {job.title} at {job.company}. Interview Prep is now unlocked for this role!",
        link="/candidate/interview-prep"
    )
    db.add(cand_notif)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully applied for {job.title}",
        "application_id": app.id,
        "job_title": job.title,
        "company": job.company
    }


@router.get("/me/applications")
def api_get_my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    apps = db.query(Application).filter(Application.candidate_id == cand.id).order_by(Application.applied_at.desc()).all()
    
    results = []
    for a in apps:
        job = db.query(Job).filter(Job.id == a.job_id).first()
        scr = db.query(ScreeningResult).filter(ScreeningResult.application_id == a.id).first()
        stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == a.id).first()
        
        status_val = stat.recruiter_decision if (stat and stat.recruiter_decision) else a.status
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": job.title if job else "Position",
            "company": job.company if job else "Company",
            "location": job.location if job else "",
            "salary_range": job.salary_range if job else "",
            "status": status_val or "Applied",
            "applied_at": str(a.applied_at),
            "match_score": scr.overall_score if scr else None,
            "ai_recommendation": scr.interview_recommendation if scr else "pending"
        })
    return results


# ==========================================
# 5. AI INTERVIEW PREPARATION & SPEECH EVALUATION
# ==========================================

@router.post("/me/interview/generate")
def api_generate_my_interview_questions(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    
    # 1. Must have uploaded resume
    if not is_resume_valid(resume):
        raise HTTPException(
            status_code=400,
            detail="Resume Required: Please upload your resume first to start personalized AI interview preparation."
        )

    job_id = body.get("job_id")
    target_title = body.get("target_title")
    category = body.get("category", "all")
    difficulty = body.get("difficulty", "medium")
    count = int(body.get("count", 5))

    target_role_name = "Software Engineer"
    company_name = "HireSense Partner Network"
    job_req = None

    if job_id:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            target_role_name = job.title
            company_name = job.company
            job_req = {
                "title": job.title,
                "company": job.company,
                "description": job.description,
                "required_skills": job.required_skills or ["Python", "Problem Solving"]
            }

    if not job_req:
        target_role_name = target_title.strip() if target_title and target_title.strip() else "Software Engineer"
        inferred_skills = extract_skills(target_role_name)
        req_skills = [s['name'] for s in inferred_skills] if inferred_skills else ["Python", "Problem Solving", "System Architecture"]
        job_req = {
            "title": target_role_name,
            "company": company_name,
            "description": f"Comprehensive technical and behavioral interview for {target_role_name}",
            "required_skills": req_skills
        }

    questions = generate_interview_questions(
        cand.parsed_data or {},
        job_req,
        None,
        category_filter=category,
        difficulty=difficulty,
        count=count
    )

    for q in questions:
        q["applied_job_id"] = job_id or "custom-role"
        q["applied_job_title"] = target_role_name
        q["applied_company"] = company_name

    return questions


@router.post("/me/interview/evaluate")
def api_evaluate_my_interview_answer(body: dict, current_user: User = Depends(get_current_user)):
    question = body.get("question", "")
    answer = body.get("answer") or body.get("candidate_answer", "")
    category = body.get("category", "technical")
    target_role = body.get("target_role", "")
    
    evaluation = evaluate_interview_answer(question, answer, category, target_role=target_role)
    return evaluation


@router.post("/me/interview/adaptive-followup")
def api_get_adaptive_followup(body: dict, current_user: User = Depends(get_current_user)):
    current_question = body.get("current_question", {})
    candidate_answer = body.get("candidate_answer", "")
    evaluation = body.get("evaluation", {})
    target_role = body.get("target_role", "Software Engineer")
    
    follow_up = generate_adaptive_follow_up(
        current_question,
        candidate_answer,
        evaluation,
        target_role
    )
    return {"has_follow_up": follow_up is not None, "follow_up": follow_up}


@router.post("/me/interview/sessions")
def api_save_interview_session(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    raw_resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.created_at.desc()).first()
    
    questions_data = body.get("questions", [])
    answers_data = body.get("answers", [])
    evaluations_data = body.get("evaluations", [])
    target_role = body.get("target_role", "Software Engineer")
    company = body.get("company")
    interview_mode = body.get("interview_mode", "mixed")
    answer_mode = body.get("answer_mode", "text")
    difficulty = body.get("difficulty", "medium")
    duration_seconds = int(body.get("duration_seconds", 0))
    job_id = body.get("job_id")
    
    # Generate full report analytics
    report = compile_interview_report(
        questions_data,
        answers_data,
        evaluations_data,
        target_role
    )
    
    session = InterviewSession(
        id=str(uuid.uuid4()),
        candidate_id=cand.id,
        resume_id=raw_resume.id if raw_resume else None,
        job_id=job_id,
        target_role=target_role,
        company=company,
        interview_mode=interview_mode,
        answer_mode=answer_mode,
        difficulty=difficulty,
        question_count=len(questions_data),
        questions_data=questions_data,
        answers_data=answers_data,
        evaluations_data=evaluations_data,
        overall_score=report["overall_score"],
        readiness_level=report["readiness_level"],
        category_scores=report["category_scores"],
        strengths=report["strengths"],
        weak_areas=report["weak_areas"],
        recommendations=report["recommendations"],
        duration_seconds=duration_seconds,
        status="completed",
        completed_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "status": "success",
        "session_id": session.id,
        "report": report
    }


@router.get("/me/interview/sessions")
def api_get_my_interview_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    sessions = db.query(InterviewSession).filter(
        InterviewSession.candidate_id == cand.id
    ).order_by(InterviewSession.created_at.desc()).all()
    
    results = []
    for s in sessions:
        results.append({
            "id": s.id,
            "target_role": s.target_role,
            "company": s.company,
            "interview_mode": s.interview_mode,
            "answer_mode": s.answer_mode,
            "difficulty": s.difficulty,
            "question_count": s.question_count,
            "overall_score": s.overall_score,
            "readiness_level": s.readiness_level,
            "duration_seconds": s.duration_seconds,
            "created_at": str(s.created_at)
        })
    return results


@router.get("/me/interview/sessions/{session_id}")
def api_get_interview_session_detail(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cand = get_or_create_candidate_for_user(db, current_user)
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.candidate_id == cand.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    return {
        "id": session.id,
        "target_role": session.target_role,
        "company": session.company,
        "interview_mode": session.interview_mode,
        "answer_mode": session.answer_mode,
        "difficulty": session.difficulty,
        "question_count": session.question_count,
        "questions": session.questions_data,
        "answers": session.answers_data,
        "evaluations": session.evaluations_data,
        "overall_score": session.overall_score,
        "readiness_level": session.readiness_level,
        "category_scores": session.category_scores,
        "strengths": session.strengths,
        "weak_areas": session.weak_areas,
        "recommendations": session.recommendations,
        "duration_seconds": session.duration_seconds,
        "created_at": str(session.created_at),
        "completed_at": str(session.completed_at) if session.completed_at else None
    }



# ==========================================
# 6. RECRUITER / ADMIN GLOBAL SEARCH
# ==========================================

@router.get("")
def api_get_candidates(
    search: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    per_page: int = 50,
    db: Session = Depends(get_db)
):
    params = CandidateSearchParams(search=search, location=location, page=page, per_page=per_page)
    candidates = db.query(Candidate)
    if params.search:
        candidates = candidates.filter(Candidate.full_name.ilike(f"%{params.search}%"))
    if params.location:
        candidates = candidates.filter(Candidate.location.ilike(f"%{params.location}%"))
        
    items = candidates.offset((params.page - 1) * params.per_page).limit(params.per_page).all()
    total = db.query(Candidate).count()
    return {"candidates": items, "total": total}


@router.get("/{id}")
def api_get_candidate(id: str, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return cand
