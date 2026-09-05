import re
from typing import Dict, Any
from app.ai.skill_extractor import extract_skills

def analyze_job_description(text: str) -> Dict[str, Any]:
    skills = extract_skills(text)
    
    required = []
    preferred = []
    
    for skill in skills:
        # Simplistic logic: assign randomly or by frequency for now. 
        # In a real app we'd look for proximity to "preferred" or "required"
        required.append(skill['name'])
        
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)', text, re.IGNORECASE)
    required_experience = f"{exp_match.group(1)} years" if exp_match else ""
    
    ed_match = re.search(r'(Bachelor|Master|PhD|MBA|B\.?S\.?|M\.?S\.?)', text, re.IGNORECASE)
    required_education = ed_match.group(0) if ed_match else ""
    
    return {
        'title': 'Extracted Title',
        'required_skills': required,
        'preferred_skills': preferred,
        'required_experience': required_experience,
        'required_education': required_education,
        'responsibilities': [],
        'technical_requirements': [],
        'soft_skills': [],
        'certifications': []
    }
