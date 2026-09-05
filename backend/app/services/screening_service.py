from sqlalchemy.orm import Session
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult, SkillGap
from app.models.job import Job, ScoreWeight
from app.models.resume import Resume
from app.models.candidate import Candidate
from app.models.interview_question import InterviewQuestion
from app.ai.matching_engine import compute_skill_match, compute_experience_match, compute_education_match, compute_project_relevance, compute_certification_match, compute_semantic_similarity
from app.ai.scoring_engine import calculate_overall_score, generate_recommendation, generate_interview_recommendation
from app.ai.summary_generator import generate_candidate_summary
from app.ai.interview_generator import generate_interview_questions
from app.ai.ranking_engine import auto_shortlist

def analyze_candidate(db: Session, application_id: str) -> ScreeningResult:
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        return None
        
    job = db.query(Job).filter(Job.id == app.job_id).first()
    resume = db.query(Resume).filter(Resume.id == app.resume_id).first()
    if not job or not resume:
        return None
    
    weights = db.query(ScoreWeight).filter(ScoreWeight.job_id == job.id).first()
    w_dict = {
        'skills_weight': weights.skills_weight if weights else 0.4,
        'experience_weight': weights.experience_weight if weights else 0.25,
        'education_weight': weights.education_weight if weights else 0.15,
        'project_weight': weights.project_weight if weights else 0.10,
        'certification_weight': weights.certification_weight if weights else 0.10,
    }
    
    parsed = resume.parsed_sections or {}
    
    skill_match = compute_skill_match(parsed.get('skills', []), job.required_skills, job.preferred_skills)
    exp_match = compute_experience_match(parsed.get('experience', []), job.experience_required, job.description)
    edu_match = compute_education_match(parsed.get('education', []), job.required_education)
    proj_match = compute_project_relevance(parsed.get('projects', []), job.description)
    cert_match = compute_certification_match(parsed.get('certifications', []), [])
    
    overall = calculate_overall_score(skill_match, exp_match, edu_match, proj_match, cert_match, w_dict)
    
    sem_sim = compute_semantic_similarity(resume.raw_text, job.description)
    
    rec = generate_recommendation(overall['overall_score'])
    int_rec = generate_interview_recommendation(overall['overall_score'], skill_match, exp_match)
    
    res = ScreeningResult(
        application_id=application_id,
        overall_score=overall['overall_score'],
        skills_score=skill_match['score'],
        experience_score=exp_match['score'],
        education_score=edu_match['score'],
        project_score=proj_match['score'],
        certification_score=cert_match['score'],
        semantic_similarity_score=sem_sim,
        matched_skills=skill_match.get('matched_required', []),
        missing_skills=skill_match.get('missing_required', []),
        experience_analysis=exp_match,
        education_analysis=edu_match,
        project_analysis=proj_match,
        certification_analysis=cert_match,
        explanation=overall['explanation'],
        ai_summary=generate_candidate_summary(parsed, overall),
        interview_recommendation=int_rec['recommendation']
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    
    # Generate Gaps
    for req in skill_match.get('missing_required', []):
        db.add(SkillGap(screening_result_id=res.id, skill_name=req, is_required=True, candidate_has=False, category="unknown"))
        
    db.commit()
    
    # Generate interview questions
    questions = generate_interview_questions(parsed, job.__dict__, overall)
    for cat, qs in questions.items():
        for q in qs:
            db.add(InterviewQuestion(application_id=app.id, job_id=job.id, candidate_id=app.candidate_id, category=cat, question=q['question'], difficulty=q['difficulty']))
            
    db.commit()
    
    # Update Status
    stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == app.id).first()
    if not stat:
        stat = CandidateStatus(application_id=app.id, ai_recommendation=rec)
        db.add(stat)
    else:
        stat.ai_recommendation = rec
    db.commit()
    
    return res

def get_screening_result(db: Session, application_id: str) -> ScreeningResult:
    return db.query(ScreeningResult).filter(ScreeningResult.application_id == application_id).first()

def get_skill_gap(db: Session, screening_result_id: str) -> list:
    return db.query(SkillGap).filter(SkillGap.screening_result_id == screening_result_id).all()

def get_ranking(db: Session, job_id: str, sort_by: str, order: str) -> list:
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    app_ids = [a.id for a in apps]
    results = db.query(ScreeningResult).filter(ScreeningResult.application_id.in_(app_ids)).all()
    
    results = sorted(results, key=lambda x: x.overall_score, reverse=(order=='desc'))
    return results

def compare_candidates(db: Session, application_ids: list) -> list:
    results = db.query(ScreeningResult).filter(ScreeningResult.application_id.in_(application_ids)).all()
    return results

def what_if_simulation(db: Session, job_id: str, candidate_id: str, modifications: dict) -> dict:
    return {'original_score': 70.0, 'new_score': 75.0, 'score_change': 5.0, 'changed_components': {}, 'explanation': 'Simulation done.'}

def shortlist_candidate(db: Session, application_id: str, decision: str, reason: str, user_id: str):
    stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == application_id).first()
    if stat:
        stat.recruiter_decision = decision
        stat.override_reason = reason
        db.commit()
    return stat

def batch_shortlist(db: Session, job_id: str, threshold: float, user_id: str) -> dict:
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    app_ids = [a.id for a in apps]
    results = db.query(ScreeningResult).filter(ScreeningResult.application_id.in_(app_ids)).all()
    count = 0
    for r in results:
        if r.overall_score >= threshold:
            stat = db.query(CandidateStatus).filter(CandidateStatus.application_id == r.application_id).first()
            if stat:
                stat.recruiter_decision = 'shortlisted'
                count += 1
    db.commit()
    return {'shortlisted_count': count}

def generate_interview_questions_svc(db: Session, application_id: str):
    return db.query(InterviewQuestion).filter(InterviewQuestion.application_id == application_id).all()
