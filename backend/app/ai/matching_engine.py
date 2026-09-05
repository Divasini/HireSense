import numpy as np
from app.ai.model_manager import ModelManager
from app.ai.skill_extractor import SKILL_ALIASES

def compute_semantic_similarity(text1: str, text2: str) -> float:
    if not text1 or not text2:
        return 0.0
    embedder = ModelManager().get_embedder()
    embeddings = embedder.encode([text1, text2])
    sim = np.dot(embeddings[0], embeddings[1]) / (np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]))
    return float(max(0.0, min(1.0, sim)))

def compute_skill_match(candidate_skills: list, required_skills: list, preferred_skills: list) -> dict:
    cand_names = set()
    for s in (candidate_skills or []):
        if isinstance(s, dict):
            cand_names.add(s.get('name', '').lower())
        elif isinstance(s, str):
            cand_names.add(s.lower())
            
    # Add aliases
    for s in list(cand_names):
        if s:
            cand_names.add(SKILL_ALIASES.get(s, s).lower())
        
    req_names = set([s.lower() for s in required_skills])
    pref_names = set([s.lower() for s in preferred_skills])
    
    matched_req = [s for s in required_skills if s.lower() in cand_names or SKILL_ALIASES.get(s.lower(), s.lower()) in cand_names]
    missing_req = [s for s in required_skills if s not in matched_req]
    
    matched_pref = [s for s in preferred_skills if s.lower() in cand_names or SKILL_ALIASES.get(s.lower(), s.lower()) in cand_names]
    missing_pref = [s for s in preferred_skills if s not in matched_pref]
    
    total_req = len(required_skills)
    total_pref = len(preferred_skills)
    
    score = 0.0
    if total_req > 0:
        score += (len(matched_req) / total_req) * 80
    else:
        score += 80
        
    if total_pref > 0:
        score += (len(matched_pref) / total_pref) * 20
    else:
        score += 20
        
    return {
        'score': score,
        'matched_required': matched_req,
        'missing_required': missing_req,
        'matched_preferred': matched_pref,
        'missing_preferred': missing_pref,
        'coverage_percentage': (len(matched_req) + len(matched_pref)) / max(1, total_req + total_pref) * 100
    }

def compute_experience_match(candidate_experience: list, required_experience: str, job_description: str) -> dict:
    total_years = 0.0
    for exp in candidate_experience:
        total_years += exp.get('duration_months', 0) / 12.0
    
    req_years = 0.0
    import re
    if required_experience:
        match = re.search(r'(\d+)', required_experience)
        if match:
            req_years = float(match.group(1))
            
    meets = total_years >= req_years
    score = min(100.0, (total_years / max(req_years, 1.0)) * 100.0) if req_years > 0 else 100.0
    
    return {
        'score': score,
        'total_years': total_years,
        'relevant_years': total_years,
        'required_years': req_years,
        'meets_requirement': meets,
        'relevant_technologies': [],
        'relevance_explanation': "Experience match computed."
    }

def compute_education_match(candidate_education: list, required_education: str) -> dict:
    if not candidate_education:
        return {
            'score': 65.0 if not required_education else 45.0,
            'candidate_education': "No formal degree listed",
            'required_education': required_education or "Not specified",
            'meets_requirement': not bool(required_education),
            'explanation': "No formal academic qualifications detected in resume."
        }
    
    degree_hierarchy = {
        'phd': 4, 'ph.d': 4, 'doctorate': 4, 'doctor': 4,
        'master': 3, 'ms': 3, 'm.s': 3, 'mba': 3, 'msc': 3, 'm.tech': 3, 'mtech': 3,
        'bachelor': 2, 'bs': 2, 'b.s': 2, 'ba': 2, 'b.a': 2, 'btech': 2, 'b.tech': 2, 'be': 2, 'b.e': 2,
        'associate': 1, 'diploma': 1
    }
    
    candidate_highest_level = 2
    degree_names = []
    
    for edu in candidate_education:
        deg = str(edu.get('degree', '')).lower()
        field = str(edu.get('field_of_study', '')).lower()
        inst = str(edu.get('institution', ''))
        deg_str = f"{edu.get('degree', '')} in {edu.get('field_of_study', '')}" if edu.get('field_of_study') else edu.get('degree', '')
        if inst:
            deg_str += f" ({inst})"
        degree_names.append(deg_str)
        
        for k, level in degree_hierarchy.items():
            if k in deg:
                if level > candidate_highest_level:
                    candidate_highest_level = level
                    
    req_level = 2
    req_lower = (required_education or "").lower()
    for k, level in degree_hierarchy.items():
        if k in req_lower:
            req_level = level
            break
            
    meets = candidate_highest_level >= req_level
    if candidate_highest_level > req_level:
        score = 100.0
    elif candidate_highest_level == req_level:
        score = 90.0
    else:
        score = 65.0
        
    cand_edu_display = ", ".join(degree_names) if degree_names else "Degree parsed"
    return {
        'score': score,
        'candidate_education': cand_edu_display,
        'required_education': required_education or "Bachelor's Degree",
        'meets_requirement': meets,
        'explanation': f"Candidate holds {cand_edu_display}, which {'satisfies' if meets else 'is below'} the required {required_education or 'standard'} degree level."
    }

def compute_project_relevance(candidate_projects: list, job_description: str) -> dict:
    if not candidate_projects:
        return {
            'score': 50.0,
            'relevant_projects': [],
            'explanation': "No explicit portfolio projects extracted from candidate document."
        }
        
    if not job_description:
        return {
            'score': 85.0,
            'relevant_projects': [p.get('title', 'Project') for p in candidate_projects],
            'explanation': f"Candidate lists {len(candidate_projects)} project(s) demonstrating technical initiative."
        }
        
    scored_projects = []
    total_sim = 0.0
    
    for p in candidate_projects:
        title = p.get('title', '')
        desc = p.get('description', '')
        techs = " ".join(p.get('technologies', []))
        proj_text = f"{title}. {desc}. Technologies: {techs}"
        
        sim = compute_semantic_similarity(proj_text, job_description)
        # Scale similarity (typical sentence transformer cosine sim between job and project is 0.3 to 0.8)
        scaled_score = min(100.0, max(40.0, sim * 125.0))
        total_sim += scaled_score
        
        scored_projects.append({
            'title': title or 'Key Technical Project',
            'description': desc,
            'technologies': p.get('technologies', []),
            'relevance_score': round(scaled_score, 1)
        })
        
    avg_score = round(total_sim / max(1, len(candidate_projects)), 1)
    
    return {
        'score': min(100.0, avg_score),
        'relevant_projects': scored_projects,
        'explanation': f"Analyzed {len(candidate_projects)} project(s) with an average semantic relevance of {avg_score}% to the job description."
    }

def compute_certification_match(candidate_certs: list, required_certs: list) -> dict:
    if not required_certs:
        # If no specific cert is required, having certs grants a bonus (85 - 100)
        has_certs = len(candidate_certs) > 0
        return {
            'score': 95.0 if has_certs else 80.0,
            'matched': [c.get('name') if isinstance(c, dict) else str(c) for c in candidate_certs],
            'missing': [],
            'explanation': f"{len(candidate_certs)} professional certification(s) verified." if has_certs else "No mandatory certifications required for this position."
        }
        
    cand_cert_names = [c.get('name', '').lower() if isinstance(c, dict) else str(c).lower() for c in candidate_certs]
    matched = []
    missing = []
    
    for req in required_certs:
        req_clean = req.lower()
        found = False
        for c in cand_cert_names:
            if req_clean in c or c in req_clean:
                found = True
                break
        if found:
            matched.append(req)
        else:
            missing.append(req)
            
    score = (len(matched) / max(1, len(required_certs))) * 100.0
    return {
        'score': round(score, 1),
        'matched': matched,
        'missing': missing,
        'explanation': f"Candidate holds {len(matched)} of {len(required_certs)} required certifications."
    }
