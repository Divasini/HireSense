from sqlalchemy.orm import Session
from app.models.job import Job, JobSkill, ScoreWeight
from app.schemas.job import JobCreate, JobUpdate, ScoreWeightUpdate
from app.ai.job_analyzer import analyze_job_description

def create_job(db: Session, job_data: JobCreate, recruiter_id: str) -> Job:
    analysis = analyze_job_description(job_data.description)
    
    db_job = Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        description=job_data.description,
        employment_type=job_data.employment_type,
        experience_required=job_data.experience_required or analysis['required_experience'],
        salary_range=job_data.salary_range,
        required_skills=job_data.required_skills or analysis['required_skills'],
        preferred_skills=job_data.preferred_skills or analysis['preferred_skills'],
        required_education=job_data.required_education or analysis['required_education'],
        responsibilities=job_data.responsibilities or analysis['responsibilities'],
        recruiter_id=recruiter_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Create default weights
    sw = ScoreWeight(job_id=db_job.id)
    db.add(sw)
    db.commit()
    
    return db_job

def get_jobs(db: Session, recruiter_id=None, status=None, page=1, per_page=20):
    query = db.query(Job)
    if recruiter_id:
        query = query.filter(Job.recruiter_id == recruiter_id)
    if status:
        query = query.filter(Job.status == status)
    
    return query.offset((page - 1) * per_page).limit(per_page).all()

def get_job(db: Session, job_id: str) -> Job:
    return db.query(Job).filter(Job.id == job_id).first()

def update_job(db: Session, job_id: str, job_data: JobUpdate) -> Job:
    db_job = get_job(db, job_id)
    if not db_job:
        return None
    update_data = job_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: str):
    db_job = get_job(db, job_id)
    if db_job:
        db.delete(db_job)
        db.commit()

def get_score_weights(db: Session, job_id: str):
    return db.query(ScoreWeight).filter(ScoreWeight.job_id == job_id).first()

def update_score_weights(db: Session, job_id: str, weights: ScoreWeightUpdate):
    sw = get_score_weights(db, job_id)
    if sw:
        for k, v in weights.model_dump().items():
            setattr(sw, k, v)
        db.commit()
        db.refresh(sw)
    return sw
