# 🌲 HireSense AI — Smarter Screening. Better Hiring.

A high-efficiency, production-ready AI-powered recruitment and resume screening platform styled in the **Obsidian Intelligence** aesthetic.

HireSense AI automates the complete talent acquisition lifecycle:
**Job Description Analysis → Batch Resume Parsing → 500+ Skills NER Extraction → Vector Semantic Similarity → Multi-Factor Explainable Scoring → Candidate Ranking → Skill Gap Analytics → What-If Simulation → Tailored Interview Question Generation → Global Recruitment Intelligence.**

---

## 🎨 Theme & Brand Design: Obsidian Intelligence

HireSense AI is designed with an **Obsidian Intelligence** theme for modern enterprise intelligence:
- **Primary Background**: Deep Obsidian (`#0D1110`)
- **Secondary Surfaces**: Charcoal Forest (`#151C19`) / Elevated Surface (`#1C2421`)
- **Primary Accent**: Rich Emerald (`#00B894`)
- **Secondary Accent**: Champagne Gold (`#E8C97A`) — reserved for Rank #1 highlights, top scores, and winner badges
- **Supporting Accent**: Soft Sage (`#8FB9A8`) / Muted Sage Gray (`#AAB8B1`)
- **Primary Typography**: Warm White (`#F5F3EA`)
- **Alerts**: Warm Amber (`#F39C12`) & Muted Coral (`#E17055`)

---

## 🌟 Core System Features

### 1. Dual-Layer AI / NLP Matching Engine
- **Entity Extraction**: Custom spaCy EntityRuler loaded with a 500+ Canonical Skills Taxonomy across 7 categories (Programming, Frameworks, Databases, Cloud & DevOps, Data Science & ML, Tools, Soft Skills) with comprehensive alias resolution.
- **Dense Vector Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` generating 384-dimensional contextual embeddings with Cosine Similarity scoring.
- **Fallback Engine**: Zero-lag TF-IDF / Scikit-learn cosine similarity fallback ensuring high availability.

### 2. Explainable AI (XAI) Scoring Engine
- Multi-component weighted scoring formula:
  - **Skills Match (40%)**
  - **Experience Relevance (25%)**
  - **Education Alignment (15%)**
  - **Project Relevance (10%)**
  - **Certifications (10%)**
- Recruiter-controlled weight sliders with dynamic real-time candidate score recalculation.
- Transparent AI summary explanations for every candidate evaluation.

### 3. Interactive What-If Scenario Simulator
- Test changes to mandatory skills, preferred skills, required experience, or education.
- Instant calculation of score deltas (Δ), updated component breakdowns, and AI impact explanations before altering live job requisitions.

### 4. Side-by-Side Candidate Comparison
- Compare multiple shortlisted candidates side by side.
- Visual component score bars, skill gap matrices, and **Champagne Gold** winner indicators for top performers.

### 5. Personalized AI Interview Questionnaire Generator
- Automatically creates tailored **Technical**, **Project-Specific**, **Behavioral**, and **HR** questions based on each candidate's extracted projects and detected skill gaps.
- Integrated printable questionnaire layout.

### 6. Candidate Self-Service & ATS Readability
- **Resume Quality Score (0–100)**: Evaluates document completeness, section headers, and keyword density.
- **ATS Compatibility Checker (92%+ benchmark)**: Validates single-column format, font clarity, contact regex, and machine readability.
- **AI Job Recommendations**: Semantic matching of candidate profiles against open requisitions.

### 7. Global Analytics & Enterprise Audit Trail
- Score distribution histograms, skill demand analytics, recruitment conversion funnels, and CSV/Excel/PDF export engine.
- Immutable audit ledger recording all screening runs and recruiter decisions for governance and compliance.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Zustand, Radix UI Primitives |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | Relational Database (18 Normalized Models, SQLite / PostgreSQL compatible) |
| **AI / NLP** | spaCy, Sentence-Transformers, Scikit-learn, PyMuPDF (fitz), python-docx |
| **Auth & Security** | JWT Bearer (HS256), Argon2id password hashing, Role-Based Access Control (RBAC) |

---

## ⚡ Quick Start Guide

### 1. Backend Service
```bash
cd ai-recruitment-system/backend

# Install dependencies
python -m pip install -r requirements.txt

# Seed database with 5 jobs, 15 candidates, and pre-calculated screening scores
python seed_data.py

# Start FastAPI server (runs at http://127.0.0.1:8000)
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Application
```bash
cd ai-recruitment-system/frontend

# Install dependencies
npm install

# Start development server (runs at http://localhost:5173)
npm run dev

# Production build verification
npm run build
```

---

## 🔑 Staff Access Credentials

| Role | Email | Password | Direct Portal |
| :--- | :--- | :--- | :--- |
| **Recruiter** | `recruiter@recruitment.ai` | `recruiter123` | `/recruiter` |
| **Admin** | `admin@recruitment.ai` | `admin123` | `/admin` |

*(Candidates register their own individual accounts via the `/register` portal with immediate access to their candidate dashboard).*

---

## 📊 Benchmark Jobs Included

1. **Senior Data Analyst** — *Apex Analytics Inc.*
2. **Full Stack Developer** — *CloudScale Technologies*
3. **Machine Learning Engineer** — *Cognitive AI Labs*
4. **DevOps & Cloud Engineer** — *SkyHigh Cloud Services*
5. **Business Intelligence Analyst** — *Midwest Financial Partners*
