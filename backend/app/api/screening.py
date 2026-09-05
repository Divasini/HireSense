from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.screening import ShortlistRequest, BatchShortlistRequest
from app.services.screening_service import (
    analyze_candidate, get_screening_result, shortlist_candidate,
    batch_shortlist, get_ranking, compare_candidates, what_if_simulation,
    generate_interview_questions_svc, get_skill_gap
)
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.interview_question import InterviewQuestion

router = APIRouter(prefix="/api/screening", tags=["screening"])

@router.post("/analyze/{application_id}")
def api_analyze(application_id: str, db: Session = Depends(get_db)):
    res = analyze_candidate(db, application_id)
    if not res:
        raise HTTPException(status_code=404, detail="Application not found or could not be analyzed")
    return res

@router.post("/analyze-job/{job_id}")
def api_analyze_job(job_id: str, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    results = []
    for a in apps:
        try:
            r = analyze_candidate(db, a.id)
            if r:
                results.append(r)
        except Exception as e:
            print(f"Error analyzing app {a.id}: {e}")
    return {"analyzed_count": len(results), "total": len(apps)}

@router.get("/result/{application_id}")
@router.get("/results/{application_id}")
def api_get_result(application_id: str, db: Session = Depends(get_db)):
    res = get_screening_result(db, application_id)
    if not res:
        # If not analyzed yet, run analysis automatically
        res = analyze_candidate(db, application_id)
    if not res:
        raise HTTPException(status_code=404, detail="Screening result not found")
    return res

@router.get("/skill-gap/{application_id}")
def api_get_skill_gap(application_id: str, db: Session = Depends(get_db)):
    res = get_screening_result(db, application_id)
    if not res:
        res = analyze_candidate(db, application_id)
    if not res:
        return []
    gaps = get_skill_gap(db, res.id)
    # Format gaps
    return [
        {
            "skill_name": g.skill_name,
            "is_required": g.is_required,
            "candidate_has": g.candidate_has,
            "category": g.category
        }
        for g in gaps
    ]

@router.get("/ranking/{job_id}")
def api_get_ranking(job_id: str, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    ranking_list = []
    
    for a in apps:
        cand = db.query(Candidate).filter(Candidate.id == a.candidate_id).first()
        res = db.query(ScreeningResult).filter(ScreeningResult.application_id == a.id).first()
        if not res:
            # Analyze on demand
            res = analyze_candidate(db, a.id)
            
        stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == a.id).first()
        
        overall = res.overall_score if res else 50.0
        ranking_list.append({
            "application_id": a.id,
            "candidate_id": cand.id if cand else "",
            "candidate_name": cand.full_name if cand else "Unknown",
            "candidate_email": cand.email if cand else "",
            "overall_score": overall,
            "skills_score": res.skills_score if res else 0.0,
            "experience_score": res.experience_score if res else 0.0,
            "education_score": res.education_score if res else 0.0,
            "project_score": res.project_score if res else 0.0,
            "certification_score": res.certification_score if res else 0.0,
            "ai_recommendation": stat.ai_recommendation if stat else (res.interview_recommendation if res else "consider"),
            "recruiter_decision": stat.recruiter_decision if stat else None,
            "status": a.status or "applied",
            "matched_skills": res.matched_skills if res else [],
            "missing_skills": res.missing_skills if res else []
        })
        
    ranking_list = sorted(ranking_list, key=lambda x: x["overall_score"], reverse=True)
    for idx, item in enumerate(ranking_list):
        item["rank"] = idx + 1
        
    return ranking_list

@router.post("/compare")
def api_compare(body: dict = Body(...), db: Session = Depends(get_db)):
    app_ids = body.get("application_ids", [])
    output = []
    for app_id in app_ids:
        app = db.query(Application).filter(Application.id == app_id).first()
        if not app:
            continue
        cand = db.query(Candidate).filter(Candidate.id == app.candidate_id).first()
        res = db.query(ScreeningResult).filter(ScreeningResult.application_id == app_id).first()
        if not res:
            res = analyze_candidate(db, app_id)
        output.append({
            "application_id": app_id,
            "candidate": cand,
            "screening_result": res
        })
    return output

@router.post("/what-if")
def api_what_if(body: dict = Body(...), db: Session = Depends(get_db)):
    job_id = body.get("job_id")
    candidate_id = body.get("candidate_id")
    req_skills = body.get("modified_required_skills")
    pref_skills = body.get("modified_preferred_skills")
    exp_req = body.get("modified_experience")
    
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate or job not found")
        
    from app.ai.matching_engine import compute_skill_match, compute_experience_match, compute_education_match, compute_project_relevance, compute_certification_match
    from app.ai.scoring_engine import calculate_overall_score
    
    parsed = cand.parsed_data or {}
    use_req_skills = req_skills if req_skills is not None else (job.required_skills or [])
    use_pref_skills = pref_skills if pref_skills is not None else (job.preferred_skills or [])
    use_exp = exp_req if exp_req is not None else (job.experience_required or "0")
    
    s_m = compute_skill_match(parsed.get('skills', []), use_req_skills, use_pref_skills)
    e_m = compute_experience_match(parsed.get('experience', []), use_exp, job.description or "")
    edu_m = compute_education_match(parsed.get('education', []), job.required_education or "")
    p_m = compute_project_relevance(parsed.get('projects', []), job.description or "")
    c_m = compute_certification_match(parsed.get('certifications', []), [])
    
    weights = {'skills_weight': 0.4, 'experience_weight': 0.25, 'education_weight': 0.15, 'project_weight': 0.1, 'certification_weight': 0.1}
    score_data = calculate_overall_score(s_m, e_m, edu_m, p_m, c_m, weights)
    
    new_score = round(score_data['overall_score'], 1)
    
    # Compare with existing application result
    app = db.query(Application).filter(Application.job_id == job_id, Application.candidate_id == candidate_id).first()
    orig_res = db.query(ScreeningResult).filter(ScreeningResult.application_id == app.id).first() if app else None
    orig_score = orig_res.overall_score if orig_res else 70.0
    
    change = round(new_score - orig_score, 1)
    exp_text = f"Requirement adjustments updated match score from {orig_score}% to {new_score}%."
    if change > 0:
        exp_text += f" Score increased by {change}% due to higher qualification alignment."
    elif change < 0:
        exp_text += f" Score decreased by {abs(change)}% due to stricter skill or experience demands."
        
    return {
        "original_score": orig_score,
        "new_score": new_score,
        "score_change": change,
        "changed_components": score_data['component_scores'],
        "explanation": exp_text
    }

@router.post("/shortlist/{application_id}")
def api_shortlist_route(application_id: str, body: dict = Body(...), db: Session = Depends(get_db)):
    decision = body.get("decision", "shortlisted")
    reason = body.get("reason", "")
    return shortlist_candidate(db, application_id, decision, reason, "recruiter")

@router.post("/shortlist")
def api_shortlist(req: ShortlistRequest, db: Session = Depends(get_db)):
    return shortlist_candidate(db, req.application_id, req.decision, req.reason, "recruiter")

@router.post("/batch-shortlist/{job_id}")
def api_batch_shortlist_route(job_id: str, body: dict = Body(...), db: Session = Depends(get_db)):
    threshold = body.get("threshold", 75.0)
    return batch_shortlist(db, job_id, threshold, "recruiter")

@router.post("/batch-shortlist")
def api_batch_shortlist(req: BatchShortlistRequest, db: Session = Depends(get_db)):
    return batch_shortlist(db, req.job_id, req.threshold_score, "recruiter")

@router.post("/interview-questions/{application_id}")
def api_gen_questions(application_id: str, db: Session = Depends(get_db)):
    from app.ai.interview_generator import generate_interview_questions
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    resume = db.query(Resume).filter(Resume.id == app.resume_id).first()
    job = db.query(Job).filter(Job.id == app.job_id).first()
    parsed = resume.parsed_sections if resume else {}
    
    # Delete old questions
    db.query(InterviewQuestion).filter(InterviewQuestion.application_id == application_id).delete()
    
    q_dict = generate_interview_questions(parsed or {}, job.__dict__ if job else {}, {})
    created = []
    for cat, qs in q_dict.items():
        for q in qs:
            iq = InterviewQuestion(
                application_id=application_id,
                job_id=job.id if job else None,
                candidate_id=app.candidate_id,
                category=cat,
                question=q.get('question', ''),
                context=q.get('context', ''),
                difficulty=q.get('difficulty', 'medium')
            )
            db.add(iq)
            created.append(iq)
    db.commit()
    return created

@router.get("/interview-questions/{application_id}")
def api_get_questions(application_id: str, db: Session = Depends(get_db)):
    qs = db.query(InterviewQuestion).filter(InterviewQuestion.application_id == application_id).all()
    if not qs:
        return api_gen_questions(application_id, db)
    return qs
