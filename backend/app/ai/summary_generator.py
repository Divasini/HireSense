def generate_candidate_summary(parsed_resume: dict, screening_result: dict) -> str:
    if not parsed_resume:
        return "Candidate profile processed. Evaluated against active job requirements."
        
    skills = [s['name'] if isinstance(s, dict) else str(s) for s in parsed_resume.get('skills', [])]
    matched = screening_result.get('matched_skills', []) if isinstance(screening_result, dict) else []
    missing = screening_result.get('missing_skills', []) if isinstance(screening_result, dict) else []
    score = screening_result.get('overall_score', 75.0) if isinstance(screening_result, dict) else 75.0
    
    matched_str = ", ".join(matched[:4]) if matched else (", ".join(skills[:4]) if skills else "relevant competencies")
    missing_str = ", ".join(missing[:3]) if missing else ""
    
    parts = []
    if score >= 85:
        parts.append(f"Outstanding qualification profile with high proficiency in {matched_str}.")
    elif score >= 70:
        parts.append(f"Strong technical alignment demonstrating solid capability across {matched_str}.")
    elif score >= 55:
        parts.append(f"Moderate match candidate with foundational competencies in {matched_str}.")
    else:
        parts.append(f"Candidate exhibits baseline technical qualifications in {matched_str}.")
        
    if missing_str:
        parts.append(f"The candidate satisfies key criteria but lacks experience in {missing_str}.")
    else:
        parts.append("Satisfies mandatory and preferred skill requirements comprehensively.")
        
    exp = parsed_resume.get('experience', [])
    if exp:
        years = sum(e.get('duration_months', 0) for e in exp) / 12.0
        if years > 0:
            parts.append(f"Brings approximately {years:.1f} years of relevant industry experience.")
            
    return " ".join(parts)

def generate_improvement_suggestions(parsed_resume: dict, screening_result: dict) -> list:
    suggestions = []
    missing = screening_result.get('missing_skills', []) if isinstance(screening_result, dict) else []
    if missing:
        suggestions.append(f"Highlight hands-on project experience with {', '.join(missing[:3])}.")
        
    skills = parsed_resume.get('skills', [])
    if len(skills) < 6:
        suggestions.append("Enrich the technical skills section with programming languages, tools, and domain frameworks.")
        
    projects = parsed_resume.get('projects', [])
    if len(projects) == 0:
        suggestions.append("Add 1-2 representative portfolio projects with clear architectural details.")
    else:
        suggestions.append("Include quantifiable achievements (e.g., latency reduction, cost savings, user growth).")
        
    certs = parsed_resume.get('certifications', [])
    if not certs:
        suggestions.append("Add verified cloud or role-specific professional certifications.")
        
    return suggestions or ["Resume exhibits great structural and content quality."]

