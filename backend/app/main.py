import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.middleware import setup_middlewares
from app.database import engine, Base
from app.config import settings

# Import routers
from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.resumes import router as resumes_router
from app.api.screening import router as screening_router
from app.api.candidates import router as candidates_router
from app.api.analytics import router as analytics_router
from app.api.notifications import router as notifications_router
from app.api.admin import router as admin_router
from app.api.export import router as export_router
from app.api.users import router as users_router

app = FastAPI(
    title="HireSense AI API",
    description="HireSense AI — Smarter Screening. Better Hiring. Production-grade AI Recruitment Engine",
    version="3.0.0"
)

setup_middlewares(app)

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(resumes_router)
app.include_router(screening_router)
app.include_router(candidates_router)
app.include_router(analytics_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(export_router)
app.include_router(users_router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Initialize baseline administrative & recruiter accounts if missing
    try:
        from app.database import SessionLocal
        from app.models.user import User
        from app.core.security import hash_password
        from sqlalchemy import func

        with SessionLocal() as db:
            staff_accounts = [
                {
                    "id": "admin-1",
                    "email": "admin@recruitment.ai",
                    "password_hash": hash_password("admin123"),
                    "full_name": "System Administrator",
                    "role": "admin"
                },
                {
                    "id": "recruiter-1",
                    "email": "recruiter@recruitment.ai",
                    "password_hash": hash_password("recruiter123"),
                    "full_name": "Alex Morgan",
                    "role": "recruiter"
                }
            ]
            for staff in staff_accounts:
                norm_email = staff["email"].strip().lower()
                existing = db.query(User).filter(func.lower(User.email) == norm_email).first()
                if not existing:
                    user = User(
                        id=staff["id"],
                        email=norm_email,
                        password_hash=staff["password_hash"],
                        full_name=staff["full_name"],
                        role=staff["role"]
                    )
                    db.add(user)
            db.commit()
    except Exception as e:
        print(f"Notice: Staff account initialization check: {e}")

    # Heavy AI models are strictly lazy-loaded on-demand to maintain < 512MB RAM on Render
    # No startup pre-warming thread to prevent startup OOM crashes

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "HireSense AI Engine",
        "tagline": "Smarter Screening. Better Hiring.",
        "version": "3.0.0",
        "theme": "Obsidian Intelligence"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
