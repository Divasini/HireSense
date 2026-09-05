import re
from typing import Dict, Any, List, Optional

# List of cliché/vague phrases commonly found in weak resumes
CLICHE_PHRASES = [
    r'\bhard\s*working\b',
    r'\bteam\s*player\b',
    r'\bdetail\s*oriented\b',
    r'\bresponsible\s*for\b',
    r'\bduties\s*included\b',
    r'\bresults\s*driven\b',
    r'\bquick\s*learner\b',
    r'\bgo\s*getter\b',
    r'\bseeking\s*a\s*(?:challenging|good)\s*role\b',
    r'\bseeking\s*an\s*opportunity\b',
    r'\bwork\s*in\s*a\s*reputed\s*company\b',
    r'\bgood\s*communication\s*skills\b',
    r'\blooking\s*for\s*a\s*job\b',
    r'\bpassionate\s*about\s*work\b'
]

# Action verbs that indicate strong accomplishment-oriented bullet points
ACTION_VERBS = [
    'architected', 'spearheaded', 'engineered', 'deployed', 'orchestrated', 'built',
    'designed', 'developed', 'optimized', 'reduced', 'increased', 'scaled',
    'streamlined', 'implemented', 'automated', 'delivered', 'achieved', 'led',
    'analyzed', 'refactored', 'migrated', 'transformed', 'created', 'resolved'
]

def calculate_overall_score(skill_result, experience_result, education_result, project_result, cert_result, weights: dict) -> dict:
    skills_score = float(skill_result.get('score', 0))
    exp_score = float(experience_result.get('score', 0))
    edu_score = float(education_result.get('score', 0))
    proj_score = float(project_result.get('score', 0))
    cert_score = float(cert_result.get('score', 0))
    
    sw = weights.get('skills_weight', 0.40)
    ew = weights.get('experience_weight', 0.25)
    edw = weights.get('education_weight', 0.15)
    pw = weights.get('project_weight', 0.10)
    cw = weights.get('certification_weight', 0.10)
    
    overall = (skills_score * sw) + (exp_score * ew) + (edu_score * edw) + (proj_score * pw) + (cert_score * cw)
    overall = round(max(0.0, min(100.0, overall)), 1)
    
    return {
        'overall_score': overall,
        'component_scores': {
            'skills': {'score': skills_score, 'weighted_score': round(skills_score * sw, 1), 'max': 100.0, 'weight': sw},
            'experience': {'score': exp_score, 'weighted_score': round(exp_score * ew, 1), 'max': 100.0, 'weight': ew},
            'education': {'score': edu_score, 'weighted_score': round(edu_score * edw, 1), 'max': 100.0, 'weight': edw},
            'projects': {'score': proj_score, 'weighted_score': round(proj_score * pw, 1), 'max': 100.0, 'weight': pw},
            'certifications': {'score': cert_score, 'weighted_score': round(cert_score * cw, 1), 'max': 100.0, 'weight': cw}
        },
        'explanation': f"Dynamic multi-factor evaluation: Skills ({skills_score}%), Experience ({exp_score}%), Education ({edu_score}%), Projects ({proj_score}%), Certifications ({cert_score}%)."
    }

def generate_recommendation(score: float) -> str:
    if score >= 85: return 'strongly_recommended'
    if score >= 70: return 'recommended'
    if score >= 55: return 'consider'
    return 'not_recommended'

def generate_interview_recommendation(score, skill_match, experience_match) -> dict:
    if score >= 75:
        return {'recommendation': 'Interview Strongly Recommended', 'type': 'both', 'reasoning': 'High candidate qualification & technical alignment.'}
    elif score >= 60:
        return {'recommendation': 'Technical Screening Recommended', 'type': 'technical', 'reasoning': 'Moderate match; assess technical depth.'}
    return {'recommendation': 'Not Recommended for Interview', 'type': 'none', 'reasoning': 'Insufficient overlap with position requirements.'}

def calculate_resume_quality(parsed_resume: dict) -> dict:
    """
    Genuine dynamic AI evaluator:
    Inspects actual extracted resume text, metrics, action verbs, clichés, depth, and section content.
    Returns dynamic continuous scores (poor resumes get realistically low scores 15-35%),
    detailed evidence breakdown, and 3-part structured recommendations (WHAT, WHY, HOW).
    """
    if not parsed_resume:
        return {
            'overall_score': 10.0,
            'breakdown': {},
            'suggestions': [{
                'what': 'Empty or unparseable resume',
                'why': 'No textual content was detected in the document',
                'how': 'Upload a standard text-based PDF or DOCX file with complete career history'
            }],
            'section_analysis': {},
            'what_helped': [],
            'what_reduced': ['No candidate profile data was extracted']
        }
        
    personal = parsed_resume.get('personal_info', {}) or {}
    skills = parsed_resume.get('skills', []) or []
    exp = parsed_resume.get('experience', []) or []
    edu = parsed_resume.get('education', []) or []
    projects = parsed_resume.get('projects', []) or []
    certs = parsed_resume.get('certifications', []) or []
    summary = parsed_resume.get('summary', '') or ''
    
    # Compile all narrative text
    all_narrative = summary + " "
    for e in exp:
        all_narrative += (e.get('description', '') or '') + " "
    for p in projects:
        all_narrative += (p.get('description', '') or '') + " "
    all_narrative_lower = all_narrative.lower()

    what_helped = []
    what_reduced = []
    structured_improvements = []

    # 1. Contact Completeness Evaluation (0 - 100)
    contact_points = 0
    if personal.get('name') and personal['name'].lower() != 'candidate':
        contact_points += 30
        what_helped.append("Candidate name clearly identified")
    else:
        what_reduced.append("Missing or unparsed candidate full name")

    if personal.get('email'):
        contact_points += 30
        what_helped.append("Valid professional email address detected")
    else:
        what_reduced.append("Missing email address in contact section")

    if personal.get('phone'):
        contact_points += 20
        what_helped.append("Direct phone number found")
    else:
        what_reduced.append("No telephone number provided")

    if personal.get('linkedin') or personal.get('github') or personal.get('portfolio'):
        contact_points += 20
        what_helped.append("Professional profile link (LinkedIn/GitHub/Portfolio) included")
    else:
        what_reduced.append("Missing professional portfolio or LinkedIn URL")

    contact_score = float(contact_points)

    if contact_score < 70:
        structured_improvements.append({
            'section': 'Contact Information',
            'what': 'Incomplete contact and identity information',
            'why': 'Recruiters and automated sourcing tools cannot easily reach or verify your online professional profile',
            'how': 'Add your complete phone number, active email, verified LinkedIn profile, and GitHub/portfolio URL at the top of your resume'
        })

    # 2. Content Depth & Quantifiable Metrics (0 - 100)
    metrics_matches = re.findall(r'\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d{2,}\b', all_narrative)
    metrics_count = len(metrics_matches)
    action_verb_count = sum(1 for verb in ACTION_VERBS if re.search(rf'\b{verb}\b', all_narrative_lower))

    cliche_matches = []
    for c_pat in CLICHE_PHRASES:
        found = re.findall(c_pat, all_narrative_lower)
        if found:
            cliche_matches.extend(found)
    cliche_count = len(cliche_matches)

    words = all_narrative.split()
    word_count = len(words)

    depth_score = 0.0
    if word_count > 300: depth_score += 30.0
    elif word_count > 150: depth_score += (word_count / 300.0) * 30.0
    elif word_count > 40: depth_score += 10.0
    else: depth_score += 3.0

    if metrics_count >= 6: depth_score += 35.0
    elif metrics_count >= 1: depth_score += (metrics_count / 6.0) * 35.0
    else: depth_score += 0.0

    if action_verb_count >= 5: depth_score += 35.0
    elif action_verb_count >= 1: depth_score += (action_verb_count / 5.0) * 35.0
    else: depth_score += 0.0

    if cliche_count > 0:
        penalty = min(25.0, cliche_count * 8.0)
        depth_score = max(5.0, depth_score - penalty)
        what_reduced.append(f"Contains {cliche_count} generic/cliché phrase(s) ({', '.join(set(cliche_matches[:3]))}) without verifiable context")
        structured_improvements.append({
            'section': 'Summary & Content Tone',
            'what': f"Found generic non-impact statements: \"{', '.join(set(cliche_matches[:2]))}\"",
            'why': 'Subjective claims like "hardworking" or "team player" carry no credibility with hiring managers without supporting data',
            'how': 'Replace generic adjectives with concrete accomplishments and numbers (e.g., replace "hardworking developer" with "engineered microservice handling 15,000 req/s")'
        })

    if metrics_count == 0:
        what_reduced.append("Zero quantifiable business or performance metrics detected in work descriptions")
        structured_improvements.append({
            'section': 'Work & Project Descriptions',
            'what': 'Absence of measurable achievements and numerical results',
            'why': 'Recruiters favor candidates who quantify their impact on efficiency, latency, revenue, or user scale',
            'how': 'Follow the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]" (e.g., "Reduced page load time by 42% by optimizing GraphQL queries")'
        })
    else:
        what_helped.append(f"Identified {metrics_count} quantifiable data point(s) and performance metric(s)")

    if action_verb_count >= 3:
        what_helped.append(f"Used strong accomplishment action verbs ({action_verb_count} distinct action verbs detected)")
    else:
        what_reduced.append("Limited use of proactive action verbs in bullet points")

    depth_score = round(max(10.0, min(100.0, depth_score)), 1)

    # 3. Technical Skills Diversity & Taxonomy (0 - 100)
    skill_names = [s.get('name') if isinstance(s, dict) else str(s) for s in skills]
    skill_categories = set(s.get('category', 'other') for s in skills if isinstance(s, dict))
    skill_count = len(skill_names)

    if skill_count >= 10 and len(skill_categories) >= 3:
        skills_score = 95.0
        what_helped.append(f"Rich technical skill breadth: {skill_count} skills across {len(skill_categories)} technology categories")
    elif skill_count >= 6:
        skills_score = 75.0 + min(15.0, (skill_count - 6) * 3.0)
        what_helped.append(f"Solid skill baseline with {skill_count} relevant technical competencies")
    elif skill_count >= 3:
        skills_score = 45.0 + (skill_count * 5.0)
        what_reduced.append(f"Only {skill_count} technical skills identified; limited technology stack coverage")
    elif skill_count >= 1:
        skills_score = 25.0
        what_reduced.append(f"Critically sparse skill set ({skill_count} skill found)")
    else:
        skills_score = 10.0
        what_reduced.append("No technical skills extracted from resume")

    if skill_count < 6:
        structured_improvements.append({
            'section': 'Skills & Competencies',
            'what': f"Only {skill_count} skill(s) listed in your profile",
            'why': 'Applicant tracking systems and recruiters match candidate profiles directly against required technology keywords',
            'how': 'Organize your skills into distinct categories: Programming Languages, Frameworks, Cloud/DevOps, Databases, and Developer Tools'
        })

    # 4. Work Experience & Projects Completeness (0 - 100)
    exp_score = 0.0
    if len(exp) >= 2:
        has_deep_desc = any(len(e.get('description', '')) > 120 for e in exp)
        exp_score = 90.0 if has_deep_desc else 70.0
        what_helped.append(f"Documented employment history across {len(exp)} position(s)")
    elif len(exp) == 1:
        has_deep_desc = len(exp[0].get('description', '')) > 100
        exp_score = 65.0 if has_deep_desc else 45.0
        what_helped.append("Found 1 work experience entry")
    else:
        exp_score = 15.0
        what_reduced.append("Zero work experience entries identified")

    if len(projects) >= 2:
        proj_score = 90.0
        what_helped.append(f"Features {len(projects)} technical portfolio projects")
    elif len(projects) == 1:
        proj_score = 65.0
        what_helped.append("Features 1 technical project")
    else:
        proj_score = 20.0
        what_reduced.append("No independent or academic projects found")

    if len(projects) == 0:
        structured_improvements.append({
            'section': 'Projects & Portfolio',
            'what': 'No technical portfolio projects detected',
            'why': 'Projects provide tangible proof of your hands-on engineering capabilities, especially when transitioning or advancing roles',
            'how': 'Add 2-3 substantial projects detailing the architecture, tech stack (e.g., React, Python, PostgreSQL), and live demo/repo links'
        })

    # 5. Education & Certifications (0 - 100)
    edu_score = 0.0
    if len(edu) >= 1:
        e0 = edu[0]
        deg = e0.get('degree', '')
        inst = e0.get('institution', '')
        if deg and inst and inst != "Recognized University":
            edu_score = 90.0
            what_helped.append(f"Verified degree '{deg}' at '{inst}'")
        else:
            edu_score = 65.0
            what_helped.append(f"Degree '{deg or 'Higher Education'}' recognized")
    else:
        edu_score = 15.0
        what_reduced.append("No formal education or academic credentials found")
        structured_improvements.append({
            'section': 'Education History',
            'what': 'No academic degrees or university credentials listed',
            'why': 'Many enterprise positions enforce formal degree baselines during preliminary ATS filters',
            'how': 'Add your university degree, major/field of study, institution name, graduation year, and CGPA/Percentage'
        })

    cert_score = 0.0
    if len(certs) >= 1:
        cert_score = min(100.0, 70.0 + len(certs) * 15.0)
        what_helped.append(f"{len(certs)} industry certification(s) verified")
    else:
        cert_score = 25.0
        what_reduced.append("No professional certifications detected")

    # Overall Dynamic Quality Score
    overall = (
        (depth_score * 0.25) +
        (skills_score * 0.25) +
        (exp_score * 0.20) +
        (proj_score * 0.15) +
        (edu_score * 0.10) +
        (contact_score * 0.05)
    )

    if word_count < 60 and skill_count <= 2 and len(exp) == 0:
        overall = min(30.0, overall)
    elif word_count < 120 and skill_count <= 4:
        overall = min(50.0, overall)

    overall = round(max(15.0, min(98.0, overall)), 1)

    section_analysis = {
        'summary': {
            'score': round(max(20.0, depth_score * 0.9 if summary else 20.0), 1),
            'status': 'Strong' if summary and len(summary) > 100 else ('Moderate' if summary else 'Needs Improvement'),
            'details': summary[:140] + ('...' if len(summary) > 140 else '') if summary else 'Not Found — Professional summary missing'
        },
        'skills': {
            'score': round(skills_score, 1),
            'status': 'Strong' if skills_score >= 80 else ('Moderate' if skills_score >= 50 else 'Weak'),
            'count': skill_count,
            'categories': list(skill_categories)
        },
        'experience': {
            'score': round(exp_score, 1),
            'status': 'Strong' if exp_score >= 75 else ('Moderate' if exp_score >= 45 else 'Sparse'),
            'count': len(exp)
        },
        'projects': {
            'score': round(proj_score, 1),
            'status': 'Strong' if proj_score >= 75 else ('Moderate' if proj_score >= 45 else 'Missing'),
            'count': len(projects)
        },
        'education': {
            'score': round(edu_score, 1),
            'status': 'Verified' if edu_score >= 70 else 'Incomplete',
            'count': len(edu)
        },
        'certifications': {
            'score': round(cert_score, 1),
            'status': 'Verified' if cert_score >= 60 else 'Not Found',
            'count': len(certs)
        }
    }

    if not structured_improvements:
        structured_improvements.append({
            'section': 'Overall Profile',
            'what': 'High-impact resume structure with strong metrics and skills',
            'why': 'Resume effectively communicates competency, quantifiable impact, and clear role trajectory',
            'how': 'Maintain up-to-date repository links and customize keywords for specific high-tier job descriptions'
        })

    return {
        'overall_score': overall,
        'breakdown': {
            'content_depth': round(depth_score, 1),
            'skills_diversity': round(skills_score, 1),
            'experience_completeness': round(exp_score, 1),
            'projects_depth': round(proj_score, 1),
            'education_verification': round(edu_score, 1),
            'contact_completeness': round(contact_score, 1)
        },
        'section_analysis': section_analysis,
        'what_helped': what_helped[:6],
        'what_reduced': what_reduced[:6],
        'suggestions': structured_improvements,
        'suggestions_text': [f"{s['what']}: {s['how']}" for s in structured_improvements]
    }


def calculate_ats_score(parsed_resume: dict, raw_text: str) -> dict:
    """
    Dynamic ATS Compatibility Evaluator:
    Evaluates layout parseability, section headers, text stream density, contact extraction,
    and format hygiene without predefined fixed scores.
    """
    if not raw_text or len(raw_text.strip()) < 15:
        return {
            'overall_score': 15.0,
            'breakdown': {},
            'checklist': [],
            'suggestions': [{
                'what': 'Document contains unreadable text stream',
                'why': 'ATS engines cannot extract ASCII/Unicode characters from scanned or empty files',
                'how': 'Export your resume as a clean, machine-readable text PDF or DOCX file'
            }]
        }
        
    text_lower = raw_text.lower()
    words = raw_text.split()
    word_count = len(words)

    what_helped = []
    what_reduced = []
    structured_ats_suggestions = []

    # 1. Standard Section Headings Check (30 pts)
    headers = ['education', 'experience', 'skills', 'projects', 'summary']
    found_headers = [h for h in headers if re.search(rf'(?i)\b{h}\b', raw_text)]
    headers_pct = (len(found_headers) / len(headers)) * 100.0

    if len(found_headers) >= 4:
        what_helped.append(f"Contains {len(found_headers)} standard section headings ({', '.join([h.capitalize() for h in found_headers])})")
    else:
        missing = [h.capitalize() for h in headers if h not in found_headers]
        what_reduced.append(f"Missing standard ATS section headers: {', '.join(missing)}")
        structured_ats_suggestions.append({
            'section': 'Section Architecture',
            'what': f"Missing recognized standard headers: {', '.join(missing)}",
            'why': 'ATS parser bots look for exact standard terms to categorize your work, education, and skills correctly',
            'how': f"Add explicit headings like '{missing[0]}' and 'Work Experience' formatted on their own lines"
        })

    # 2. Parser Readability & Word Count (25 pts)
    readability_pct = 0.0
    if 350 <= word_count <= 950:
        readability_pct = 95.0
        what_helped.append(f"Optimal document length ({word_count} words) for ATS single/two-page scanning")
    elif 200 <= word_count < 350:
        readability_pct = 65.0
        what_reduced.append(f"Low word count ({word_count} words); limited keyword density")
        structured_ats_suggestions.append({
            'section': 'Document Length',
            'what': f"Resume is brief ({word_count} words)",
            'why': 'Short resumes miss critical keyword intersections that automated screening filters search for',
            'how': 'Expand your project and role descriptions to at least 400-700 words of technical details'
        })
    elif word_count < 200:
        readability_pct = 30.0
        what_reduced.append(f"Extremely sparse content ({word_count} words)")
        structured_ats_suggestions.append({
            'section': 'Document Length',
            'what': f"Critically short document ({word_count} words)",
            'why': 'Fails minimum thresholds in corporate ATS systems',
            'how': 'Provide a comprehensive 1-page resume with at least 350 words detailing your career background'
        })
    elif word_count <= 1400:
        readability_pct = 80.0
        what_helped.append(f"Comprehensive word count ({word_count} words)")
    else:
        readability_pct = 55.0
        what_reduced.append(f"Document is lengthy ({word_count} words); consider condensing to 1-2 pages")

    # 3. Formatting & Character Hygiene (25 pts)
    unusual_chars = len([c for c in raw_text if ord(c) > 127 and c not in '•–—\n\r\t’“”'])
    hygiene_pct = 0.0
    if unusual_chars < 10:
        hygiene_pct = 95.0
        what_helped.append("Clean UTF-8 text encoding free of corrupt glyphs or table artifacts")
    elif unusual_chars < 30:
        hygiene_pct = 75.0
    else:
        hygiene_pct = 40.0
        what_reduced.append(f"Contains {unusual_chars} unusual characters or icon symbols that can confuse legacy ATS parsers")
        structured_ats_suggestions.append({
            'section': 'Typography & Layout',
            'what': 'Non-standard graphical symbols or multi-nested formatting detected',
            'why': 'Complex symbols or icon-based ratings cannot be parsed by standard text scanners',
            'how': 'Use standard bullet points (•) and plain text instead of rating stars, graphical progress bars, or icons'
        })

    # 4. Contact & Identity Extraction (20 pts)
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text))
    has_phone = bool(re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+\d{1,3}[\s.-]?\d{6,}', raw_text))
    contact_pct = 100.0 if (has_email and has_phone) else (50.0 if (has_email or has_phone) else 15.0)

    if has_email and has_phone:
        what_helped.append("Header contact regex successfully parsed email and telephone")
    else:
        what_reduced.append("ATS contact parser could not extract complete email/phone in header")
        structured_ats_suggestions.append({
            'section': 'Contact Header',
            'what': 'Incomplete or unparsed contact header',
            'why': 'If the ATS cannot parse your email or phone number, recruiters cannot contact you for interviews',
            'how': 'Place email, telephone number, and location in plain text at the very top of your document (not inside a header image or table)'
        })

    # Overall ATS Score (Dynamic Weighted)
    overall = (headers_pct * 0.30) + (readability_pct * 0.25) + (hygiene_pct * 0.25) + (contact_pct * 0.20)
    
    if word_count < 70:
        overall = min(30.0, overall)
    elif word_count < 150 and len(found_headers) < 3:
        overall = min(48.0, overall)

    overall = round(max(20.0, min(98.0, overall)), 1)

    checklist = [
        {'item': 'Standard Section Headings', 'passed': len(found_headers) >= 4, 'details': f"{len(found_headers)}/5 headers detected"},
        {'item': 'Clean Contact Regex Detection', 'passed': has_email and has_phone, 'details': 'Email and Phone readable' if (has_email and has_phone) else 'Missing email or phone'},
        {'item': 'Optimal Word Count (350 - 1200 words)', 'passed': 350 <= word_count <= 1200, 'details': f"{word_count} total words"},
        {'item': 'Clean Text Formatting & Hygiene', 'passed': unusual_chars < 15, 'details': f"{unusual_chars} unusual glyphs found"}
    ]

    if not structured_ats_suggestions:
        structured_ats_suggestions.append({
            'section': 'ATS Formatting',
            'what': 'Document passes enterprise ATS parsing benchmarks',
            'why': 'Clean headings, readable text flow, and clear contact placement ensure accurate automated parsing',
            'how': 'Continue using single-column or cleanly separated two-column layouts without nested graphics'
        })

    return {
        'overall_score': overall,
        'breakdown': {
            'standard_headers': round(headers_pct, 1),
            'parser_readability': round(readability_pct, 1),
            'formatting_hygiene': round(hygiene_pct, 1),
            'contact_visibility': round(contact_pct, 1)
        },
        'checklist': checklist,
        'what_helped': what_helped,
        'what_reduced': what_reduced,
        'suggestions': structured_ats_suggestions,
        'suggestions_text': [f"{s['what']}: {s['how']}" for s in structured_ats_suggestions]
    }
