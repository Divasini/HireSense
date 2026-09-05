import re
import random
from typing import Dict, Any, List, Optional

# Role-specific question bank templates for Technical, Scenario, and Progressive levels
ROLE_QUESTION_BANKS = {
    'data analyst': {
        'technical': [
            {
                'level': 'basic',
                'difficulty': 'easy',
                'question': 'Can you explain the practical differences between WHERE and HAVING in SQL, and when you would use window functions like ROW_NUMBER() over RANK()?',
                'interviewer_intent': 'Evaluates foundational SQL filtering order and analytical window function mechanics.',
                'expected_points': ['WHERE filters before aggregation, HAVING filters after GROUP BY', 'ROW_NUMBER assigns distinct integers without ties', 'RANK assigns duplicate ranks for ties with skipped ranks'],
                'sample_answer': 'WHERE evaluates row-by-row before any GROUP BY aggregation, whereas HAVING evaluates aggregate values. ROW_NUMBER assigns unique sequential numbers even for identical values, while RANK produces identical numbers for ties and skips subsequent ranks.'
            },
            {
                'level': 'intermediate',
                'difficulty': 'medium',
                'question': 'How do you handle severe data quality anomalies—such as 30% missing values in critical columns or inconsistent datetime formats across regions?',
                'interviewer_intent': 'Assesses data hygiene strategy, imputation judgment, and business impact awareness.',
                'expected_points': ['Investigating missing mechanism (MCAR vs MAR)', 'Domain-specific imputation vs deletion', 'Standardizing UTC timestamps and audit logging'],
                'sample_answer': 'I first determine if the missingness is random or systematic. If over 30% is missing, forward-filling or median imputation can introduce bias, so I either flag missingness with indicator columns, consult domain owners, or isolate the subset.'
            },
            {
                'level': 'advanced',
                'difficulty': 'hard',
                'question': 'How do you design a scalable analytical data model (such as a Star Schema) in Power BI or Tableau to prevent bidirectional filter contention and maintain sub-second report responsiveness?',
                'interviewer_intent': 'Evaluates data warehousing principles, dimensional modeling, and BI dashboard optimization.',
                'expected_points': ['Fact and dimension separation', 'Single direction 1-to-many relationships', 'Lean explicit DAX measures over heavy calculated columns'],
                'sample_answer': 'I organize data into dimension tables and central fact tables with single-direction 1-to-many relationships, avoiding circular bidirectional filtering. I use incremental refresh and explicit DAX measures instead of row-by-row calculated columns.'
            },
            {
                'level': 'scenario',
                'difficulty': 'hard',
                'question': 'Two executive stakeholders present conflicting KPI numbers for the same quarterly metric from different dashboards. How do you investigate the discrepancy and establish a single source of truth?',
                'interviewer_intent': 'Measures data governance, stakeholder diplomacy, and root-cause metric reconciliation.',
                'expected_points': ['Comparing underlying SQL schemas and filter conditions', 'Identifying timezone or deduplication disparities', 'Documenting certified semantic layer definition'],
                'sample_answer': 'I compare the exact SQL queries, date filtering boundaries, and deduplication logic across both sources. Once the divergence is identified, I document the certified business definition in the data dictionary and migrate both dashboards to a shared semantic model.'
            },
            {
                'level': 'problem_solving',
                'difficulty': 'hard',
                'question': 'A critical executive dashboard that normally loads in 2 seconds is now taking 45 seconds to render after a database migration. Walk through your systematic troubleshooting approach.',
                'interviewer_intent': 'Assesses execution plan profiling, indexing review, and performance isolation.',
                'expected_points': ['Running query profiler / EXPLAIN plan', 'Checking for missing indexes on foreign keys', 'Inspecting data volume growth and network latency'],
                'sample_answer': 'I isolate whether the delay is in visual rendering or backend query execution. If query-bound, I run EXPLAIN ANALYZE to identify sequential table scans or missing indexes on join keys introduced during the migration.'
            }
        ],
        'scenarios': [
            {
                'question': 'You receive an urgent request from leadership to generate a churn forecast by tomorrow morning, but the customer activity dataset has 30% missing records. How do you deliver actionable insights responsibly?',
                'interviewer_intent': 'Assesses rapid decision making under deadline pressure while maintaining data integrity.',
                'expected_points': ['Transparent caveats and confidence intervals', 'Sensitivity analysis on missing data', 'Providing actionable directional trends rather than false precision']
            },
            {
                'question': 'During an exploratory analysis, you notice a sudden 40% spike in transaction revenue on a single day. How do you verify whether this is genuine organic growth, a bot attack, or a tracking telemetry glitch?',
                'interviewer_intent': 'Tests anomaly detection, behavioral analytics, and telemetry validation.',
                'expected_points': ['Segmenting by IP/user cohort', 'Cross-referencing payment processor settlement logs', 'Checking tracking event duplication']
            }
        ]
    },
    'machine learning engineer': {
        'technical': [
            {
                'level': 'basic',
                'difficulty': 'easy',
                'question': 'How do you diagnose and mitigate overfitting versus underfitting in deep neural networks and tree-based gradient boosting models?',
                'interviewer_intent': 'Evaluates understanding of the bias-variance tradeoff and regularization techniques.',
                'expected_points': ['Train vs validation loss divergence', 'Dropout, L1/L2, early stopping for neural nets', 'Max depth, subsampling, and min child weight for trees'],
                'sample_answer': 'Overfitting appears when validation loss diverges while training loss declines. For tree models like XGBoost, I restrict max_depth, increase min_child_weight, and use subsampling. In neural networks, I apply dropout, weight decay, and early stopping.'
            },
            {
                'level': 'intermediate',
                'difficulty': 'medium',
                'question': 'How do you engineer robust validation pipelines to prevent temporal and feature leakage when dealing with sequential time-series or user interaction logs?',
                'interviewer_intent': 'Tests statistical rigor in validation splits and real-world leak prevention.',
                'expected_points': ['Purged/blocked time-series cross validation', 'Fitting scalers and encoders strictly on training folds', 'Preventing lookahead bias in target generation'],
                'sample_answer': 'I enforce rolling or expanding window time-series splits where test data is strictly chronological. Preprocessing transformers, target encoders, and scalers are fitted solely on the training fold, avoiding leakage from future unseen records.'
            },
            {
                'level': 'advanced',
                'difficulty': 'hard',
                'question': 'Walk us through how you design an end-to-end MLOps pipeline for low-latency inference: from model quantization and ONNX runtime export to automated drift detection and canary deployments.',
                'interviewer_intent': 'Assesses production readiness, runtime acceleration, and model lifecycle governance.',
                'expected_points': ['Model quantization (INT8/FP16) & ONNX / TensorRT', 'Shadow or canary deployment with automated rollbacks', 'Drift monitoring with Kolmogorov-Smirnov or PSI tests'],
                'sample_answer': 'I optimize inference by exporting trained models to ONNX or TensorRT with INT8/FP16 quantization. The deployment runs on Triton Inference Server in a canary rollout. Population Stability Index (PSI) tracks feature drift in real-time, triggering automated retraining pipelines if thresholds are exceeded.'
            },
            {
                'level': 'scenario',
                'difficulty': 'hard',
                'question': 'Your computer vision or NLP model achieved 96% accuracy in offline testing, but customer satisfaction dropped immediately upon production release. How do you diagnose and resolve this performance gap?',
                'interviewer_intent': 'Measures understanding of train-serve skew, distribution shift, and business alignment.',
                'expected_points': ['Inspecting production input resolution or text distributions', 'Checking accuracy vs F1 on rare minority classes', 'Validating payload preprocessing parity between training and inference'],
                'sample_answer': 'High offline accuracy on imbalanced data often hides poor minority-class recall. I compare production request embeddings with training data to detect covariate shift, inspect preprocessing parity, and evaluate calibrated precision-recall metrics.'
            },
            {
                'level': 'problem_solving',
                'difficulty': 'hard',
                'question': 'Your real-time recommendation model must return personalized predictions within a 25ms p99 SLA across 10,000 requests per second. How do you design the feature store, caching, and model inference architecture?',
                'interviewer_intent': 'Tests ultra-low latency architecture, distributed feature caching, and candidate ranking pipelines.',
                'expected_points': ['Two-stage retrieval and re-ranking architecture', 'Low-latency in-memory feature store (Redis/Feast)', 'Asynchronous precomputation of static user embeddings'],
                'sample_answer': 'I implement a two-stage retrieval architecture: vector search (FAISS/Milvus) narrows 1M candidates to 100 within 5ms. A lightweight re-ranker scores the top 100 using precomputed user embeddings in Redis, meeting the 25ms p99 SLA.'
            }
        ],
        'scenarios': [
            {
                'question': 'Your fraud detection model in production suddenly reports an 80% decrease in flagged transactions following an upstream API change by a third-party partner. How do you triage and resolve the failure without downtime?',
                'interviewer_intent': 'Tests incident response, schema validation, and fallback inference strategies.',
                'expected_points': ['Validating input feature schemas and default values', 'Deploying fallback heuristic rules during triage', 'Implementing Pydantic/Great Expectations schema guards']
            }
        ]
    },
    'software developer': {
        'technical': [
            {
                'level': 'basic',
                'difficulty': 'easy',
                'question': 'Explain how concurrency differs from parallelism, and how you manage asynchronous non-blocking I/O versus CPU-bound tasks in modern applications.',
                'interviewer_intent': 'Evaluates understanding of concurrency primitives, event loops, and multi-threading.',
                'expected_points': ['Concurrency is structure/interleaving; parallelism is simultaneous execution', 'Async event loops for I/O bound tasks', 'Process pools / worker threads for CPU intensive operations'],
                'sample_answer': 'Concurrency is dealing with lots of things at once through interleaving, while parallelism is doing lots of things simultaneously across multiple cores. For I/O bound tasks like network calls, async event loops prevent thread exhaustion, while CPU-bound tasks require multiprocessing.'
            },
            {
                'level': 'intermediate',
                'difficulty': 'medium',
                'question': 'How do you design database transactions to prevent race conditions, dirty reads, and deadlocks under heavy concurrent writes?',
                'interviewer_intent': 'Tests database internals, ACID compliance, locking mechanisms, and optimistic vs pessimistic locking.',
                'expected_points': ['Transaction isolation levels (Read Committed vs Serializable)', 'Optimistic locking with version counters', 'Enforcing consistent resource lock ordering to prevent deadlocks'],
                'sample_answer': 'I choose isolation levels tailored to the risk profile, such as Read Committed with optimistic locking using version columns for e-commerce inventories. To avoid deadlocks, all distributed transactions acquire resource locks in a strictly uniform alphabetical order.'
            },
            {
                'level': 'advanced',
                'difficulty': 'hard',
                'question': 'How would you architect a microservices-based system to maintain data consistency across distributed boundaries without two-phase commit bottlenecks?',
                'interviewer_intent': 'Assesses distributed systems patterns, eventual consistency, and the Saga pattern.',
                'expected_points': ['Saga pattern (choreographed or orchestrated)', 'Idempotent consumers and transactional outbox', 'Compensating transactions for rollback'],
                'sample_answer': 'I utilize the Saga pattern with an orchestrator or event bus. Each service updates its local database and writes to an Outbox table in a single local transaction. If a downstream service fails, compensating transactions undo earlier steps, preserving eventual consistency.'
            },
            {
                'level': 'scenario',
                'difficulty': 'hard',
                'question': 'Your core payment processing service begins returning HTTP 504 Gateway Timeouts under a sudden traffic surge. How do you diagnose whether the issue is connection pool exhaustion, unindexed queries, or third-party webhooks?',
                'interviewer_intent': 'Measures full-stack incident triage, APM profiling, and circuit breaker patterns.',
                'expected_points': ['Checking connection pool utilization metrics', 'Inspecting thread dumps and slow query logs', 'Activating circuit breakers to prevent cascading failure'],
                'sample_answer': 'I inspect APM distributed traces to pinpoint where latency is accumulating. If the connection pool is saturated, I examine slow query logs for unindexed tables. I configure circuit breakers with fallback queues to isolate third-party payment gateways and protect core services.'
            },
            {
                'level': 'problem_solving',
                'difficulty': 'hard',
                'question': 'You are tasked with migrating a monolithic database table with 500 million rows to a sharded cluster with zero downtime and zero data loss. What is your multi-step migration blueprint?',
                'interviewer_intent': 'Tests zero-downtime database migration strategies, dual-writing, and verification pipelines.',
                'expected_points': ['Dual-writing with change data capture (CDC)', 'Backfilling historical data asynchronously', 'Shadow read verification before final cutover'],
                'sample_answer': 'I implement a four-phase migration: 1) Deploy dual-writing via CDC (Debezium) to both monolith and shards; 2) Backfill historical data in chunked intervals; 3) Run shadow read comparisons to verify 100% data parity; 4) Flip read traffic, then deprecate the legacy table.'
            }
        ],
        'scenarios': [
            {
                'question': 'A junior engineer commits code containing a hardcoded API secret key to the public repository branch. What are your immediate containment and long-term mitigation steps?',
                'interviewer_intent': 'Evaluates security hygiene, incident mitigation, and automated secret scanning.',
                'expected_points': ['Immediate key revocation and rotation in cloud console', 'Purging git history via git filter-repo', 'Implementing pre-commit secret scanning with tools like git-secrets or TruffleHog']
            }
        ]
    }
}

GENERIC_TECH_QUESTIONS = [
    {
        'level': 'basic',
        'difficulty': 'easy',
        'question': 'Can you explain the foundational principles of clean architecture, modularity, and separation of concerns in your primary programming stack?',
        'interviewer_intent': 'Evaluates software engineering fundamentals and clean code practices.',
        'expected_points': ['Single Responsibility Principle', 'Dependency Inversion / Decoupling', 'Testability and modularity'],
        'sample_answer': 'Clean architecture emphasizes separation of concerns by keeping core business rules independent of frameworks, databases, and UI components. This allows for unit testing in isolation and clean refactoring.'
    },
    {
        'level': 'intermediate',
        'difficulty': 'medium',
        'question': 'How do you design, version, and document RESTful or GraphQL APIs to ensure backward compatibility and seamless developer onboarding?',
        'interviewer_intent': 'Tests API design standards, contract testing, and versioning strategies.',
        'expected_points': ['Semantic versioning or URI versioning', 'Idempotency and standard HTTP status codes', 'OpenAPI / Swagger documentation'],
        'sample_answer': 'I utilize URI or header versioning, enforce strict OpenAPI contracts, and maintain backward compatibility by making additive changes only. Non-breaking defaults ensure existing client consumers remain operational.'
    },
    {
        'level': 'advanced',
        'difficulty': 'hard',
        'question': 'Walk us through your strategy for automated testing (unit, integration, and end-to-end), CI/CD pipelines, and zero-downtime deployment strategies.',
        'interviewer_intent': 'Measures quality assurance standards, automation rigor, and production deployment confidence.',
        'expected_points': ['Testing pyramid balance', 'Automated linting and test suites in CI', 'Blue-green or rolling deployments with automated rollbacks'],
        'sample_answer': 'I adhere to the testing pyramid with fast unit tests covering core logic, integration tests validating database and API contracts, and smoke tests in staging. Deployments utilize blue-green or rolling strategies with automated health checks.'
    },
    {
        'level': 'scenario',
        'difficulty': 'hard',
        'question': 'Your production application experiences an intermittent memory leak that crashes worker containers every 36 hours. How do you reproduce, isolate, and eliminate the root cause?',
        'interviewer_intent': 'Assesses deep debugging, profiling, heap analysis, and operational troubleshooting.',
        'expected_points': ['Collecting heap dumps and memory profiling over time', 'Inspecting unclosed connections, static caches, or event listeners', 'Reproducing in a load-tested staging environment'],
        'sample_answer': 'I capture heap snapshots across consecutive time intervals to identify unbounded object retention. Common culprits include unclosed database connection pools or global in-memory caches without TTL eviction. Once identified, I patch the retention and verify via simulated load tests.'
    },
    {
        'level': 'problem_solving',
        'difficulty': 'hard',
        'question': 'Describe a scenario where you had to dramatically optimize an algorithm or architecture that was bottlenecking system throughput. What tools and metrics guided your decisions?',
        'interviewer_intent': 'Evaluates algorithmic optimization, profiling discipline, and measurable impact.',
        'expected_points': ['Profiling before optimizing (avoiding premature optimization)', 'Big-O complexity reduction', 'Quantified results (latency, CPU, or memory metrics)'],
        'sample_answer': 'After profiling revealed an O(N^2) nested lookup in our batch processing service, I refactored the lookup to an in-memory hash set, reducing time complexity to O(N). This reduced batch execution time from 40 minutes to under 3 minutes.'
    }
]

def get_role_category(target_role: str) -> str:
    role_lower = (target_role or '').lower()
    if any(k in role_lower for k in ['data', 'analyst', 'bi', 'business intelligence', 'analytics', 'tableau', 'power bi']):
        return 'data analyst'
    if any(k in role_lower for k in ['machine learning', 'ml', 'ai', 'deep learning', 'nlp', 'computer vision', 'data scientist']):
        return 'machine learning engineer'
    if any(k in role_lower for k in ['software', 'developer', 'full stack', 'frontend', 'backend', 'engineer', 'python developer', 'web']):
        return 'software developer'
    return 'software developer'

def generate_interview_questions(
    parsed_resume: dict,
    job_requirements: dict = None,
    screening_result: dict = None,
    category_filter: str = 'mixed',
    difficulty: str = 'medium',
    count: int = 5
) -> list:
    parsed_resume = parsed_resume or {}
    job_requirements = job_requirements or {}
    
    # Extract candidate data
    skills = [s.get('name') if isinstance(s, dict) else str(s) for s in parsed_resume.get('skills', [])]
    projects = parsed_resume.get('projects', [])
    experience = parsed_resume.get('experience', [])
    education = parsed_resume.get('education', [])
    certs = parsed_resume.get('certifications', [])
    
    target_role = job_requirements.get('title') or 'Software Engineer'
    company = job_requirements.get('company') or 'HireSense Partner Network'
    req_skills = job_requirements.get('required_skills', []) or []
    
    mode = (category_filter or 'mixed').lower()
    questions = []
    
    # =========================================================================
    # 1. TECHNICAL INTERVIEW MODE (Progressive: Basic -> Intermediate -> Advanced -> Scenario -> Problem Solving)
    # =========================================================================
    if mode in ['technical']:
        role_cat = get_role_category(target_role)
        role_bank = ROLE_QUESTION_BANKS.get(role_cat, {}).get('technical', GENERIC_TECH_QUESTIONS)
        
        for q_item in role_bank:
            q_copy = dict(q_item)
            q_copy['category'] = 'technical'
            q_copy['target_role'] = target_role
            questions.append(q_copy)
            
        combined_skills = [s for s in skills if s in req_skills] or skills or req_skills or ['Python', 'SQL', 'System Architecture']
        for s in combined_skills:
            if len(questions) >= count:
                break
            questions.append({
                'category': 'technical',
                'difficulty': difficulty,
                'level': 'practical',
                'question': f'In the context of your work with {s}, how do you evaluate and optimize performance, ensure thread/memory safety, and handle edge-case failures in production?',
                'interviewer_intent': f'Evaluates practical depth and production readiness with {s}.',
                'expected_points': [f'Proficiency in {s} idioms', 'Error handling and edge case mitigation', 'Measurable performance optimization'],
                'sample_answer': f'When deploying with {s}, I enforce modular architecture, profile memory and execution paths using benchmark tools, and write comprehensive automated tests for edge-case boundaries.'
            })

    # =========================================================================
    # 2. PROJECT INTERVIEW MODE (Deep-dive into Candidate Projects)
    # =========================================================================
    elif mode in ['project']:
        if projects and len(projects) > 0:
            for idx, p in enumerate(projects):
                p_title = p.get('title') or p.get('name') or f'Engineering Project {idx + 1}'
                p_tech = ', '.join(p.get('technologies', [])) if p.get('technologies') else 'the selected technology stack'
                
                questions.append({
                    'category': 'project',
                    'difficulty': 'medium',
                    'level': 'architecture',
                    'question': f'In your project "{p_title}" (built with {p_tech}), walk us through the system architecture. What critical engineering problem were you solving, and why did you select {p_tech} over potential alternatives?',
                    'interviewer_intent': f'Verifies core architecture ownership and technology selection rationale for {p_title}.',
                    'expected_points': ['Clear problem statement', 'Architecture diagram/flow explanation', 'Technical tradeoffs considered'],
                    'sample_answer': f'In {p_title}, I designed the core architecture to address scalable data ingestion. I chose {p_tech} because of its robust ecosystem and low runtime latency compared to alternatives.'
                })
                
                questions.append({
                    'category': 'project',
                    'difficulty': 'hard',
                    'level': 'challenges',
                    'question': f'What was the most formidable technical obstacle or performance bottleneck you encountered while building "{p_title}", and how did you systematically diagnose and resolve it?',
                    'interviewer_intent': f'Tests real-world debugging, resilience, and root-cause analysis on {p_title}.',
                    'expected_points': ['Specific bottleneck description', 'Diagnostic tools and profiling used', 'Measurable improvement or outcome'],
                    'sample_answer': f'While scaling {p_title}, we hit database locking contention under concurrent requests. I analyzed slow query logs, introduced Redis caching for hot reads, and restructured queries to cut latency by 55%.'
                })
                
                questions.append({
                    'category': 'project',
                    'difficulty': 'hard',
                    'level': 'scalability',
                    'question': f'If "{p_title}" suddenly scaled to support 100,000 active concurrent users, what single component in your architecture would fail first, and how would you redesign it for high availability?',
                    'interviewer_intent': 'Measures architectural foresight, failure domain awareness, and horizontal scaling capabilities.',
                    'expected_points': ['Single point of failure identification', 'Horizontal scaling / load balancing strategy', 'Stateless services and asynchronous worker queues'],
                    'sample_answer': f'At 100,000 concurrent users, the monolithic database write lock would be our first bottleneck. I would decouple writes using an asynchronous Kafka/RabbitMQ event queue and transition read traffic to a distributed read replica pool.'
                })
                
                questions.append({
                    'category': 'project',
                    'difficulty': 'medium',
                    'level': 'deployment',
                    'question': f'How did you validate and test the reliability of "{p_title}"? Walk us through your unit testing, integration tests, and deployment pipeline.',
                    'interviewer_intent': 'Evaluates quality assurance discipline and deployment automation standards.',
                    'expected_points': ['Test coverage and mock frameworks', 'Automated CI/CD workflows', 'Deployment and monitoring approach'],
                    'sample_answer': f'I wrote comprehensive automated unit tests covering business logic and used integration tests with containerized databases. Changes were deployed through an automated GitHub Actions pipeline with pre-deployment verification.'
                })
        else:
            questions.append({
                'category': 'project',
                'difficulty': 'medium',
                'level': 'foundational',
                'question': f'Describe a complex software or data engineering project you built from the ground up. Walk through the core problem, system architecture, and your direct technical ownership.',
                'interviewer_intent': 'Assesses full project lifecycle ownership when no explicit projects were detected on the resume.',
                'expected_points': ['Project scope & business context', 'Key architectural layers', 'Quantified results'],
                'sample_answer': 'I engineered an automated data ingestion platform using Python and PostgreSQL. I established schema migrations, automated unit testing, and achieved 99.9% uptime.'
            })
            questions.append({
                'category': 'project',
                'difficulty': 'hard',
                'level': 'tradeoffs',
                'question': 'In your most impactful engineering project, what was a critical architectural compromise or tradeoff you had to make under tight deadlines or resource constraints?',
                'interviewer_intent': 'Tests pragmatic engineering decision-making and awareness of technical debt.',
                'expected_points': ['Clear constraint context', 'Evaluated alternatives', 'Remediation plan for technical debt'],
                'sample_answer': 'We prioritized shipping an MVP with synchronous API calls rather than building out a full event-driven message bus. Once core traction was verified, we refactored to an asynchronous architecture during the next quarter.'
            })

    # =========================================================================
    # 3. HR INTERVIEW MODE
    # =========================================================================
    elif mode in ['hr']:
        exp_years = parsed_resume.get('total_experience_years') or 2
        latest_edu = education[0].get('degree') if education else 'your educational program'
        
        questions.append({
            'category': 'hr',
            'difficulty': 'easy',
            'level': 'introduction',
            'question': f'Please introduce yourself, highlighting the key milestones in your journey with {latest_edu} and your experience in technical engineering that prepare you for this {target_role} role at {company}.',
            'interviewer_intent': 'Evaluates professional storytelling, self-awareness, and articulation of career trajectory.',
            'expected_points': ['Concise chronological narrative', 'Relevance to target role', 'Clear career inflection points'],
            'sample_answer': f'I have built my career focusing on scalable engineering solutions. My background with {latest_edu} and {exp_years}+ years in technical development gives me a strong foundation in building resilient software for {company}.'
        })
        questions.append({
            'category': 'hr',
            'difficulty': 'medium',
            'level': 'motivation',
            'question': f'What specifically attracts you to this {target_role} opportunity at {company}, and how does this role align with your long-term career trajectory over the next 3 to 5 years?',
            'interviewer_intent': 'Measures company research, genuine role interest, and retention potential.',
            'expected_points': ['Alignment with company mission/domain', 'Growth goals over 3-5 years', 'Mutual value proposition'],
            'sample_answer': f'I admire {company} for its focus on innovation and technical rigor. Over the next 3 to 5 years, I want to grow from executing complex technical features to leading architectural decisions and mentoring junior engineers.'
        })
        questions.append({
            'category': 'hr',
            'difficulty': 'medium',
            'level': 'strengths_weaknesses',
            'question': 'What do you consider your greatest technical or professional strength, and what is one concrete area or skill you are actively working to improve this year?',
            'interviewer_intent': 'Assesses honest self-critique, commitment to continuous learning, and humility.',
            'expected_points': ['Genuine self-awareness', 'Evidence of strength with real impact', 'Proactive steps taken to address the growth area'],
            'sample_answer': 'My greatest strength is systematic debugging and breaking down ambiguous problems. An area I am actively improving is public speaking and presenting technical architecture proposals to non-technical executives.'
        })
        questions.append({
            'category': 'hr',
            'difficulty': 'medium',
            'level': 'workplace_values',
            'question': 'In modern cross-functional teams, how do you manage competing priorities when multiple team leads or product managers request urgent deliverables simultaneously?',
            'interviewer_intent': 'Tests workload prioritization, proactive communication, and boundary management.',
            'expected_points': ['Impact vs effort matrix', 'Transparent stakeholder communication', 'Escalation through product leadership'],
            'sample_answer': 'I evaluate deliverables against business impact and deadlines. I maintain transparent sprint tracking and align with engineering leadership to clarify prioritization before commitments are made.'
        })
        questions.append({
            'category': 'hr',
            'difficulty': 'easy',
            'level': 'work_culture',
            'question': 'What type of engineering culture and management style empowers you to do your best work and stay motivated during high-intensity release cycles?',
            'interviewer_intent': 'Evaluates cultural compatibility, autonomy preferences, and team dynamics.',
            'expected_points': ['Appreciation for ownership & psychological safety', 'Constructive code review culture', 'Mission-oriented motivation'],
            'sample_answer': 'I thrive in an environment that values high autonomy, psychological safety, and blameless post-mortems. I appreciate leaders who provide clear strategic context and trust engineers to execute.'
        })

    # =========================================================================
    # 4. BEHAVIORAL INTERVIEW MODE (STAR Method)
    # =========================================================================
    elif mode in ['behavioral']:
        questions.append({
            'category': 'behavioral',
            'difficulty': 'medium',
            'level': 'conflict_resolution',
            'question': 'Describe a situation where you had a significant technical disagreement with a senior engineer or product manager about an architectural choice. How did you handle the situation and achieve alignment? (Please structure with Situation, Task, Action, Result).',
            'interviewer_intent': 'Assesses emotional intelligence, diplomacy, objective benchmarking, and team cohesion.',
            'expected_points': ['Situation and Task clearly articulated', 'Action focused on objective data/proof-of-concept over ego', 'Result showing mutual consensus and positive outcome'],
            'sample_answer': 'During an API redesign, a teammate wanted to use GraphQL while I proposed REST for our simple mobile client. I built a 1-day benchmark demonstrating that REST reduced latency by 35% with less client complexity. We reviewed the metrics together and aligned smoothly on REST.'
        })
        questions.append({
            'category': 'behavioral',
            'difficulty': 'medium',
            'level': 'handling_failure',
            'question': 'Tell us about a time when a feature you developed caused an unexpected outage or regression in production. How did you react, communicate, and remediate the issue? (Use the STAR framework).',
            'interviewer_intent': 'Measures accountability, composure under crisis, and commitment to blameless post-mortems.',
            'expected_points': ['Immediate ownership without deflecting blame', 'Containment and rollback action', 'Root-cause analysis and automated test safeguard added'],
            'sample_answer': 'After deploying a database migration, connection pools saturated and triggered 500 errors. I immediately alerted the team, initiated a rollback within 4 minutes, and updated our CI pipeline with automated concurrency tests to prevent recurrence.'
        })
        questions.append({
            'category': 'behavioral',
            'difficulty': 'hard',
            'level': 'tight_deadlines',
            'question': f'Describe a time when you were under intense pressure with an aggressive deadline for a {target_role} deliverable. How did you prioritize tasks and ensure code quality was not sacrificed?',
            'interviewer_intent': 'Evaluates prioritization under pressure, scope negotiation, and technical standards.',
            'expected_points': ['MVP scope negotiation', 'Maintaining automated testing standards', 'Clear communication to prevent burnout'],
            'sample_answer': 'Two weeks before a critical product launch, requirements expanded. I organized a scoping session to carve out core MVP features versus fast-follows, maintained strict unit test coverage, and delivered on schedule without regression.'
        })
        questions.append({
            'category': 'behavioral',
            'difficulty': 'medium',
            'level': 'leadership_mentorship',
            'question': 'Tell us about a situation where you had to guide, mentor, or onboard a team member who was struggling with a complex technical stack or concept. What was your approach and the final outcome?',
            'interviewer_intent': 'Evaluates empathy, pedagogical communication, and collaborative leadership.',
            'expected_points': ['Patient diagnosis of knowledge gaps', 'Pair programming and documentation support', 'Gradual independence and measurable milestone'],
            'sample_answer': 'A new junior engineer was struggling with our asynchronous state management. I scheduled daily 20-minute pair-programming sessions and created an architectural onboarding guide. Within three weeks, they were independently shipping pull requests.'
        })
        questions.append({
            'category': 'behavioral',
            'difficulty': 'medium',
            'level': 'adaptability',
            'question': 'Tell us about a time when project requirements suddenly shifted dramatically halfway through implementation. How did you adapt your engineering plan?',
            'interviewer_intent': 'Measures agile adaptability, refactoring mindset, and resilience to ambiguity.',
            'expected_points': ['Assessing salvageable modular code', 'Restructuring sprint goals', 'Maintaining team morale'],
            'sample_answer': 'Midway through building a custom authentication module, compliance mandated Okta SAML integration. Because our service boundary was decoupled, I swapped the authentication adapter with minimal rework to the core business logic.'
        })

    # =========================================================================
    # 5. SCENARIO-BASED INTERVIEW MODE
    # =========================================================================
    elif mode in ['scenario']:
        role_cat = get_role_category(target_role)
        role_scenarios = ROLE_QUESTION_BANKS.get(role_cat, {}).get('scenarios', [])
        
        for sc in role_scenarios:
            q_copy = dict(sc)
            q_copy['category'] = 'scenario'
            q_copy['difficulty'] = 'hard'
            questions.append(q_copy)
            
        questions.append({
            'category': 'scenario',
            'difficulty': 'hard',
            'level': 'production_incident',
            'question': f'It is Friday evening at 6:00 PM, and your team is notified that {target_role} production workloads are experiencing a 15% packet drop and response degradation. Walk us step-by-step through your incident response protocol.',
            'interviewer_intent': 'Assesses incident management rigor, communication cadence, and structured triage.',
            'expected_points': ['Acknowledge and establish incident commander/channel', 'Mitigate first before deep root-cause', 'Post-mortem documentation'],
            'sample_answer': 'I first establish an incident channel and designate communication roles. My priority is rapid mitigation—rolling back recent deployments or spinning up extra capacity—before conducting root-cause analysis. Once stable, we write a blameless post-mortem.'
        })
        questions.append({
            'category': 'scenario',
            'difficulty': 'hard',
            'level': 'security_compliance',
            'question': 'During a routine code review, you suspect that sensitive customer PII is being written to plain-text application logs accessible to internal developers. How do you handle this discovery?',
            'interviewer_intent': 'Evaluates security consciousness, compliance integrity, and immediate remediation.',
            'expected_points': ['Immediate containment and logging filter patch', 'Auditing historical log retention', 'Notification to security compliance leads'],
            'sample_answer': 'I immediately raise an urgent security ticket and deploy a hotfix that masks PII fields in the logging serializer. Next, I audit existing log storage to purge compromised entries and add automated linters to prevent PII logging in CI.'
        })
        questions.append({
            'category': 'scenario',
            'difficulty': 'medium',
            'level': 'technical_debt',
            'question': 'Product management is pushing to release a feature immediately to beat a competitor, but your engineering team knows it incurs severe technical debt that will destabilize future sprints. How do you navigate this decision?',
            'interviewer_intent': 'Assesses business-engineering balance, risk communication, and technical debt governance.',
            'expected_points': ['Quantifying risk and remediation cost in business terms', 'Negotiating an agreed refactoring sprint', 'Documenting technical boundaries'],
            'sample_answer': 'I translate the technical debt into business risk—explaining how short-term shortcuts could increase downtime or triple the cost of future features. I propose shipping a scoped version now with an explicit agreement to refactor in the very next sprint.'
        })

    # =========================================================================
    # 6. RESUME-BASED INTERVIEW MODE
    # =========================================================================
    elif mode in ['resume']:
        if skills:
            for s in skills[:3]:
                questions.append({
                    'category': 'resume',
                    'difficulty': 'medium',
                    'level': 'resume_skill',
                    'question': f'Your resume highlights expertise in {s}. Can you walk us through how you applied {s} in a real-world project, and what advanced features or patterns you leveraged?',
                    'interviewer_intent': f'Validates hands-on depth and authenticity of the resume claim for {s}.',
                    'expected_points': [f'Specific use-case for {s}', 'Architecture or libraries used', 'Measurable outcome'],
                    'sample_answer': f'I used {s} to build modular services. I leveraged its advanced features to handle asynchronous workflows and integrated robust automated tests to ensure high test coverage.'
                })
        
        if experience:
            for exp_item in experience[:2]:
                c_title = exp_item.get('job_title') or 'Professional Role'
                c_comp = exp_item.get('company') or 'your organization'
                
                questions.append({
                    'category': 'resume',
                    'difficulty': 'medium',
                    'level': 'resume_experience',
                    'question': f'In your role as {c_title} at {c_comp}, what was your most significant technical accomplishment, and how did it directly impact the business or engineering team?',
                    'interviewer_intent': f'Validates role claims at {c_comp} and evaluates quantifiable impact.',
                    'expected_points': ['Concrete responsibilities', 'Personal ownership', 'Measurable business impact'],
                    'sample_answer': f'At {c_comp}, I spearheaded the optimization of our core services. By refactoring our data layer and introducing caching, I improved processing speeds by 40% and eliminated customer-reported timeouts.'
                })
                
        if projects:
            p = projects[0]
            p_name = p.get('title') or p.get('name') or 'Primary Project'
            questions.append({
                'category': 'resume',
                'difficulty': 'medium',
                'level': 'resume_project',
                'question': f'You featured "{p_name}" on your resume. What inspired this project, what was your exact contribution, and what would you do differently if you were rebuilding it from scratch today?',
                'interviewer_intent': f'Verifies authenticity and reflective engineering judgment on {p_name}.',
                'expected_points': ['Inspiration and problem solved', 'Personal ownership breakdown', 'Reflective architecture improvements'],
                'sample_answer': f'I built {p_name} to solve a real workflow bottleneck. If rebuilding today, I would adopt an event-driven architecture from day one and enforce strict contract testing across all endpoints.'
            })
            
        if certs:
            cert_name = certs[0].get('name') if isinstance(certs[0], dict) else str(certs[0])
            questions.append({
                'category': 'resume',
                'difficulty': 'medium',
                'level': 'resume_certification',
                'question': f'You hold the certification "{cert_name}". How has this credential influenced your day-to-day engineering practices and architectural decision-making?',
                'interviewer_intent': f'Tests practical application of certification knowledge from {cert_name}.',
                'expected_points': ['Core principles learned', 'Application in code review and architecture', 'Professional rigor'],
                'sample_answer': f'Preparing for {cert_name} deepened my understanding of high availability and security best practices, which I now routinely incorporate into our infrastructure blueprints.'
            })
        elif education:
            edu_deg = education[0].get('degree') or 'Degree'
            edu_inst = education[0].get('institution') or 'University'
            questions.append({
                'category': 'resume',
                'difficulty': 'easy',
                'level': 'resume_education',
                'question': f'How did your academic background in {edu_deg} at {edu_inst} prepare you for the computational and analytical demands of {target_role}?',
                'interviewer_intent': 'Connects academic fundamentals to real-world software engineering practice.',
                'expected_points': ['Foundational CS theory/math applied', 'Problem-solving methodology', 'Team project experience'],
                'sample_answer': f'My studies at {edu_inst} gave me rigorous training in data structures, algorithms, and systems design, which enables me to reason critically about performance and computational complexity.'
            })

    # =========================================================================
    # 7. MIXED INTERVIEW MODE
    # =========================================================================
    else:
        # Step 1: Introduction & HR
        questions.append({
            'category': 'hr',
            'difficulty': 'easy',
            'level': 'intro',
            'question': f'Welcome to your interview for the {target_role} position at {company}. To start off, please tell us about your background and what motivated you to apply for this role.',
            'interviewer_intent': 'Warm-up introduction and professional summary.',
            'expected_points': ['Concise professional background', 'Core technical passions', 'Interest in target role'],
            'sample_answer': f'I have dedicated my career to building high-quality software systems. My technical background aligns strongly with the engineering demands of {company}, and I am excited about contributing to {target_role}.'
        })
        
        # Step 2: Resume-Based Question
        top_skill = skills[0] if skills else 'System Architecture'
        questions.append({
            'category': 'resume',
            'difficulty': 'medium',
            'level': 'resume_deepdive',
            'question': f'Your resume highlights experience with {top_skill}. Walk us through a complex problem you tackled where {top_skill} was critical to the solution.',
            'interviewer_intent': f'Validates practical experience with {top_skill} from resume.',
            'expected_points': ['Concrete context', 'Technical approach using {top_skill}', 'Impact achieved'],
            'sample_answer': f'I leveraged {top_skill} to rebuild a critical data service, reducing processing latency by 45% and eliminating memory leaks.'
        })
        
        # Step 3: Technical Fundamentals
        role_cat = get_role_category(target_role)
        tech_bank = ROLE_QUESTION_BANKS.get(role_cat, {}).get('technical', GENERIC_TECH_QUESTIONS)
        q3 = dict(tech_bank[0])
        q3['category'] = 'technical'
        questions.append(q3)
        
        # Step 4: Technical Deep-Dive / Advanced
        q4 = dict(tech_bank[min(2, len(tech_bank) - 1)])
        q4['category'] = 'technical'
        questions.append(q4)
        
        # Step 5: Project Question
        if projects:
            p_name = projects[0].get('title') or projects[0].get('name') or 'Core Engineering Project'
            questions.append({
                'category': 'project',
                'difficulty': 'medium',
                'level': 'project_deepdive',
                'question': f'In your project "{p_name}", what was the most difficult architectural decision you made, and how did you validate that your solution met performance requirements?',
                'interviewer_intent': f'Verifies project ownership and validation rigor on {p_name}.',
                'expected_points': ['Problem context', 'Alternatives evaluated', 'Automated testing and verification'],
                'sample_answer': f'In {p_name}, choosing between synchronous API orchestration versus asynchronous queues was crucial. I tested under simulated load and selected an asynchronous pipeline to preserve responsiveness.'
            })
        else:
            q_alt = dict(tech_bank[min(3, len(tech_bank) - 1)])
            q_alt['category'] = 'technical'
            questions.append(q_alt)
            
        # Step 6: Real-World Production Scenario
        scenarios = ROLE_QUESTION_BANKS.get(role_cat, {}).get('scenarios', [])
        if scenarios:
            q_sc = dict(scenarios[0])
            q_sc['category'] = 'scenario'
            questions.append(q_sc)
        else:
            questions.append({
                'category': 'scenario',
                'difficulty': 'hard',
                'level': 'troubleshooting',
                'question': f'Suppose a customer reports that a mission-critical workflow in {target_role} is intermittently failing with no error logged. How do you isolate the failure domain and fix it without disrupting other users?',
                'interviewer_intent': 'Assesses structured debugging, distributed tracing, and fault isolation.',
                'expected_points': ['Reproducing in sandbox', 'Enabling distributed trace correlation IDs', 'Deploying targeted telemetry'],
                'sample_answer': 'I isolate the user session by attaching correlation IDs to requests, reproduce in a sandbox, and review distributed telemetry to pinpoint where the unhandled exception is swallowed.'
            })
            
        # Step 7: Behavioral STAR Question
        questions.append({
            'category': 'behavioral',
            'difficulty': 'medium',
            'level': 'star_conflict',
            'question': 'Tell us about a time when you experienced a significant technical disagreement with a colleague on project delivery. How did you resolve the impasse? (Please use Situation, Task, Action, Result).',
            'interviewer_intent': 'Measures conflict resolution, objective data orientation, and teamwork.',
            'expected_points': ['Clear Situation and Task', 'Collaborative Action with objective data', 'Positive Result'],
            'sample_answer': 'When deciding between two database architectures, my colleague favored Mongo while I advocated PostgreSQL. I set up a quick prototype comparing our query patterns. The results showed PostgreSQL offered superior query speed for our relational queries, leading to mutual consensus.'
        })
        
        # Step 8: Final HR / Culture Question
        questions.append({
            'category': 'hr',
            'difficulty': 'easy',
            'level': 'closing',
            'question': f'What questions do you have for the engineering leadership team at {company}, and what impact do you hope to make during your first 90 days as {target_role}?',
            'interviewer_intent': 'Measures intellectual curiosity, proactive planning, and 90-day vision.',
            'expected_points': ['Insightful questions about architecture/team', 'Structured 30-60-90 day ramp-up plan', 'Impact mindset'],
            'sample_answer': 'In my first 30 days, I focus on absorbing team conventions and shipping small bug fixes; by 60 days, taking full ownership of features; and by 90 days, contributing to architectural RFCs and mentoring new onboarders.'
        })

    # Deduplicate questions and guarantee category
    deduped = []
    seen = set()
    for q in questions:
        if 'category' not in q:
            q['category'] = 'technical'
        text = q.get('question', '').strip()
        if text and text not in seen:
            seen.add(text)
            deduped.append(q)
            
    # Adjust to requested question count
    target_count = max(3, min(25, count))
    
    idx = 0
    while len(deduped) < target_count and idx < len(GENERIC_TECH_QUESTIONS):
        cand_q = dict(GENERIC_TECH_QUESTIONS[idx])
        cand_q['category'] = 'technical'
        if cand_q['question'] not in seen:
            seen.add(cand_q['question'])
            deduped.append(cand_q)
        idx += 1

        
    return deduped[:target_count]

def generate_adaptive_follow_up(
    current_question: dict,
    candidate_answer: str,
    evaluation: dict,
    target_role: str = 'Software Engineer'
) -> Optional[dict]:
    score = float(evaluation.get('overall_score', 70.0))
    q_text = current_question.get('question', '')
    cat = current_question.get('category', 'technical')
    ans_lower = (candidate_answer or '').lower()
    
    # Strong answer (>= 80%): push deeper into architecture, scale, or failure modes
    if score >= 80.0:
        if 'database' in ans_lower or 'sql' in ans_lower or 'cache' in ans_lower:
            return {
                'is_follow_up': True,
                'type': 'deep_dive',
                'difficulty': 'hard',
                'question': 'Great explanation. To push further: how would you maintain cache invalidation and data consistency across read replicas during network partitions or split-brain scenarios?',
                'context': 'High-performance follow-up probing distributed consistency and cache invalidation.',
                'expected_points': ['Cache-aside with TTL vs write-through', 'Eventual consistency guarantees', 'Quorum consensus / Raft']
            }
        elif 'api' in ans_lower or 'service' in ans_lower or 'microservice' in ans_lower:
            return {
                'is_follow_up': True,
                'type': 'deep_dive',
                'difficulty': 'hard',
                'question': 'You mentioned a microservices/API approach. How do you handle distributed tracing, idempotent request retries, and cascading failure isolation when downstream services time out?',
                'interviewer_intent': 'Assesses enterprise microservice resiliency and idempotency keys.',
                'expected_points': ['Idempotency keys on POST requests', 'Distributed trace context propagation', 'Circuit breakers like Resilience4j / Polly']
            }
        elif cat == 'behavioral':
            return {
                'is_follow_up': True,
                'type': 'deep_dive',
                'difficulty': 'medium',
                'question': 'Looking back on that outcome, what was the long-term impact on your relationship with that teammate, and how did that experience change how you structure technical proposals today?',
                'interviewer_intent': 'Evaluates emotional maturity and long-term interpersonal growth.'
            }
        else:
            return {
                'is_follow_up': True,
                'type': 'deep_dive',
                'difficulty': 'hard',
                'question': 'Excellent technical depth. Now, if this solution needed to operate under extreme concurrency with zero downtime deployments, what specific telemetry metrics would you alert on?',
                'interviewer_intent': 'Tests production observability and alerting thresholds.'
            }
            
    # Weak answer (< 55%): simplify and provide guidance to test fundamentals
    elif score < 55.0:
        if cat in ['technical', 'scenario']:
            return {
                'is_follow_up': True,
                'type': 'clarification',
                'difficulty': 'easy',
                'question': 'Let us break this down into a simpler case. What would be the very first command, log file, or metric you would inspect to isolate where the problem originates?',
                'interviewer_intent': 'Provides structured scaffolding to evaluate root-cause triage fundamentals.'
            }
        elif cat == 'behavioral':
            return {
                'is_follow_up': True,
                'type': 'clarification',
                'difficulty': 'easy',
                'question': 'To help us understand your direct contribution: what was your exact personal role and the specific decision you made in that scenario?',
                'interviewer_intent': 'Clarifies personal ownership versus team background.'
            }
        else:
            return {
                'is_follow_up': True,
                'type': 'clarification',
                'difficulty': 'easy',
                'question': 'Can you share an example from your past work or education that illustrates the main principle behind this question?',
                'interviewer_intent': 'Encourages the candidate to ground their thoughts in a concrete past experience.'
            }
            
    return None

def evaluate_interview_answer(
    question: str,
    answer: str,
    category: str = 'technical',
    target_role: str = '',
    job_requirements: dict = None
) -> dict:
    if not answer or len(answer.strip()) < 10:
        return {
            'overall_score': 20.0,
            'technical_knowledge': 15.0,
            'communication': 25.0,
            'answer_relevance': 20.0,
            'completeness': 15.0,
            'confidence': 25.0,
            'technical_depth': 15.0,
            'star_breakdown': {'situation': False, 'task': False, 'action': False, 'result': False, 'score': 0.0},
            'feedback_summary': 'Response is critically brief. Please expand with concrete technical decisions, actions you personally took, and measurable results.',
            'strengths': ['Initial response submitted'],
            'weak_areas': ['Lacks technical depth, detail, and structural explanation'],
            'improvements': [
                'Use the STAR structure (Situation, Task, Action, Result)',
                'Specify exact tools, libraries, or architecture patterns utilized',
                'Include quantifiable outcomes (e.g., reduced latency by 35%, scaled to 10k users)'
            ],
            'suggested_answer': 'A high-impact answer clearly frames the problem context, details the specific engineering trade-offs, and highlights measurable results.'
        }
        
    ans_text = answer.strip()
    words = ans_text.split()
    word_count = len(words)
    ans_lower = ans_text.lower()
    q_lower = (question or '').lower()
    
    # 1. Depth & Elaboration Score (0 - 100)
    if word_count >= 100: depth_score = 95.0
    elif word_count >= 70: depth_score = 88.0
    elif word_count >= 45: depth_score = 75.0
    elif word_count >= 25: depth_score = 55.0
    elif word_count >= 15: depth_score = 35.0
    else: depth_score = 20.0
    
    # 2. Vocabulary, Action Verbs, and Metrics Detection
    action_verbs = ['implemented', 'architected', 'optimized', 'designed', 'engineered', 'deployed', 'resolved', 'analyzed', 'refactored', 'migrated', 'automated', 'led', 'configured']
    action_matches = [v for v in action_verbs if v in ans_lower]
    has_action = len(action_matches) > 0
    
    metrics_matches = re.findall(r'\b\d+(?:\.\d+)?%|\$\d+|\b\d{2,}\b|seconds|ms|queries|requests|hours|users|gb|mb', ans_lower)
    has_metrics = len(metrics_matches) > 0
    
    tech_keywords = ['api', 'database', 'sql', 'cache', 'redis', 'kafka', 'latency', 'scale', 'microservice', 'docker', 'kubernetes', 'cloud', 'aws', 'python', 'react', 'model', 'pipeline', 'query', 'index', 'testing', 'component', 'concurrency', 'security', 'monitoring', 'metrics', 'schema', 'dataframe', 'dax', 'feature', 'git']
    tech_matches = [k for k in tech_keywords if k in ans_lower]
    
    # 3. STAR Framework Evaluation
    has_situation = any(w in ans_lower for w in ['situation', 'when', 'at my', 'in our', 'faced with', 'project', 'client', 'company'])
    has_task = any(w in ans_lower for w in ['task', 'goal', 'needed to', 'responsible for', 'required to', 'objective'])
    has_action = any(w in ans_lower for w in ['action', 'i did', 'i decided', 'i built', 'i wrote', 'i analyzed', 'i implemented', 'we created', 'i chose'])
    has_result = any(w in ans_lower for w in ['result', 'outcome', 'impact', 'finally', 'led to', 'reduced', 'increased', 'achieved', 'successfully'])
    
    star_points = sum([has_situation, has_task, has_action, has_result])
    star_score = round((star_points / 4.0) * 100.0, 1)
    star_breakdown = {
        'situation': has_situation,
        'task': has_task,
        'action': has_action,
        'result': has_result,
        'score': star_score
    }
    
    # 4. Communication & Clarity
    if word_count < 15:
        communication_score = 40.0
    elif word_count < 30:
        communication_score = 60.0
    else:
        communication_score = 80.0
        sentence_count = len(re.findall(r'[.!?]', ans_text))
        if sentence_count >= 4: communication_score += 10
        elif sentence_count >= 2: communication_score += 5
    
    fillers = ['um', 'uh', 'like you know', 'kind of sort of', 'dunno']
    filler_count = sum(ans_lower.count(f) for f in fillers)
    if filler_count > 0:
        communication_score -= min(25.0, filler_count * 8.0)
    communication_score = max(20.0, min(98.0, communication_score))
    
    # 5. Technical Accuracy & Relevance (dynamically baseline based on content)
    if len(tech_matches) == 0 and not has_action and word_count < 25:
        relevance_score = 25.0
    elif len(tech_matches) == 0:
        relevance_score = 45.0
    elif len(tech_matches) == 1:
        relevance_score = 60.0
    elif len(tech_matches) >= 3:
        relevance_score = 85.0
    else:
        relevance_score = 75.0
        
    if has_action: relevance_score += 7.0
    if has_metrics: relevance_score += 8.0
    
    q_words = set(re.findall(r'[a-zA-Z]{4,}', q_lower))
    overlap = len(q_words.intersection(set(re.findall(r'[a-zA-Z]{4,}', ans_lower))))
    if overlap >= 2: relevance_score += 5.0
    relevance_score = max(20.0, min(98.0, relevance_score))
    
    # 6. Confidence Score
    confidence_score = 75.0
    if has_action and has_metrics: confidence_score += 12.0
    hesitant_terms = ["don't know", 'dont know', 'not sure', 'i guess', 'maybe', 'probably not', 'might be wrong', 'could be wrong']
    if any(h in ans_lower for h in hesitant_terms):
        confidence_score -= 35.0
    if word_count < 15:
        confidence_score -= 20.0
    confidence_score = max(15.0, min(98.0, confidence_score))
    
    # Weighted overall score based on category
    if category == 'behavioral':
        overall = (star_score * 0.40) + (communication_score * 0.25) + (depth_score * 0.20) + (confidence_score * 0.15)
    elif category == 'technical':
        overall = (relevance_score * 0.35) + (depth_score * 0.30) + (communication_score * 0.20) + (confidence_score * 0.15)
    elif category == 'project':
        overall = (relevance_score * 0.30) + (depth_score * 0.30) + (star_score * 0.20) + (confidence_score * 0.20)
    else:
        overall = (relevance_score * 0.30) + (communication_score * 0.30) + (depth_score * 0.25) + (confidence_score * 0.15)
        
    overall = round(max(15.0, min(98.0, overall)), 1)
    
    strengths = []
    if len(tech_matches) >= 2:
        strengths.append(f"Strong technical vocabulary: effectively referenced {', '.join(tech_matches[:3])}.")
    if has_metrics:
        strengths.append(f"Excellent quantitative grounding: included verifiable metrics ({', '.join(metrics_matches[:2])}).")
    if has_action:
        strengths.append("Clear demonstration of personal agency and engineering ownership.")
    if star_points >= 3:
        strengths.append("Well-structured narrative sequencing following the STAR framework.")
    if not strengths:
        strengths.append("Direct response that addresses the core premise of the question.")
        
    weak_areas = []
    improvements = []
    if not has_metrics:
        weak_areas.append("Lacks quantified outcomes or measurable impact metrics.")
        improvements.append("Include specific numerical metrics (e.g. 'reduced latency by 45%', 'managed 500k requests/day').")
    if word_count < 50:
        weak_areas.append("Explanation is relatively brief.")
        improvements.append("Elaborate on the architectural alternatives considered and trade-offs made.")
    if star_points < 3 and category in ['behavioral', 'project', 'scenario']:
        weak_areas.append("STAR structure is incomplete (missing distinct Action or Result details).")
        improvements.append("Frame your answer with clear Situation, Task, your specific Action, and the final business Result.")
        
    return {
        'overall_score': overall,
        'technical_knowledge': round(relevance_score, 1),
        'communication': round(communication_score, 1),
        'answer_relevance': round(relevance_score, 1),
        'completeness': round(depth_score, 1),
        'confidence': round(confidence_score, 1),
        'technical_depth': round((relevance_score + depth_score) / 2.0, 1),
        'star_breakdown': star_breakdown,
        'feedback_summary': (
            f"Overall response score is {overall}%. " + (
                "Outstanding articulation with deep technical rationale and measurable impact." if overall >= 85 else
                "Strong answer demonstrating good engineering grasp and practical experience." if overall >= 70 else
                "Solid foundational response with clear opportunities to add quantified outcomes and deeper trade-offs." if overall >= 55 else
                "Answer requires greater technical depth, concrete examples, and structured execution details."
            )
        ),
        'strengths': strengths[:3],
        'weak_areas': weak_areas[:3] or ["None noted; strong well-rounded answer."],
        'improvements': improvements[:3] or ["Continue articulating architectural trade-offs to demonstrate senior engineering maturity."],
        'suggested_answer': "To elevate your answer to top-percentile tier, explicitly highlight the engineering trade-offs you evaluated, the metric improvements achieved, and how your solution scaled over time."
    }

def compile_interview_report(
    session_questions: list,
    session_answers: list,
    session_evaluations: list,
    target_role: str = 'Software Engineer'
) -> dict:
    if not session_evaluations:
        return {
            'overall_score': 0.0,
            'readiness_level': 'Not Ready',
            'category_scores': {},
            'strengths': [],
            'weak_areas': [],
            'recommendations': []
        }
        
    scores = [float(e.get('overall_score', 0)) for e in session_evaluations]
    overall = round(sum(scores) / max(1, len(scores)), 1)
    
    if overall >= 85.0: readiness = 'Highly Ready'
    elif overall >= 70.0: readiness = 'Ready'
    elif overall >= 55.0: readiness = 'Needs Improvement'
    else: readiness = 'Not Ready'
    
    tech_scores = [float(e.get('technical_knowledge', 0)) for e in session_evaluations]
    comm_scores = [float(e.get('communication', 0)) for e in session_evaluations]
    depth_scores = [float(e.get('technical_depth', 0)) for e in session_evaluations]
    conf_scores = [float(e.get('confidence', 0)) for e in session_evaluations]
    
    cat_scores = {
        'technical_knowledge': round(sum(tech_scores) / max(1, len(tech_scores)), 1),
        'communication': round(sum(comm_scores) / max(1, len(comm_scores)), 1),
        'problem_solving': round((sum(tech_scores) + sum(depth_scores)) / (2 * max(1, len(tech_scores))), 1),
        'project_understanding': round(sum(depth_scores) / max(1, len(depth_scores)), 1),
        'behavioral': round((sum(comm_scores) + sum(conf_scores)) / (2 * max(1, len(comm_scores))), 1),
        'role_fit': overall
    }
    
    all_strengths = []
    all_weak_areas = []
    all_improvements = []
    
    for e in session_evaluations:
        all_strengths.extend(e.get('strengths', []))
        all_weak_areas.extend(e.get('weak_areas', []))
        all_improvements.extend(e.get('improvements', []))
        
    unique_strengths = list(dict.fromkeys(all_strengths))[:4]
    unique_weak_areas = list(dict.fromkeys(all_weak_areas))[:4]
    unique_recommendations = list(dict.fromkeys(all_improvements))[:4]
    
    return {
        'overall_score': overall,
        'readiness_level': readiness,
        'category_scores': cat_scores,
        'strengths': unique_strengths,
        'weak_areas': unique_weak_areas,
        'recommendations': unique_recommendations
    }
