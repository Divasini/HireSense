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
    # Background warm-up
    import threading
    def load():
        from app.ai.model_manager import ModelManager
        ModelManager().get_nlp()
        ModelManager().get_embedder()
    threading.Thread(target=load).start()

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
