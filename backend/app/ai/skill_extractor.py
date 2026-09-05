import re

PROGRAMMING_LANGUAGES = ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell', 'SQL', 'HTML', 'CSS', 'Dart', 'Lua', 'Haskell', 'Elixir', 'Clojure', 'Objective-C', 'Assembly', 'COBOL', 'Fortran', 'Julia', 'Groovy']

FRAMEWORKS = ['React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Express.js', 'Node.js', 'Ruby on Rails', 'Laravel', 'ASP.NET', '.NET', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Redux', 'GraphQL', 'REST', 'gRPC', 'Gatsby', 'Remix', 'Nest.js', 'Gin', 'Echo', 'Fiber', 'Actix', 'Rocket', 'Phoenix', 'Streamlit', 'Gradio']

DATABASES = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Neo4j', 'CouchDB', 'MariaDB', 'Firebase', 'Supabase', 'InfluxDB', 'TimescaleDB', 'Snowflake', 'BigQuery', 'Redshift']

CLOUD_DEVOPS = ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI', 'Nginx', 'Apache', 'Linux', 'CI/CD', 'Serverless', 'Lambda', 'EC2', 'S3', 'CloudFormation', 'Pulumi', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'ELK Stack', 'Datadog', 'New Relic', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean']

DATA_SCIENCE_ML = ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter', 'SciPy', 'OpenCV', 'NLTK', 'spaCy', 'Hugging Face', 'Transformers', 'BERT', 'GPT', 'LLM', 'RAG', 'LangChain', 'XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'Neural Networks', 'CNN', 'RNN', 'LSTM', 'GAN', 'Reinforcement Learning', 'A/B Testing', 'Statistical Analysis', 'Data Mining', 'Feature Engineering', 'MLOps', 'MLflow', 'Kubeflow', 'Apache Spark', 'PySpark', 'Hadoop', 'Airflow', 'dbt', 'Tableau', 'Power BI', 'Looker', 'Data Visualization', 'ETL', 'Data Pipeline', 'Data Warehouse', 'Data Lake']

SOFT_SKILLS = ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Project Management', 'Agile', 'Scrum', 'Kanban', 'Time Management', 'Presentation', 'Mentoring', 'Collaboration', 'Adaptability', 'Creativity', 'Analytical Thinking', 'Decision Making', 'Negotiation', 'Conflict Resolution', 'Emotional Intelligence', 'Strategic Planning', 'Customer Service', 'Public Speaking', 'Technical Writing', 'Documentation']

TOOLS = ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Trello', 'Asana', 'Notion', 'Figma', 'Sketch', 'Adobe XD', 'Postman', 'Swagger', 'VS Code', 'IntelliJ', 'PyCharm', 'Eclipse', 'Vim', 'npm', 'yarn', 'pip', 'conda', 'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier', 'SonarQube', 'Selenium', 'Cypress', 'Jest', 'Pytest', 'JUnit', 'Mocha', 'Playwright']

SKILL_ALIASES = {'react.js': 'React', 'reactjs': 'React', 'react js': 'React', 'node': 'Node.js', 'nodejs': 'Node.js', 'node.js': 'Node.js', 'postgres': 'PostgreSQL', 'pg': 'PostgreSQL', 'mongo': 'MongoDB', 'k8s': 'Kubernetes', 'tf': 'TensorFlow', 'pytorch': 'PyTorch', 'sklearn': 'Scikit-learn', 'sci-kit learn': 'Scikit-learn', 'aws': 'AWS', 'gcp': 'GCP', 'js': 'JavaScript', 'ts': 'TypeScript', 'cpp': 'C++', 'c sharp': 'C#', 'golang': 'Go', 'ml': 'Machine Learning', 'dl': 'Deep Learning', 'cv': 'Computer Vision', 'ai': 'Artificial Intelligence', 'nlp': 'NLP', 'sql server': 'SQL Server', 'mssql': 'SQL Server', 'ci cd': 'CI/CD', 'ci/cd': 'CI/CD', 'html5': 'HTML', 'css3': 'CSS', 'tailwindcss': 'Tailwind CSS', 'tailwind': 'Tailwind CSS', 'next': 'Next.js', 'nextjs': 'Next.js', 'vue': 'Vue.js', 'vuejs': 'Vue.js', 'express': 'Express.js', 'fastapi': 'FastAPI', 'flask': 'Flask', 'django': 'Django', 'rails': 'Ruby on Rails', 'ror': 'Ruby on Rails', 'dotnet': '.NET', '.net core': '.NET', 'spring boot': 'Spring Boot', 'springboot': 'Spring Boot', 'powerbi': 'Power BI', 'power bi': 'Power BI', 'docker': 'Docker', 'kubernetes': 'Kubernetes'}

ALL_CATEGORIES = {
    'programming': PROGRAMMING_LANGUAGES,
    'framework': FRAMEWORKS,
    'database': DATABASES,
    'cloud': CLOUD_DEVOPS,
    'data_science': DATA_SCIENCE_ML,
    'soft_skill': SOFT_SKILLS,
    'tools': TOOLS
}

def get_all_skills() -> dict:
    return ALL_CATEGORIES

def categorize_skill(skill_name: str) -> str:
    canonical = skill_name
    if skill_name.lower() in SKILL_ALIASES:
        canonical = SKILL_ALIASES[skill_name.lower()]
        
    for cat, skills in ALL_CATEGORIES.items():
        if canonical in skills or skill_name in skills:
            return cat
    return 'other'

def extract_skills(text: str) -> list:
    extracted = []
    seen = set()
    text_lower = text.lower()
    
    # Pre-build skill map
    skill_map = {}
    for cat, skills in ALL_CATEGORIES.items():
        for skill in skills:
            skill_map[skill.lower()] = (skill, cat)
            
    for alias, canonical in SKILL_ALIASES.items():
        if canonical.lower() in skill_map:
            cat = skill_map[canonical.lower()][1]
            skill_map[alias.lower()] = (canonical, cat)
            
    for search_term, (canonical_name, category) in skill_map.items():
        if canonical_name in seen:
            continue
        pattern = r'\b' + re.escape(search_term) + r'\b'
        if re.search(pattern, text_lower):
            extracted.append({
                'name': canonical_name,
                'category': category,
                'original_match': search_term
            })
            seen.add(canonical_name)
            
    return extracted
