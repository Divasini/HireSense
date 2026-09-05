from app.ai.matching_engine import compute_skill_match, compute_experience_match, compute_education_match, compute_project_relevance, compute_certification_match
from app.ai.scoring_engine import calculate_overall_score

def recommend_jobs_for_candidate(candidate_skills: list, candidate_experience: list, all_jobs: list, candidate_education: list = None, candidate_projects: list = None) -> list:
    if not all_jobs:
        return []
    
    results = []
    default_weights = {
        'skills_weight': 0.40,
        'experience_weight': 0.25,
        'education_weight': 0.15,
        'project_weight': 0.10,
        'certification_weight': 0.10
    }
    
    cand_skills_normalized = []
    for s in candidate_skills:
        if isinstance(s, dict):
            cand_skills_normalized.append(s)
        elif isinstance(s, str):
            cand_skills_normalized.append({'name': s, 'category': 'general'})
            
    for j in all_jobs:
        if hasattr(j, 'status') and j.status != 'active':
            continue
            
        req_skills = j.required_skills if hasattr(j, 'required_skills') and j.required_skills else []
        pref_skills = j.preferred_skills if hasattr(j, 'preferred_skills') and j.preferred_skills else []
        exp_req = j.experience_required if hasattr(j, 'experience_required') and j.experience_required else "0"
        desc = j.description if hasattr(j, 'description') and j.description else ""
        edu_req = j.required_education if hasattr(j, 'required_education') and j.required_education else ""
        
        # Compute components
        skill_res = compute_skill_match(cand_skills_normalized, req_skills, pref_skills)
        exp_res = compute_experience_match(candidate_experience or [], exp_req, desc)
        edu_res = compute_education_match(candidate_education or [], edu_req)
        proj_res = compute_project_relevance(candidate_projects or [], desc)
        cert_res = compute_certification_match([], [])
        
        overall = calculate_overall_score(skill_res, exp_res, edu_res, proj_res, cert_res, default_weights)
        
        # Build explanation
        matched_str = ", ".join(skill_res['matched_required'][:3] + skill_res['matched_preferred'][:2])
        if matched_str:
            explanation = f"Matches {round(overall['overall_score'])}% of requirements with core competencies in {matched_str}."
        elif overall['overall_score'] > 40:
            explanation = f"Moderate match ({round(overall['overall_score'])}%) with transferable technical background."
        else:
            explanation = f"Low match ({round(overall['overall_score'])}%). Consider developing prerequisite skills."
            
        results.append({
            'job_id': j.id if hasattr(j, 'id') else j.get('id'),
            'id': j.id if hasattr(j, 'id') else j.get('id'),
            'title': j.title if hasattr(j, 'title') else j.get('title'),
            'company': j.company if hasattr(j, 'company') else j.get('company'),
            'location': j.location if hasattr(j, 'location') else j.get('location'),
            'employment_type': j.employment_type if hasattr(j, 'employment_type') else j.get('employment_type', 'Full-time'),
            'salary_range': j.salary_range if hasattr(j, 'salary_range') else j.get('salary_range', '$90k - $130k'),
            'experience_required': exp_req,
            'description': desc,
            'responsibilities': j.responsibilities if hasattr(j, 'responsibilities') else j.get('responsibilities', []),
            'required_skills': req_skills,
            'preferred_skills': pref_skills,
            'match_score': round(overall['overall_score'], 1),
            'skills_score': round(skill_res['score'], 1),
            'experience_score': round(exp_res['score'], 1),
            'education_score': round(edu_res['score'], 1),
            'project_score': round(proj_res['score'], 1),
            'matched_skills': skill_res['matched_required'] + skill_res['matched_preferred'],
            'missing_skills': skill_res['missing_required'],
            'explanation': explanation
        })
        
    results.sort(key=lambda x: x['match_score'], reverse=True)
    return results

def match_candidate_to_multiple_jobs(candidate_data: dict, jobs: list) -> list:
    skills = candidate_data.get('skills', [])
    exp = candidate_data.get('experience', [])
    edu = candidate_data.get('education', [])
    projects = candidate_data.get('projects', [])
    return recommend_jobs_for_candidate(skills, exp, jobs, edu, projects)
