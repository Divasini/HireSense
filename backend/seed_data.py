import os
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.job import Job, ScoreWeight
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.application import Application, CandidateStatus
from app.models.screening import ScreeningResult, SkillGap
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.core.security import hash_password
from app.services.screening_service import analyze_candidate

def seed():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(Job).count() >= 5:
        print("Database already contains demo data. Skipping seed.")
        db.close()
        return

    print("Seeding demo users...")
    users = [
        User(id=str(uuid.uuid4()), email="admin@recruitment.ai", password_hash=hash_password("admin123"), full_name="System Administrator", role="admin"),
        User(id="recruiter-1", email="recruiter@recruitment.ai", password_hash=hash_password("recruiter123"), full_name="Alex Morgan", role="recruiter"),
        User(id=str(uuid.uuid4()), email="sarah.chen@email.com", password_hash=hash_password("candidate123"), full_name="Sarah Chen", role="candidate"),
        User(id=str(uuid.uuid4()), email="marcus.vance@email.com", password_hash=hash_password("candidate123"), full_name="Marcus Vance", role="candidate"),
        User(id=str(uuid.uuid4()), email="elena.rostova@email.com", password_hash=hash_password("candidate123"), full_name="Elena Rostova", role="candidate"),
    ]
    for u in users:
        existing = db.query(User).filter(User.email == u.email).first()
        if not existing:
            db.add(u)
    db.commit()

    print("Seeding realistic jobs...")
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
                "Conduct research into retrieval-augmented generation (RAG) models."
            ],
            "status": "active"
        },
        {
            "id": "job-4",
            "title": "DevOps & Cloud Engineer",
            "company": "Vanguard Systems",
            "location": "Seattle, WA (Remote)",
            "employment_type": "Full-time",
            "experience_required": "2+ years",
            "salary_range": "$115,000 - $150,000",
            "required_education": "Bachelor's Degree",
            "required_skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
            "preferred_skills": ["Ansible", "Prometheus", "Grafana", "Python", "GCP"],
            "description": "Vanguard Systems requires a DevOps Engineer to automate and harden our infrastructure. You will manage Kubernetes clusters across AWS, write modular Terraform configuration, and build resilient CI/CD pipelines with GitHub Actions. Deep familiarity with Linux system administration and monitoring with Prometheus/Grafana is required.",
            "responsibilities": [
                "Provision scalable cloud architecture with Terraform across AWS environments.",
                "Manage production Kubernetes (EKS) clusters with zero-downtime rollouts.",
                "Build continuous delivery workflows using GitHub Actions and ArgoCD.",
                "Implement observability dashboards and automated alerting in Grafana."
            ],
            "status": "active"
        },
        {
            "id": "job-5",
            "title": "Business Intelligence Analyst",
            "company": "Global Horizons Financial",
            "location": "Chicago, IL (On-site)",
            "employment_type": "Full-time",
            "experience_required": "1+ years",
            "salary_range": "$85,000 - $105,000",
            "required_education": "Bachelor's in Business, Finance, or Analytics",
            "required_skills": ["SQL", "Power BI", "Communication", "Data Visualization", "Problem Solving"],
            "preferred_skills": ["Python", "Tableau", "ETL", "Financial Modeling"],
            "description": "Global Horizons Financial seeks a Business Intelligence Analyst to bridge the gap between finance operations and technical analytics. You will query relational databases, craft visual executive dashboards in Power BI, and translate raw financial metrics into actionable strategic insights. Strong written and verbal communication is mandatory.",
            "responsibilities": [
                "Gather analytical requirements from stakeholders and business leaders.",
                "Extract and clean data sets using complex SQL queries.",
                "Create comprehensive visual reports and forecasting models in Power BI.",
                "Present quarterly business metrics to department heads."
            ],
            "status": "active"
        }
    ]

    for jd in jobs_data:
        existing_job = db.query(Job).filter(Job.id == jd["id"]).first()
        if not existing_job:
            job = Job(
                id=jd["id"],
                title=jd["title"],
                company=jd["company"],
                location=jd["location"],
                employment_type=jd["employment_type"],
                experience_required=jd["experience_required"],
                salary_range=jd["salary_range"],
                required_education=jd["required_education"],
                required_skills=jd["required_skills"],
                preferred_skills=jd["preferred_skills"],
                description=jd["description"],
                responsibilities=jd["responsibilities"],
                status=jd["status"],
                recruiter_id="recruiter-1"
            )
            db.add(job)
            db.commit()
            
            # Add default weights
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

    print("Seeding 15 realistic candidates with parsed resume profiles...")
    candidates_data = [
        # Match for Job 1: Senior Data Analyst
        {
            "id": "cand-1",
            "name": "Sarah Chen",
            "email": "sarah.chen@email.com",
            "location": "San Francisco, CA",
            "years": 4.5,
            "target_job": "job-1",
            "skills": ["Python", "SQL", "Power BI", "Tableau", "Pandas", "Statistical Analysis", "Snowflake", "Git"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Statistics", "institution": "UC Berkeley", "year": 2020}],
            "experience": [
                {"company": "DataBridge Tech", "job_title": "Senior Data Analyst", "duration_months": 30, "technologies": ["Python", "SQL", "Power BI", "Snowflake"]},
                {"company": "Metro Insights", "job_title": "Junior Business Analyst", "duration_months": 24, "technologies": ["SQL", "Tableau", "Excel"]}
            ],
            "projects": [{"title": "Customer Churn Prediction Dashboard", "description": "Built interactive Power BI dashboards and Python churn classification model reducing attrition by 14%.", "technologies": ["Python", "SQL", "Power BI"]}],
            "certifications": [{"name": "Microsoft Certified: Power BI Data Analyst Associate", "issuer": "Microsoft", "year": 2022}]
        },
        {
            "id": "cand-2",
            "name": "David Kumar",
            "email": "david.kumar@email.com",
            "location": "San Jose, CA",
            "years": 3.0,
            "target_job": "job-1",
            "skills": ["Python", "SQL", "Tableau", "Pandas", "NumPy", "AWS", "Git"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Computer Science", "institution": "San Jose State University", "year": 2021}],
            "experience": [{"company": "Bay Analytics", "job_title": "Data Analyst", "duration_months": 36, "technologies": ["Python", "SQL", "Tableau"]}],
            "projects": [{"title": "Supply Chain Flow Optimizer", "description": "Designed Tableau reports and automated Pandas ETL pipelines processing 2M daily records.", "technologies": ["Python", "SQL", "Tableau"]}],
            "certifications": [{"name": "Tableau Desktop Specialist", "issuer": "Tableau", "year": 2023}]
        },
        {
            "id": "cand-3",
            "name": "Priya Sharma",
            "email": "priya.sharma@email.com",
            "location": "Oakland, CA",
            "years": 1.5,
            "target_job": "job-1",
            "skills": ["SQL", "Excel", "Tableau", "Communication"],
            "education": [{"degree": "Bachelor of Arts", "field_of_study": "Economics", "institution": "UC Davis", "year": 2023}],
            "experience": [{"company": "FinGroup", "job_title": "Associate Analyst", "duration_months": 18, "technologies": ["SQL", "Excel"]}],
            "projects": [{"title": "Regional Sales Visualization", "description": "Built quarterly Tableau sales reports for regional managers.", "technologies": ["SQL", "Tableau"]}],
            "certifications": []
        },

        # Match for Job 2: Full Stack Developer
        {
            "id": "cand-4",
            "name": "Marcus Vance",
            "email": "marcus.vance@email.com",
            "location": "New York, NY",
            "years": 3.5,
            "target_job": "job-2",
            "skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "FastAPI", "Tailwind CSS", "Docker", "AWS"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Software Engineering", "institution": "Columbia University", "year": 2021}],
            "experience": [
                {"company": "StackFlow SaaS", "job_title": "Full Stack Engineer", "duration_months": 28, "technologies": ["React", "TypeScript", "Node.js", "FastAPI", "PostgreSQL"]},
                {"company": "CodeNest", "job_title": "Frontend Developer", "duration_months": 14, "technologies": ["React", "JavaScript", "Tailwind CSS"]}
            ],
            "projects": [{"title": "Enterprise Collaboration Suite", "description": "Engineered real-time SaaS platform using React, TypeScript, FastAPI, and PostgreSQL with Docker deployments.", "technologies": ["React", "TypeScript", "FastAPI", "Docker"]}],
            "certifications": [{"name": "AWS Certified Developer - Associate", "issuer": "Amazon Web Services", "year": 2023}]
        },
        {
            "id": "cand-5",
            "name": "Hannah Lee",
            "email": "hannah.lee@email.com",
            "location": "Jersey City, NJ",
            "years": 2.5,
            "target_job": "job-2",
            "skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Computer Science", "institution": "Rutgers University", "year": 2022}],
            "experience": [{"company": "PixelPoint Labs", "job_title": "Web Developer", "duration_months": 30, "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL"]}],
            "projects": [{"title": "E-Commerce Micro-Frontend", "description": "Built high-speed modular checkout interface in React & Tailwind CSS.", "technologies": ["React", "Tailwind CSS", "Node.js"]}],
            "certifications": []
        },
        {
            "id": "cand-6",
            "name": "Julian Becker",
            "email": "julian.becker@email.com",
            "location": "Brooklyn, NY",
            "years": 1.0,
            "target_job": "job-2",
            "skills": ["JavaScript", "HTML", "CSS", "React", "Git"],
            "education": [{"degree": "Bachelor of Arts", "field_of_study": "Digital Media", "institution": "NYU", "year": 2023}],
            "experience": [{"company": "Creative Agency", "job_title": "Junior Frontend Dev", "duration_months": 12, "technologies": ["React", "JavaScript"]}],
            "projects": [{"title": "Portfolio Web Apps", "description": "Developed dynamic agency showcase websites.", "technologies": ["React", "CSS"]}],
            "certifications": []
        },

        # Match for Job 3: Machine Learning Engineer
        {
            "id": "cand-7",
            "name": "Elena Rostova",
            "email": "elena.rostova@email.com",
            "location": "Austin, TX",
            "years": 5.0,
            "target_job": "job-3",
            "skills": ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "NLP", "Machine Learning", "Transformers", "Docker", "MLOps"],
            "education": [{"degree": "Master of Science", "field_of_study": "Artificial Intelligence", "institution": "UT Austin", "year": 2020}],
            "experience": [
                {"company": "NeuralEdge Systems", "job_title": "Senior ML Engineer", "duration_months": 36, "technologies": ["Python", "PyTorch", "Transformers", "Docker", "MLOps"]},
                {"company": "Cognito Tech", "job_title": "Data Scientist", "duration_months": 24, "technologies": ["Python", "TensorFlow", "Scikit-learn"]}
            ],
            "projects": [{"title": "Semantic Document Entity Extractor", "description": "Trained domain-adapted BERT language models achieving 94.2% F1 score in legal text parsing.", "technologies": ["PyTorch", "Hugging Face", "Docker"]}],
            "certifications": [{"name": "Deep Learning Specialization", "issuer": "DeepLearning.AI", "year": 2021}]
        },
        {
            "id": "cand-8",
            "name": "Liam Murphy",
            "email": "liam.murphy@email.com",
            "location": "Dallas, TX",
            "years": 3.0,
            "target_job": "job-3",
            "skills": ["Python", "TensorFlow", "Scikit-learn", "Machine Learning", "Pandas", "Docker"],
            "education": [{"degree": "Master of Science", "field_of_study": "Data Science", "institution": "Texas A&M", "year": 2021}],
            "experience": [{"company": "OmniVision AI", "job_title": "Machine Learning Engineer", "duration_months": 36, "technologies": ["Python", "TensorFlow", "Scikit-learn"]}],
            "projects": [{"title": "Automated Anomaly Detection", "description": "Built time-series anomaly detection pipeline using TensorFlow & Scikit-learn.", "technologies": ["Python", "TensorFlow"]}],
            "certifications": []
        },
        {
            "id": "cand-9",
            "name": "Chloe Bennett",
            "email": "chloe.bennett@email.com",
            "location": "Houston, TX",
            "years": 1.2,
            "target_job": "job-3",
            "skills": ["Python", "Scikit-learn", "Pandas", "Matplotlib"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Mathematics", "institution": "University of Houston", "year": 2023}],
            "experience": [{"company": "DataWorks", "job_title": "Junior Data Analyst", "duration_months": 14, "technologies": ["Python", "Pandas"]}],
            "projects": [{"title": "House Price Regressor", "description": "Trained linear regression and random forest models using Scikit-learn.", "technologies": ["Python", "Scikit-learn"]}],
            "certifications": []
        },

        # Match for Job 4: DevOps & Cloud Engineer
        {
            "id": "cand-10",
            "name": "Alexander Hayes",
            "email": "alex.hayes@email.com",
            "location": "Seattle, WA",
            "years": 4.0,
            "target_job": "job-4",
            "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Ansible", "Prometheus"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Information Systems", "institution": "University of Washington", "year": 2020}],
            "experience": [{"company": "SkyHigh Cloud Services", "job_title": "DevOps Engineer", "duration_months": 48, "technologies": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"]}],
            "projects": [{"title": "Multi-Region Kubernetes Fleet", "description": "Provisioned automated AWS EKS clusters with Terraform and GitOps pipeline managing 500+ microservices.", "technologies": ["Kubernetes", "Terraform", "AWS"]}],
            "certifications": [{"name": "Certified Kubernetes Administrator (CKA)", "issuer": "Linux Foundation", "year": 2022}]
        },
        {
            "id": "cand-11",
            "name": "Sofia Gomez",
            "email": "sofia.gomez@email.com",
            "location": "Bellevue, WA",
            "years": 2.5,
            "target_job": "job-4",
            "skills": ["Docker", "AWS", "Linux", "CI/CD", "Git", "Python"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Computer Engineering", "institution": "Washington State University", "year": 2022}],
            "experience": [{"company": "Cascade Ops", "job_title": "Cloud Infrastructure Engineer", "duration_months": 30, "technologies": ["Docker", "AWS", "CI/CD"]}],
            "projects": [{"title": "Serverless Pipeline Architecture", "description": "Implemented zero-maintenance container deployments with AWS ECS.", "technologies": ["AWS", "Docker"]}],
            "certifications": [{"name": "AWS Solutions Architect - Associate", "issuer": "AWS", "year": 2023}]
        },
        {
            "id": "cand-12",
            "name": "Jordan Reed",
            "email": "jordan.reed@email.com",
            "location": "Tacoma, WA",
            "years": 1.0,
            "target_job": "job-4",
            "skills": ["Linux", "Bash", "Git", "Docker"],
            "education": [{"degree": "Associate Degree", "field_of_study": "Network Administration", "institution": "Seattle Central College", "year": 2023}],
            "experience": [{"company": "IT Support Services", "job_title": "Systems Administrator", "duration_months": 12, "technologies": ["Linux", "Docker"]}],
            "projects": [{"title": "Home Lab Container Cluster", "description": "Configured local Docker containers and reverse proxies.", "technologies": ["Docker", "Linux"]}],
            "certifications": []
        },

        # Match for Job 5: Business Intelligence Analyst
        {
            "id": "cand-13",
            "name": "Rachel Sterling",
            "email": "rachel.sterling@email.com",
            "location": "Chicago, IL",
            "years": 3.0,
            "target_job": "job-5",
            "skills": ["SQL", "Power BI", "Communication", "Data Visualization", "Problem Solving", "Tableau", "Financial Modeling"],
            "education": [{"degree": "Bachelor of Science", "field_of_study": "Finance & Analytics", "institution": "Northwestern University", "year": 2021}],
            "experience": [{"company": "Midwest Financial Partners", "job_title": "BI Specialist", "duration_months": 36, "technologies": ["SQL", "Power BI", "Financial Modeling"]}],
            "projects": [{"title": "Portfolio Risk KPI Dashboard", "description": "Built live executive reports tracking $50M asset portfolio metrics in Power BI.", "technologies": ["SQL", "Power BI"]}],
            "certifications": [{"name": "Microsoft Power BI Data Analyst", "issuer": "Microsoft", "year": 2022}]
        },
        {
            "id": "cand-14",
            "name": "Vikram Sethi",
            "email": "vikram.sethi@email.com",
            "location": "Evanston, IL",
            "years": 2.0,
            "target_job": "job-5",
            "skills": ["SQL", "Power BI", "Communication", "Excel"],
            "education": [{"degree": "Bachelor of Business Administration", "field_of_study": "Information Systems", "institution": "University of Illinois", "year": 2022}],
            "experience": [{"company": "Lakeshore Analytics", "job_title": "Operations Analyst", "duration_months": 24, "technologies": ["SQL", "Power BI"]}],
            "projects": [{"title": "Departmental Budget Tracker", "description": "Generated automated monthly performance reports for management.", "technologies": ["SQL", "Power BI"]}],
            "certifications": []
        },
        {
            "id": "cand-15",
            "name": "Emily Watson",
            "email": "emily.watson@email.com",
            "location": "Naperville, IL",
            "years": 0.8,
            "target_job": "job-5",
            "skills": ["Excel", "Communication", "Problem Solving"],
            "education": [{"degree": "Bachelor of Arts", "field_of_study": "Communications", "institution": "Loyola University Chicago", "year": 2024}],
            "experience": [{"company": "Retail Group", "job_title": "Sales Coordinator", "duration_months": 10, "technologies": ["Excel"]}],
            "projects": [{"title": "Customer Feedback Digest", "description": "Survey compilation and trend reports.", "technologies": ["Excel"]}],
            "certifications": []
        }
    ]

    for c_data in candidates_data:
        existing_cand = db.query(Candidate).filter(Candidate.id == c_data["id"]).first()
        parsed_profile = {
            "personal_info": {
                "name": c_data["name"],
                "email": c_data["email"],
                "location": c_data["location"],
                "linkedin": f"https://linkedin.com/in/{c_data['id']}",
                "github": f"https://github.com/{c_data['id']}"
            },
            "summary": f"Experienced professional in {', '.join(c_data['skills'][:4])} with {c_data['years']} years of industry background.",
            "skills": [{"name": s, "category": "technical"} for s in c_data["skills"]],
            "experience": c_data["experience"],
            "education": c_data["education"],
            "projects": c_data["projects"],
            "certifications": c_data["certifications"]
        }
        
        raw_cv_text = f"""
        {c_data['name']} - {c_data['email']} - {c_data['location']}
        SUMMARY: Professional with {c_data['years']} years experience in {', '.join(c_data['skills'])}.
        EDUCATION: {c_data['education'][0]['degree']} in {c_data['education'][0].get('field_of_study', '')} from {c_data['education'][0]['institution']}.
        SKILLS: {', '.join(c_data['skills'])}
        EXPERIENCE: {c_data['experience'][0]['job_title']} at {c_data['experience'][0]['company']}.
        PROJECTS: {c_data['projects'][0]['title']} - {c_data['projects'][0]['description']}
        """

        if not existing_cand:
            cand = Candidate(
                id=c_data["id"],
                full_name=c_data["name"],
                email=c_data["email"],
                location=c_data["location"],
                linkedin=f"https://linkedin.com/in/{c_data['id']}",
                github=f"https://github.com/{c_data['id']}",
                total_experience_years=c_data["years"],
                parsed_data=parsed_profile
            )
            db.add(cand)
            db.commit()

            # Create Resume
            res = Resume(
                id=f"resume-{c_data['id']}",
                candidate_id=cand.id,
                filename=f"{c_data['name'].replace(' ', '_')}_Resume.pdf",
                file_path=f"uploads/{c_data['id']}_resume.pdf",
                file_type="pdf",
                file_size=1024 * 128,
                raw_text=raw_cv_text,
                parsed_sections=parsed_profile,
                quality_score=round(75.0 + min(25.0, c_data['years'] * 5), 1),
                ats_score=round(80.0 + min(18.0, len(c_data['skills']) * 2), 1),
                improvement_suggestions=[
                    "Consider incorporating quantifiable revenue impact metrics into your project descriptions.",
                    "Highlight recent cloud or container orchestration certifications to boost ATS ranking."
                ],
                is_processed=True
            )
            db.add(res)
            db.commit()

            # Create Application
            app = Application(
                id=f"app-{c_data['id']}",
                candidate_id=cand.id,
                job_id=c_data["target_job"],
                resume_id=res.id,
                status="screening"
            )
            db.add(app)
            db.commit()

            # Automatically run screening
            try:
                analyze_candidate(db, app.id)
            except Exception as e:
                print(f"Analysis error for {cand.full_name}: {e}")

    print("Seed complete! Database has been populated with 5 jobs, 15 candidates, applications, and AI screening results.")
    db.close()

if __name__ == "__main__":
    seed()
