ROADMAPS = [
  {
    "id": "swe", "title": "Software Engineer", "icon": "💻", "color": "#4ECDC4",
    "desc": "The standard path to becoming a generalist SWE at top tech companies.",
    "skills": ["Data Structures & Algorithms", "System Design", "Backend APIs", "Frontend Basics", "Databases (SQL/NoSQL)", "Cloud Fundamentals"],
    "projects": ["RESTful API with JWT auth", "Full-stack E-commerce store", "Real-time chat application", "CLI tool with testing"],
    "coding": ["LeetCode Blind 75", "Arrays & Hashing", "Two Pointers", "Sliding Window", "Binary Search", "Trees & Graphs"],
    "interview_tips": ["STAR method stories", "LeetCode Medium daily", "System design concepts", "Behavioral questions prep"],
    "milestones": [
      { "id": "swe-1", "name": "Master core language (Python/Java/C++)", "duration": "1 month" },
      { "id": "swe-2", "name": "Complete LeetCode Blind 75", "duration": "2 months" },
      { "id": "swe-3", "name": "Build 2 full-stack projects", "duration": "1.5 months" },
      { "id": "swe-4", "name": "Study System Design (Grokking)", "duration": "3 weeks" },
      { "id": "swe-5", "name": "Mock Interviews & Apply", "duration": "Ongoing" }
    ]
  },
  {
    "id": "ai", "title": "AI Engineer", "icon": "🤖", "color": "#6C63FF",
    "desc": "Build LLMs, RAG architectures, and production AI pipelines.",
    "skills": ["Python", "PyTorch / TensorFlow", "Vector Databases", "LangChain", "Hugging Face", "Prompt Engineering"],
    "projects": ["Document Q&A bot (RAG)", "Image classification pipeline", "Custom fine-tuned LLM", "AI-powered chatbot"],
    "coding": ["Python mastery", "NumPy & Pandas", "Linear Algebra basics", "API integration", "FastAPI"],
    "interview_tips": ["LLM architecture depth", "RAG vs fine-tuning tradeoffs", "Deployment & scaling ML", "MLOps concepts"],
    "milestones": [
      { "id": "ai-1", "name": "Linear Algebra & Probability", "duration": "3 weeks" },
      { "id": "ai-2", "name": "ML Algorithms (Scikit-learn)", "duration": "1 month" },
      { "id": "ai-3", "name": "Deep Learning basics (PyTorch)", "duration": "1 month" },
      { "id": "ai-4", "name": "LLMs, Transformers & Prompt Engineering", "duration": "1 month" },
      { "id": "ai-5", "name": "Deploy full RAG application", "duration": "1 month" }
    ]
  },
  {
    "id": "ml", "title": "ML Engineer", "icon": "📊", "color": "#FF6B9D",
    "desc": "Focus on production machine learning pipelines and model deployment.",
    "skills": ["Python", "Scikit-learn", "PyTorch/TF", "MLflow", "Kubeflow", "Spark", "Feature Engineering"],
    "projects": ["End-to-end ML pipeline", "A/B testing system", "Recommendation engine", "Fraud detection model"],
    "coding": ["Statistics & probability", "Matrix operations", "Pandas", "SQL aggregations", "Docker"],
    "interview_tips": ["Model evaluation metrics", "Feature engineering tricks", "Handling class imbalance", "MLOps tools"],
    "milestones": [
      { "id": "ml-1", "name": "Statistics & Linear Algebra", "duration": "1 month" },
      { "id": "ml-2", "name": "Supervised & Unsupervised Learning", "duration": "1.5 months" },
      { "id": "ml-3", "name": "Feature Engineering & Selection", "duration": "3 weeks" },
      { "id": "ml-4", "name": "Model Deployment (Flask/FastAPI)", "duration": "3 weeks" },
      { "id": "ml-5", "name": "MLOps with MLflow & CI/CD", "duration": "1 month" }
    ]
  },
  {
    "id": "data-scientist", "title": "Data Scientist", "icon": "🔬", "color": "#43E97B",
    "desc": "Derive insights from data and build predictive models for business decisions.",
    "skills": ["Python/R", "SQL", "Statistics", "Machine Learning", "Tableau/Power BI", "A/B Testing"],
    "projects": ["Customer churn prediction", "Sales forecasting dashboard", "Market basket analysis", "Sentiment analysis app"],
    "coding": ["SQL window functions", "Pandas & NumPy", "Data visualization", "Statistical tests", "Jupyter notebooks"],
    "interview_tips": ["Business case studies", "Explain model to non-tech", "Hypothesis testing", "Experimental design"],
    "milestones": [
      { "id": "ds-1", "name": "Statistics & Probability", "duration": "1 month" },
      { "id": "ds-2", "name": "SQL mastery & data manipulation", "duration": "3 weeks" },
      { "id": "ds-3", "name": "Python for Data Science", "duration": "1 month" },
      { "id": "ds-4", "name": "Machine Learning fundamentals", "duration": "1.5 months" },
      { "id": "ds-5", "name": "BI tools & storytelling", "duration": "3 weeks" }
    ]
  },
  {
    "id": "backend", "title": "Backend Developer", "icon": "⚙️", "color": "#FF8E53",
    "desc": "Build robust, scalable server-side applications and APIs.",
    "skills": ["Node.js / Python / Go", "REST & GraphQL", "PostgreSQL / MongoDB", "Redis", "Docker & Kubernetes", "Microservices"],
    "projects": ["Scalable REST API", "Event-driven service (Kafka)", "Multi-tenant SaaS backend", "Rate-limited public API"],
    "coding": ["DSA for backend", "Database design", "Concurrency patterns", "Caching strategies", "Security best practices"],
    "interview_tips": ["System design is critical", "Database normalization", "API versioning", "Security (SQL injection, JWT)"],
    "milestones": [
      { "id": "be-1", "name": "Core language mastery (Python/Node/Go)", "duration": "1.5 months" },
      { "id": "be-2", "name": "Databases: SQL & NoSQL", "duration": "1 month" },
      { "id": "be-3", "name": "REST API Design & Auth (JWT/OAuth)", "duration": "3 weeks" },
      { "id": "be-4", "name": "Caching (Redis) & Queuing (Kafka)", "duration": "1 month" },
      { "id": "be-5", "name": "Docker, CI/CD & Cloud Deploy", "duration": "1 month" }
    ]
  },
  {
    "id": "frontend", "title": "Frontend Developer", "icon": "🎨", "color": "#FF6B6B",
    "desc": "Build beautiful, accessible, and performant user interfaces.",
    "skills": ["HTML/CSS/JS", "React / Next.js", "TypeScript", "State Management", "Web Performance", "Accessibility"],
    "projects": ["Responsive portfolio website", "Dashboard with complex state", "PWA with offline support", "Design system"],
    "coding": ["JavaScript fundamentals", "React patterns", "CSS Grid & Flex", "Browser APIs", "Performance metrics"],
    "interview_tips": ["Virtual DOM explained", "CSS specificity rules", "React hooks internals", "Web vitals (LCP, CLS, FID)"],
    "milestones": [
      { "id": "fe-1", "name": "Advanced JS & DOM Manipulation", "duration": "1 month" },
      { "id": "fe-2", "name": "React fundamentals & Hooks", "duration": "3 weeks" },
      { "id": "fe-3", "name": "Next.js & SSR/SSG", "duration": "1 month" },
      { "id": "fe-4", "name": "CSS mastery (Tailwind, Animations)", "duration": "3 weeks" },
      { "id": "fe-5", "name": "Web Accessibility & Testing", "duration": "3 weeks" }
    ]
  },
  {
    "id": "devops", "title": "DevOps Engineer", "icon": "🔧", "color": "#4ECDC4",
    "desc": "Automate infrastructure, deployments, and ensure system reliability.",
    "skills": ["Linux/Bash", "Docker & Kubernetes", "CI/CD (GitHub Actions)", "Terraform", "AWS/GCP/Azure", "Monitoring (Prometheus)"],
    "projects": ["Full CI/CD pipeline", "K8s deployment with autoscaling", "Infra-as-code with Terraform", "Monitoring dashboard"],
    "coding": ["Bash scripting", "YAML configuration", "Python automation", "SQL for monitoring queries"],
    "interview_tips": ["SRE principles", "DORA metrics", "Blue-green deployments", "Incident management"],
    "milestones": [
      { "id": "devops-1", "name": "Linux fundamentals & Bash scripting", "duration": "1 month" },
      { "id": "devops-2", "name": "Docker & containerization", "duration": "3 weeks" },
      { "id": "devops-3", "name": "Kubernetes orchestration", "duration": "1.5 months" },
      { "id": "devops-4", "name": "CI/CD with GitHub Actions / Jenkins", "duration": "1 month" },
      { "id": "devops-5", "name": "Cloud (AWS/GCP) & Terraform IaC", "duration": "1.5 months" }
    ]
  },
  {
    "id": "cloud", "title": "Cloud Engineer", "icon": "☁️", "color": "#A78BFA",
    "desc": "Architect and manage scalable cloud infrastructure on AWS, GCP, or Azure.",
    "skills": ["AWS / GCP / Azure", "Terraform & CDK", "Serverless (Lambda)", "Networking & VPC", "IAM & Security", "Cost optimization"],
    "projects": ["Multi-region DR setup", "Serverless data pipeline", "Secure VPC architecture", "Cost optimization audit"],
    "coding": ["AWS CLI & SDK", "Python boto3", "Terraform HCL", "CloudFormation"],
    "interview_tips": ["CAP theorem", "Cloud pricing models", "Shared responsibility model", "Well-Architected Framework"],
    "milestones": [
      { "id": "cloud-1", "name": "Cloud fundamentals (AWS/GCP)", "duration": "1 month" },
      { "id": "cloud-2", "name": "Networking: VPC, subnets, routing", "duration": "3 weeks" },
      { "id": "cloud-3", "name": "Compute: EC2, Lambda, ECS", "duration": "1 month" },
      { "id": "cloud-4", "name": "IaC: Terraform & CDK", "duration": "1 month" },
      { "id": "cloud-5", "name": "Cloud Certifications (SAA-C03)", "duration": "2 months" }
    ]
  },
  {
    "id": "cybersec", "title": "Cybersecurity Engineer", "icon": "🛡️", "color": "#EF4444",
    "desc": "Protect systems and data from threats, vulnerabilities, and attacks.",
    "skills": ["Network security", "Penetration testing", "SIEM tools", "Python for security", "Cryptography", "Incident response"],
    "projects": ["Vulnerability scanner", "Honeypot setup", "CTF write-ups", "Security audit report"],
    "coding": ["Python scripting", "Bash for security", "SQL injection", "Regular expressions", "Wireshark"],
    "interview_tips": ["OWASP Top 10", "CIA triad", "Zero-trust architecture", "Common CVEs", "Incident response steps"],
    "milestones": [
      { "id": "cyber-1", "name": "Networking fundamentals (TCP/IP)", "duration": "1 month" },
      { "id": "cyber-2", "name": "Linux security & hardening", "duration": "3 weeks" },
      { "id": "cyber-3", "name": "Ethical hacking basics (CEH/OSCP prep)", "duration": "2 months" },
      { "id": "cyber-4", "name": "Web app security (OWASP)", "duration": "1 month" },
      { "id": "cyber-5", "name": "Security+ or CEH certification", "duration": "2 months" }
    ]
  },
  {
    "id": "pm", "title": "Product Manager", "icon": "📋", "color": "#FFD93D",
    "desc": "Define product vision, strategy, and work with cross-functional teams.",
    "skills": ["Product strategy", "User research", "A/B testing", "Agile / Scrum", "Data analytics", "Stakeholder management"],
    "projects": ["Product requirements doc", "GTM strategy", "Feature prioritization framework", "User journey map"],
    "coding": ["Basic SQL for analytics", "Google Analytics", "Figma for wireframes", "JIRA / Linear"],
    "interview_tips": ["Product sense (design for X)", "Metrics & KPIs", "Estimation questions", "Root cause analysis", "Prioritization frameworks (RICE)"],
    "milestones": [
      { "id": "pm-1", "name": "Product thinking & frameworks (CIRCLES)", "duration": "1 month" },
      { "id": "pm-2", "name": "User research & Jobs-to-be-Done", "duration": "3 weeks" },
      { "id": "pm-3", "name": "Data & metrics (SQL, GA)", "duration": "1 month" },
      { "id": "pm-4", "name": "Agile & working with engineers", "duration": "3 weeks" },
      { "id": "pm-5", "name": "PM interview practice (PM Exercises)", "duration": "1.5 months" }
    ]
  },
  {
    "id": "blockchain", "title": "Blockchain Developer", "icon": "⛓️", "color": "#F59E0B",
    "desc": "Build decentralized applications and smart contracts on blockchain platforms.",
    "skills": ["Solidity", "Ethereum / EVM", "Web3.js / Ethers.js", "Hardhat / Foundry", "DeFi protocols", "IPFS"],
    "projects": ["ERC-20 token", "NFT marketplace", "DeFi lending protocol", "DAO governance contract"],
    "coding": ["Solidity patterns", "Gas optimization", "JavaScript for dApps", "Python for blockchain tools"],
    "interview_tips": ["EVM opcodes", "Reentrancy attacks", "Gas optimization techniques", "DeFi protocol designs"],
    "milestones": [
      { "id": "bc-1", "name": "Blockchain & Ethereum fundamentals", "duration": "3 weeks" },
      { "id": "bc-2", "name": "Solidity programming", "duration": "1.5 months" },
      { "id": "bc-3", "name": "DeFi protocols & tokenomics", "duration": "1 month" },
      { "id": "bc-4", "name": "Security & contract auditing", "duration": "1 month" },
      { "id": "bc-5", "name": "Build & deploy full dApp", "duration": "1.5 months" }
    ]
  },
  {
    "id": "mobile", "title": "Mobile Developer", "icon": "📱", "color": "#10B981",
    "desc": "Build cross-platform or native mobile applications for iOS and Android.",
    "skills": ["React Native / Flutter", "iOS (Swift) or Android (Kotlin)", "REST APIs", "Local storage", "Push notifications", "App Store deployment"],
    "projects": ["Social media app clone", "Fitness tracker", "E-commerce mobile app", "Chat application"],
    "coding": ["JavaScript/Dart fundamentals", "State management (Redux/Provider)", "Native module bridging", "Performance profiling"],
    "interview_tips": ["Native vs cross-platform tradeoffs", "App lifecycle management", "Memory management", "Offline-first patterns"],
    "milestones": [
      { "id": "mob-1", "name": "React Native or Flutter fundamentals", "duration": "1.5 months" },
      { "id": "mob-2", "name": "Navigation & state management", "duration": "1 month" },
      { "id": "mob-3", "name": "Native APIs (camera, GPS, notifications)", "duration": "3 weeks" },
      { "id": "mob-4", "name": "Backend integration & auth", "duration": "3 weeks" },
      { "id": "mob-5", "name": "App Store deployment & analytics", "duration": "2 weeks" }
    ]
  },
  {
    "id": "fullstack", "title": "Full Stack Developer", "icon": "🌐", "color": "#06B6D4",
    "desc": "Build end-to-end web applications across frontend and backend.",
    "skills": ["React/Next.js", "Node.js/Express or FastAPI", "PostgreSQL/MongoDB", "REST APIs", "Docker", "Cloud deployment"],
    "projects": ["SaaS application", "Social platform", "E-commerce with payments", "Real-time collaborative tool"],
    "coding": ["JavaScript (frontend & backend)", "SQL & NoSQL databases", "Authentication flows", "Testing (Jest/Cypress)"],
    "interview_tips": ["Full stack system design", "Database indexing", "Authentication vs Authorization", "SEO & performance"],
    "milestones": [
      { "id": "fs-1", "name": "Frontend: React & Next.js mastery", "duration": "2 months" },
      { "id": "fs-2", "name": "Backend: Node.js/Python APIs", "duration": "1.5 months" },
      { "id": "fs-3", "name": "Databases: PostgreSQL & Redis", "duration": "1 month" },
      { "id": "fs-4", "name": "Auth, Payments, File uploads", "duration": "3 weeks" },
      { "id": "fs-5", "name": "Deploy full app to cloud", "duration": "2 weeks" }
    ]
  },
  {
    "id": "gamedev", "title": "Game Developer", "icon": "🎮", "color": "#8B5CF6",
    "desc": "Create interactive games across PC, mobile, and web platforms.",
    "skills": ["Unity (C#) / Unreal (C++)", "Game design patterns", "Physics engines", "3D math (vectors, matrices)", "Shaders/GLSL", "Multiplayer networking"],
    "projects": ["2D platformer game", "3D FPS prototype", "Mobile casual game", "Multiplayer mini-game"],
    "coding": ["C# for Unity / C++ for Unreal", "Linear algebra", "Design patterns (State, Observer)", "Optimization profiling"],
    "interview_tips": ["Game loop architecture", "ECS pattern", "Networking for games", "Performance & memory for mobile"],
    "milestones": [
      { "id": "gd-1", "name": "Unity/Unreal fundamentals", "duration": "1.5 months" },
      { "id": "gd-2", "name": "2D game: sprites, physics, input", "duration": "1 month" },
      { "id": "gd-3", "name": "3D game: models, lighting, cameras", "duration": "1.5 months" },
      { "id": "gd-4", "name": "Game design & level design", "duration": "3 weeks" },
      { "id": "gd-5", "name": "Polish & publish to store", "duration": "1 month" }
    ]
  },
  {
    "id": "dataeng", "title": "Data Engineer", "icon": "🗄️", "color": "#F97316",
    "desc": "Build and maintain data pipelines, warehouses, and infrastructure at scale.",
    "skills": ["Python", "SQL", "Spark / PySpark", "Airflow / Prefect", "dbt", "Snowflake / BigQuery", "Kafka"],
    "projects": ["ETL pipeline with Airflow", "Real-time streaming with Kafka", "Data warehouse with dbt", "Data quality monitoring system"],
    "coding": ["Advanced SQL", "PySpark transformations", "Python for data pipelines", "Shell scripting"],
    "interview_tips": ["OLTP vs OLAP", "Data modeling (star/snowflake schema)", "Batch vs streaming", "SLAs and data quality"],
    "milestones": [
      { "id": "de-1", "name": "Advanced SQL & relational modeling", "duration": "1 month" },
      { "id": "de-2", "name": "Python for data engineering", "duration": "1 month" },
      { "id": "de-3", "name": "Big Data: Spark & distributed computing", "duration": "1.5 months" },
      { "id": "de-4", "name": "Orchestration: Airflow & dbt", "duration": "1 month" },
      { "id": "de-5", "name": "Streaming: Kafka & real-time pipelines", "duration": "1.5 months" }
    ]
  }
]
