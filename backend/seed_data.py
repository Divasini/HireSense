"""
HireSense AI — Database Seeding & Sanitization Script
=====================================================
PRODUCTION SEEDING POLICY:
- Only seeds baseline administrator / recruiter accounts and Job postings.
- NEVER seeds fake candidate users, fake resumes, fake applications, or fake screening results.
- Provides a safe cleanup utility (clean_fake_candidate_data) to purge any legacy demo candidate data.
"""

import sys
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.job import Job, ScoreWeight
from app.models.candidate import Candidate
from app.models.resume import Resume, ResumeSkill
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult, SkillGap
from app.models.interview_question import InterviewQuestion
from app.models.interview_session import InterviewSession
from app.models.experience import Experience
from app.models.education import Education
from app.models.project import Project
from app.models.certification import Certification
from app.models.notification import Notification
from app.core.security import hash_password

DEMO_CANDIDATE_EMAILS = [
    "candidate@recruitment.ai",
    "sarah.chen@email.com",
    "marcus.vance@email.com",
    "elena.rostova@email.com",
    "david.kumar@email.com",
    "priya.sharma@email.com",
    "hannah.lee@email.com",
    "julian.becker@email.com",
    "liam.murphy@email.com",
    "chloe.bennett@email.com",
    "alex.hayes@email.com",
    "sofia.gomez@email.com",
    "jordan.reed@email.com",
    "rachel.sterling@email.com",
    "vikram.sethi@email.com",
    "emily.watson@email.com",
]

DEMO_CANDIDATE_IDS = [f"cand-{i}" for i in range(1, 25)]


def clean_fake_candidate_data(db: Session) -> dict:
    """
    Safely removes all legacy fake/seeded candidate accounts, resumes, applications,
    and screening results from the database without affecting real production accounts.
    """
    print("Initiating safe cleanup of fake/demo candidate data...")
    
    # Identify fake candidate IDs
    fake_candidates = db.query(Candidate).filter(
        (Candidate.id.in_(DEMO_CANDIDATE_IDS)) |
        (Candidate.email.in_(DEMO_CANDIDATE_EMAILS))
    ).all()
    fake_cand_ids = [c.id for c in fake_candidates]

    # Also find any fake candidate users
    fake_users = db.query(User).filter(User.email.in_(DEMO_CANDIDATE_EMAILS)).all()
    fake_user_ids = [u.id for u in fake_users]

    # Identify applications
    fake_apps = db.query(Application).filter(
        (Application.candidate_id.in_(fake_cand_ids)) |
        (Application.id.like("app-cand-%"))
    ).all()
    fake_app_ids = [a.id for a in fake_apps]

    # Identify resumes
    fake_resumes = db.query(Resume).filter(
        (Resume.candidate_id.in_(fake_cand_ids)) |
        (Resume.id.like("resume-cand-%")) |
        (Resume.filename.like("%_Profile.txt"))
    ).all()
    fake_resume_ids = [r.id for r in fake_resumes]

    # 1. Delete InterviewSessions
    if fake_cand_ids:
        db.query(InterviewSession).filter(InterviewSession.candidate_id.in_(fake_cand_ids)).delete(synchronize_session=False)

    # 2. Delete InterviewQuestions
    if fake_app_ids or fake_cand_ids:
        db.query(InterviewQuestion).filter(
            (InterviewQuestion.application_id.in_(fake_app_ids)) |
            (InterviewQuestion.candidate_id.in_(fake_cand_ids))
        ).delete(synchronize_session=False)

    # 3. Delete ScreeningResults & SkillGaps
    fake_screenings = db.query(ScreeningResult).filter(ScreeningResult.application_id.in_(fake_app_ids)).all() if fake_app_ids else []
    fake_scr_ids = [s.id for s in fake_screenings]
    if fake_scr_ids:
        db.query(SkillGap).filter(SkillGap.screening_result_id.in_(fake_scr_ids)).delete(synchronize_session=False)
        db.query(ScreeningResult).filter(ScreeningResult.id.in_(fake_scr_ids)).delete(synchronize_session=False)

    # 4. Delete CandidateStatus
    if fake_app_ids:
        db.query(CandidateStatus).filter(CandidateStatus.application_id.in_(fake_app_ids)).delete(synchronize_session=False)

    # 5. Delete Applications
    if fake_app_ids:
        db.query(Application).filter(Application.id.in_(fake_app_ids)).delete(synchronize_session=False)

    # 6. Delete ResumeSkills & Resumes
    if fake_resume_ids:
        db.query(ResumeSkill).filter(ResumeSkill.resume_id.in_(fake_resume_ids)).delete(synchronize_session=False)
        db.query(Resume).filter(Resume.id.in_(fake_resume_ids)).delete(synchronize_session=False)

    # 7. Delete Experiences, Educations, Projects, Certifications
    if fake_cand_ids:
        db.query(Experience).filter(Experience.candidate_id.in_(fake_cand_ids)).delete(synchronize_session=False)
        db.query(Education).filter(Education.candidate_id.in_(fake_cand_ids)).delete(synchronize_session=False)
        db.query(Project).filter(Project.candidate_id.in_(fake_cand_ids)).delete(synchronize_session=False)
        db.query(Certification).filter(Certification.candidate_id.in_(fake_cand_ids)).delete(synchronize_session=False)

    # 8. Delete Candidates
    if fake_cand_ids:
        db.query(Candidate).filter(Candidate.id.in_(fake_cand_ids)).delete(synchronize_session=False)

    # 9. Delete Fake Candidate Users
    if fake_user_ids:
        db.query(User).filter(User.id.in_(fake_user_ids)).delete(synchronize_session=False)

    # 10. Clean notifications referencing demo candidate names
    db.query(Notification).filter(
        (Notification.message.like("%Sarah Chen%")) |
        (Notification.message.like("%Marcus Vance%")) |
        (Notification.message.like("%Elena Rostova%"))
    ).delete(synchronize_session=False)

    db.commit()
    print(f"Cleanup complete! Removed {len(fake_cand_ids)} fake candidates, {len(fake_resumes)} resumes, {len(fake_app_ids)} applications.")
    return {
        "deleted_candidates": len(fake_cand_ids),
        "deleted_resumes": len(fake_resumes),
        "deleted_applications": len(fake_app_ids),
        "deleted_users": len(fake_user_ids)
    }


def seed_jobs_and_staff():
    """
    Seeds baseline administrator and recruiter accounts, and realistic job listings.
    Zero candidate profiles or resumes are seeded.
    """
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # Step 1: Always ensure legacy fake candidate data is purged
    clean_fake_candidate_data(db)

    print("Seeding baseline administrative & recruiter accounts...")
    staff_users = [
        User(
            id="admin-1",
            email="admin@recruitment.ai",
            password_hash=hash_password("admin123"),
            full_name="System Administrator",
            role="admin"
        ),
        User(
            id="recruiter-1",
            email="recruiter@recruitment.ai",
            password_hash=hash_password("recruiter123"),
            full_name="Alex Morgan",
            role="recruiter"
        ),
    ]
    for u in staff_users:
        existing = db.query(User).filter(User.email == u.email).first()
        if not existing:
            db.add(u)
    db.commit()

    print("Seeding realistic benchmark jobs...")
    jobs_data = [
        {
            "id": "job-1",
            "title": "Senior Data Analyst",
            "company": "Apex Analytics Inc.",
            "location": "San Francisco, CA (Hybrid)",
            "employment_type": "Full-time",
            "experience_required": "3+ years",
            "salary_range": "$110,000 - $140,000",
            "required_education": "Bachelor's in Computer Science, Statistics, or related",
            "required_skills": ["Python", "SQL", "Power BI", "Tableau", "Pandas", "Statistical Analysis"],
            "preferred_skills": ["AWS", "Machine Learning", "Snowflake", "dbt"],
            "description": "Apex Analytics is seeking an experienced Senior Data Analyst to lead our business intelligence initiatives. You will design, build, and optimize analytical models, write complex SQL queries, and construct interactive dashboards in Power BI and Tableau. Strong proficiency with Python (Pandas/NumPy) for automated ETL and exploratory data analysis is essential. Experience with cloud data warehouses like Snowflake and AWS data services is a strong plus.",
            "responsibilities": [
                "Build scalable SQL pipelines and ETL data workflows.",
                "Design enterprise dashboards in Power BI and Tableau for C-suite reporting.",
                "Conduct deep-dive statistical analysis and A/B test evaluations using Python.",
                "Collaborate with engineering teams to integrate Snowflake data models."
            ],
            "status": "active"
        },
        {
            "id": "job-2",
            "title": "Full Stack Developer",
            "company": "CloudScale Technologies",
            "location": "New York, NY (Remote)",
            "employment_type": "Full-time",
            "experience_required": "2+ years",
            "salary_range": "$100,000 - $135,000",
            "required_education": "Bachelor's in Computer Science or Software Engineering",
            "required_skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "FastAPI", "Tailwind CSS"],
            "preferred_skills": ["Docker", "AWS", "GraphQL", "Redis", "Next.js"],
            "description": "CloudScale Technologies is hiring a Full Stack Developer to build modern cloud applications. The role involves crafting responsive web interfaces with React, TypeScript, and Tailwind CSS, while building robust microservices using Node.js and FastAPI backed by PostgreSQL. Experience with Docker containerization and AWS cloud deployments is preferred.",
            "responsibilities": [
                "Develop clean, accessible user interfaces using React and modern TypeScript.",
                "Build high-throughput REST APIs and WebSocket endpoints with FastAPI and Node.js.",
                "Design schema migrations and query optimizations in PostgreSQL.",
                "Maintain CI/CD deployment pipelines using Docker."
            ],
            "status": "active"
        },
        {
            "id": "job-3",
            "title": "Machine Learning Engineer",
            "company": "Cognitive AI Labs",
            "location": "Austin, TX (Hybrid)",
            "employment_type": "Full-time",
            "experience_required": "3+ years",
            "salary_range": "$140,000 - $185,000",
            "required_education": "Master's or Ph.D. in Computer Science, AI, or Mathematics",
            "required_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "NLP", "Machine Learning"],
            "preferred_skills": ["Transformers", "Hugging Face", "MLOps", "Docker", "Kubeflow", "RAG"],
            "description": "Cognitive AI Labs is looking for a passionate Machine Learning Engineer to push the boundaries of natural language processing and semantic information extraction. You will train, fine-tune, and deploy transformer-based deep learning architectures and LLMs using PyTorch, Hugging Face, and Scikit-learn. Experience in MLOps and production model serving is highly desired.",
            "responsibilities": [
                "Train, evaluate, and benchmark deep learning architectures for NLP tasks.",
                "Deploy scalable inference pipelines using PyTorch and FastAPI.",
                "Build automated MLOps tracking pipelines with MLflow and Docker.",
                "Conduct research into retrieval-augmented generation (RAG) and dense vector embeddings."
            ],
            "status": "active"
        },
        {
            "id": "job-4",
            "title": "DevOps & Cloud Engineer",
            "company": "SkyHigh Cloud Services",
            "location": "Seattle, WA (Hybrid)",
            "employment_type": "Full-time",
            "experience_required": "3+ years",
            "salary_range": "$125,000 - $160,000",
            "required_education": "Bachelor's in Computer Science or equivalent field",
            "required_skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
            "preferred_skills": ["Ansible", "Prometheus", "Grafana", "Python", "Helm", "GCP"],
            "description": "SkyHigh Cloud Services is seeking a DevOps & Cloud Engineer to architect, automate, and scale our multi-region cloud infrastructure. You will manage Kubernetes clusters on AWS, write infrastructure-as-code with Terraform, and configure automated GitHub Actions CI/CD pipelines.",
            "responsibilities": [
                "Manage production Kubernetes clusters (EKS) and container runtimes.",
                "Author robust Terraform modules for AWS cloud provisioning.",
                "Build and maintain CI/CD pipelines with zero-downtime deployment strategies.",
                "Establish monitoring, alerting, and telemetry with Prometheus and Grafana."
            ],
            "status": "active"
        },
        {
            "id": "job-5",
            "title": "Business Intelligence Analyst",
            "company": "Midwest Financial Partners",
            "location": "Chicago, IL (On-site)",
            "employment_type": "Full-time",
            "experience_required": "2+ years",
            "salary_range": "$90,000 - $115,000",
            "required_education": "Bachelor's in Finance, Economics, Business, or Analytics",
            "required_skills": ["SQL", "Power BI", "Excel", "Communication", "Data Visualization", "Problem Solving"],
            "preferred_skills": ["Tableau", "Financial Modeling", "Python", "Alteryx"],
            "description": "Midwest Financial Partners is seeking a Business Intelligence Analyst to transform complex transactional data into executive insights. You will write advanced SQL queries, design Power BI dashboards, and present financial metrics to stakeholders.",
            "responsibilities": [
                "Create and maintain executive Power BI reports and financial dashboards.",
                "Extract and clean relational data using complex SQL queries.",
                "Perform exploratory cohort analysis and financial trend forecasting.",
                "Present actionable insights to department leaders and portfolio managers."
            ],
            "status": "active"
        }
    ]

    for j_data in jobs_data:
        existing_job = db.query(Job).filter(Job.id == j_data["id"]).first()
        if not existing_job:
            job = Job(
                id=j_data["id"],
                title=j_data["title"],
                company=j_data["company"],
                location=j_data["location"],
                employment_type=j_data["employment_type"],
                experience_required=j_data["experience_required"],
                salary_range=j_data["salary_range"],
                required_education=j_data["required_education"],
                required_skills=j_data["required_skills"],
                preferred_skills=j_data["preferred_skills"],
                description=j_data["description"],
                responsibilities=j_data["responsibilities"],
                status=j_data["status"],
                recruiter_id="recruiter-1"
            )
            db.add(job)
            db.commit()

            weight = ScoreWeight(
                job_id=job.id,
                skills_weight=0.40,
                experience_weight=0.25,
                education_weight=0.15,
                project_weight=0.10,
                certification_weight=0.10
            )
            db.add(weight)
            db.commit()

    print("Seeding complete! Database has 5 jobs and admin/recruiter accounts.")
    print("NO candidate profiles, NO resumes, and NO screening results were created.")
    db.close()


if __name__ == "__main__":
    if "--clean-only" in sys.argv:
        db = SessionLocal()
        clean_fake_candidate_data(db)
        db.close()
    else:
        seed_jobs_and_staff()
