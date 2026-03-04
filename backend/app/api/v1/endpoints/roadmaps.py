from fastapi import APIRouter

router = APIRouter()

ROADMAP_DATA: dict[str, list[dict]] = {
    "ai-ml-engineer": [
        {"id": 1, "title": "Python Fundamentals", "description": "Master Python syntax, data types, OOP, and functional programming."},
        {"id": 2, "title": "NumPy & Pandas", "description": "Data manipulation and numerical computing."},
        {"id": 3, "title": "Statistics & Probability", "description": "Distributions, hypothesis testing, Bayesian thinking."},
        {"id": 4, "title": "Linear Algebra", "description": "Vectors, matrices, eigenvalues, SVD."},
        {"id": 5, "title": "Scikit-Learn (ML Basics)", "description": "Classification, regression, clustering, model evaluation."},
        {"id": 6, "title": "Deep Learning (PyTorch/TF)", "description": "Neural networks, CNNs, RNNs, training loops."},
        {"id": 7, "title": "NLP Fundamentals", "description": "Tokenization, embeddings, sequence models."},
        {"id": 8, "title": "Computer Vision", "description": "Image classification, object detection, segmentation."},
        {"id": 9, "title": "LLMs & Transformers", "description": "Attention mechanisms, GPT, BERT, fine-tuning."},
        {"id": 10, "title": "MLOps & Deployment", "description": "Model serving, Docker, CI/CD for ML."},
    ],
    "fullstack-developer": [
        {"id": 1, "title": "HTML & CSS", "description": "Semantic HTML, Flexbox, Grid, responsive design."},
        {"id": 2, "title": "JavaScript ES6+", "description": "Async/await, closures, prototypes, modules."},
        {"id": 3, "title": "React.js / Next.js", "description": "Components, hooks, SSR, App Router."},
        {"id": 4, "title": "TypeScript", "description": "Type safety, generics, utility types."},
        {"id": 5, "title": "Node.js / Express", "description": "Server-side JavaScript, middleware, routing."},
        {"id": 6, "title": "Databases (SQL, NoSQL)", "description": "PostgreSQL, MongoDB, ORMs."},
        {"id": 7, "title": "REST & GraphQL APIs", "description": "API design, authentication, rate limiting."},
        {"id": 8, "title": "Authentication & Security", "description": "JWT, OAuth, CORS, XSS prevention."},
        {"id": 9, "title": "Cloud & Deployment", "description": "AWS/GCP, Docker, Cloudflare, Vercel."},
        {"id": 10, "title": "System Design", "description": "Load balancing, caching, microservices."},
    ],
    "data-scientist": [
        {"id": 1, "title": "Python for Data Science", "description": "Jupyter, Pandas, Matplotlib."},
        {"id": 2, "title": "Exploratory Data Analysis", "description": "Data cleaning, visualization, correlation."},
        {"id": 3, "title": "Data Visualization", "description": "Seaborn, Plotly, dashboard creation."},
        {"id": 4, "title": "Feature Engineering", "description": "Feature selection, encoding, scaling."},
        {"id": 5, "title": "Supervised Learning", "description": "Linear/logistic regression, trees, SVM."},
        {"id": 6, "title": "Unsupervised Learning", "description": "K-Means, PCA, DBSCAN."},
        {"id": 7, "title": "Time Series Analysis", "description": "ARIMA, Prophet, seasonality."},
        {"id": 8, "title": "Big Data Tools", "description": "Spark, Hadoop, distributed computing."},
        {"id": 9, "title": "Experiment Design (A/B)", "description": "Statistical significance, power analysis."},
        {"id": 10, "title": "Business Intelligence", "description": "KPIs, reporting, stakeholder communication."},
    ],
}

@router.get("/{role}")
async def get_roadmap(role: str):
    """Get role-specific career roadmap tasks."""
    tasks = ROADMAP_DATA.get(role)
    if not tasks:
        available = list(ROADMAP_DATA.keys())
        return {"error": f"Role '{role}' not found. Available: {available}", "available_roles": available}
    return {"role": role, "tasks": tasks, "total": len(tasks)}

@router.get("/")
async def list_roadmaps():
    """List all available roadmap roles."""
    return {
        "roles": [
            {"slug": key, "title": key.replace("-", " ").title(), "task_count": len(tasks)}
            for key, tasks in ROADMAP_DATA.items()
        ]
    }
