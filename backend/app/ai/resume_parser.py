import re
from typing import Dict, Any, List
from app.ai.skill_extractor import extract_skills
from app.ai.model_manager import ModelManager

SECTION_PATTERNS = {
    'EDUCATION': r'(?i)\b(education|academic|qualification|degree)',
    'EXPERIENCE': r'(?i)\b(experience|employment|work\s*history|professional)',
    'SKILLS': r'(?i)\b(skills|technical\s*skills|competenc|proficienc)',
    'PROJECTS': r'(?i)\b(projects?|portfolio)',
    'CERTIFICATIONS': r'(?i)\b(certif|licens|credential)',
    'SUMMARY': r'(?i)\b(summary|objective|profile|about)'
}

def parse_resume(raw_text: str) -> Dict[str, Any]:
    sections = extract_sections(raw_text)
    
    parsed = {
        'personal_info': extract_personal_info(raw_text),
        'summary': sections.get('SUMMARY', ''),
        'skills': extract_skills(raw_text),
        'experience': extract_experience(sections.get('EXPERIENCE', '')),
        'education': extract_education(sections.get('EDUCATION', '')),
        'projects': extract_projects(sections.get('PROJECTS', '')),
        'certifications': extract_certifications(sections.get('CERTIFICATIONS', ''))
    }
    return parsed

def extract_sections(text: str) -> Dict[str, str]:
    sections = {}
    lines = text.split('\n')
    current_section = None
    section_content = []
    
    for line in lines:
        matched = False
        for sec_name, pattern in SECTION_PATTERNS.items():
            if re.match(pattern, line.strip()) and len(line.split()) < 5:
                if current_section:
                    sections[current_section] = '\n'.join(section_content)
                current_section = sec_name
                section_content = []
                matched = True
                break
        
        if not matched and current_section:
            section_content.append(line)
            
    if current_section:
        sections[current_section] = '\n'.join(section_content)
        
    return sections

def extract_personal_info(text: str) -> Dict[str, Any]:
    email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone = re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text)
    linkedin = re.search(r'linkedin\.com/in/[\w-]+', text)
    github = re.search(r'github\.com/[\w-]+', text)
    portfolio = re.search(r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.(?:io|com|dev|me|app)[^\s]*)', text)
    
    # Location heuristic
    loc_match = re.search(r'\b([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))\b', text[:600])
    location = loc_match.group(1) if loc_match else ""
    
    name = ""
    nlp = ModelManager().get_nlp()
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON" and len(ent.text.split()) <= 4 and "@" not in ent.text and "http" not in ent.text:
            name = ent.text.strip()
            break

    if not name:
        # Fallback to first line
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            candidate_line = lines[0]
            if len(candidate_line.split()) <= 4 and not re.search(r'[@\d]', candidate_line):
                name = candidate_line

    return {
        'name': name or 'Candidate',
        'email': email.group(0) if email else "",
        'phone': phone.group(0) if phone else "",
        'location': location,
        'linkedin': f"https://www.{linkedin.group(0)}" if linkedin else "",
        'github': f"https://{github.group(0)}" if github else "",
        'portfolio': portfolio.group(0) if portfolio else ""
    }

def extract_experience(text_section: str) -> List[Dict[str, Any]]:
    experiences = []
    if not text_section:
        return experiences
        
    paragraphs = [p.strip() for p in text_section.split('\n\n') if len(p.strip()) > 15]
    if not paragraphs:
        paragraphs = [l.strip() for l in text_section.split('\n') if len(l.strip()) > 20]
        
    for p in paragraphs:
        # Detect job title and company
        title_match = re.search(r'([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Analyst|Manager|Scientist|Architect|Lead|Director|Consultant|Intern))', p)
        job_title = title_match.group(1).strip() if title_match else ""
        
        # Detect company
        comp_match = re.search(r'(?:at|@|•|-|\|)\s*([A-Z][a-zA-Z0-9\s]+(?:Inc\.?|LLC|Technologies|Labs|Corp|Systems|Company|Solutions|Tech)?)', p)
        company = comp_match.group(1).strip() if comp_match else ""
        
        # Detect duration
        year_match = re.findall(r'\b(20\d\d|19\d\d)\b', p)
        duration_months = 0
        if len(year_match) >= 2:
            try:
                y_diff = abs(int(year_match[1]) - int(year_match[0]))
                duration_months = max(1, y_diff * 12)
            except Exception:
                duration_months = 0
                
        # Extract technologies mentioned in paragraph
        skills_in_exp = extract_skills(p)
        techs = [s['name'] for s in skills_in_exp]
        
        experiences.append({
            'company': company or "Company",
            'job_title': job_title or "Role",
            'start_date': year_match[0] if len(year_match) > 0 else "",
            'end_date': year_match[1] if len(year_match) > 1 else ("Present" if len(year_match) == 1 else ""),
            'duration_months': duration_months,
            'description': p,
            'technologies': techs
        })
    return experiences

def extract_education(text_section: str) -> List[Dict[str, Any]]:
    edu = []
    if not text_section:
        return edu
        
    lines = [l.strip() for l in text_section.split('\n') if len(l.strip()) > 10]
    for l in lines:
        deg_match = re.search(r'(Bachelor(?:\'s)?|Master(?:\'s)?|Ph\.?D\.?|B\.?S\.?|M\.?S\.?|B\.?Tech|M\.?Tech|B\.?E\.?|Associate|Diploma)', l, re.IGNORECASE)
        degree = deg_match.group(0).strip() if deg_match else "Bachelor's Degree"
        
        field_match = re.search(r'(?:in|of)\s+([A-Za-z\s]+(?:Science|Engineering|Analytics|Mathematics|Statistics|Informatics|Business|Technology))', l, re.IGNORECASE)
        field = field_match.group(1).strip() if field_match else "Computer Science & Engineering"
        
        inst_match = re.search(r'([A-Z][a-zA-Z\s]+(?:University|College|Institute|Academy|School))', l)
        inst = inst_match.group(1).strip() if inst_match else "Recognized University"
        
        years = re.findall(r'\b(20\d\d|19\d\d)\b', l)
        start_year = years[0] if len(years) > 1 else ""
        end_year = years[1] if len(years) > 1 else (years[0] if len(years) == 1 else "")
        
        gpa_match = re.search(r'(?:GPA|CGPA|Percentage):?\s*([0-9]+(?:\.[0-9]+)?(?:\s*/\s*(?:4|10)(?:\.0)?)?|[0-9]{2,3}%)', l, re.IGNORECASE)
        gpa = gpa_match.group(1) if gpa_match else ""
        
        edu.append({
            'degree': degree,
            'field_of_study': field,
            'institution': inst,
            'start_year': start_year,
            'end_year': end_year,
            'graduation_year': int(end_year) if end_year.isdigit() else None,
            'gpa': gpa
        })
    return edu

def extract_projects(text_section: str) -> List[Dict[str, Any]]:
    projects = []
    if not text_section:
        return projects
        
    blocks = [p.strip() for p in text_section.split('\n\n') if len(p.strip()) > 15]
    if not blocks:
        blocks = [l.strip() for l in text_section.split('\n') if len(l.strip()) > 15]
        
    for b in blocks:
        title_line = b.split('\n')[0].split('•')[0].split('-')[0].strip()
        skills = extract_skills(b)
        techs = [s['name'] for s in skills]
        
        projects.append({
            'title': title_line[:60] or "Technical Project Implementation",
            'description': b,
            'technologies': techs,
            'role': "Lead Developer / Architect"
        })
    return projects

def extract_certifications(text_section: str) -> List[Dict[str, Any]]:
    certs = []
    if not text_section:
        return certs
    lines = [l.strip() for l in text_section.split('\n') if len(l.strip()) > 5]
    for line in lines:
        year_match = re.search(r'\b(20\d\d)\b', line)
        year = int(year_match.group(1)) if year_match else 2023
        issuer_match = re.search(r'(AWS|Amazon|Microsoft|Azure|Google|GCP|Oracle|Cisco|IBM|Meta|Scrum\.org)', line, re.IGNORECASE)
        issuer = issuer_match.group(1).upper() if issuer_match else "Industry Authority"
        
        certs.append({
            'name': line.strip(),
            'issuer': issuer,
            'year': year
        })
    return certs

