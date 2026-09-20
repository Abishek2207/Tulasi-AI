from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any, Optional, List

from app.core.config import settings
from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User
from sqlmodel import Session
from app.core.ai_router import resilient_ai_response

router = APIRouter()

MOCK_PROJECTS = {
    "frontend": {
        "title": "AuraStream: Real-time Data Visualization Dashboard",
        "problem": "Most monitoring tools struggle to handle high-throughput burst traffic in microservices without dropping events. Scaling traditional relational databases for time-series event ingestion leads to severe latency bottlenecks and high infrastructure costs.",
        "pitch": "I built AuraStream, a real-time data visualization dashboard that visualizes high-throughput data streams with sub-second latency.",
        "features": [
            "Real-time event processing and visualization.",
            "Time-series data persistence utilizing ClickHouse for sub-second analytical queries.",
            "WebSocket-based React dashboard for live metrics visualization (e.g., P99 latency, request volume).",
            "Dockerized architecture."
        ],
        "stack": [
            { "category": "Frontend", "tools": ["Next.js", "TailwindCSS", "Recharts", "Socket.io-client"] },
            { "category": "Backend", "tools": ["Node.js (Dashboard API)"] }
        ],
        "architecture": "The Node.js Dashboard API queries ClickHouse and streams live updates to the React frontend via WebSockets.",
        "schema": [
            { "table": "events_raw (ClickHouse)", "fields": ["event_id (UUID)", "timestamp (DateTime)", "service_name (String)", "metric_type (Enum)", "value (Float64)", "metadata (JSON)"] }
        ],
        "github": "/aurastream\n  /dashboard-api   (Node.js/Express)\n  /web             (Next.js Frontend)\n  README.md",
        "buildPlan": [
            { "phase": "Phase 1: Real-time Dashboard", "tasks": ["Build Node.js API.", "Setup WebSocket server for pushing updates.", "Create React frontend with Recharts to visualize the data stream."] },
            { "phase": "Phase 2: Deployment", "tasks": ["Write Dockerfiles for all microservices.", "Set up GitHub Actions for automated testing and deployment."] }
        ],
        "resumeTips": [
            "Built a real-time observability dashboard using React and WebSockets, providing sub-second visibility into microservice health and P99 latency."
        ]
    },
    "backend": {
        "title": "AuraStream: Distributed Event-Sourcing Metrics Aggregator",
        "problem": "Most monitoring tools struggle to handle high-throughput burst traffic in microservices without dropping events. Scaling traditional relational databases for time-series event ingestion leads to severe latency bottlenecks and high infrastructure costs.",
        "pitch": "I built AuraStream, a distributed, high-throughput event aggregator capable of processing 10,000+ events per second. It uses a Kafka-based event-sourcing architecture to ingest data, buffers it via Redis, and persists to ClickHouse for lightning-fast time-series analytics.",
        "features": [
            "High-throughput ingestion pipeline using Apache Kafka to prevent dropped events during traffic spikes.",
            "Real-time event processing and buffering using Redis Streams and background workers.",
            "Time-series data persistence utilizing ClickHouse for sub-second analytical queries.",
            "Dockerized microservices architecture deployed on AWS ECS with automated CI/CD via GitHub Actions."
        ],
        "stack": [
            { "category": "Backend", "tools": ["Golang (Ingestion API)", "Node.js (Dashboard API)", "gRPC"] },
            { "category": "Data Layer", "tools": ["Apache Kafka", "Redis", "ClickHouse"] },
            { "category": "Infrastructure", "tools": ["Docker", "AWS ECS", "Terraform", "GitHub Actions"] }
        ],
        "architecture": "Client applications send metrics to a Golang Ingestion API. The API acts as a producer, pushing messages to Kafka topics. A cluster of consumer workers (Golang) read from Kafka, aggregate data in memory, and batch-write to ClickHouse.",
        "schema": [
            { "table": "events_raw (ClickHouse)", "fields": ["event_id (UUID)", "timestamp (DateTime)", "service_name (String)", "metric_type (Enum)", "value (Float64)", "metadata (JSON)"] },
            { "table": "metrics_aggregated (ClickHouse MV)", "fields": ["timestamp_minute (DateTime)", "service_name (String)", "avg_latency (Float64)", "p99_latency (Float64)", "request_count (Int64)"] }
        ],
        "github": "/aurastream\n  /ingestion-api   (Golang)\n  /workers         (Golang consumers)\n  /dashboard-api   (Node.js/Express)\n  /infra           (Terraform & Docker Compose)\n  docker-compose.yml\n  README.md",
        "buildPlan": [
            { "phase": "Phase 1: Local Infrastructure", "tasks": ["Write docker-compose.yml for Kafka, Zookeeper, Redis, and ClickHouse.", "Verify connectivity between containers."] },
            { "phase": "Phase 2: Ingestion & Queuing", "tasks": ["Build Golang REST API to accept POST /metrics.", "Implement Kafka Producer to publish received metrics to 'raw_metrics' topic.", "Load test API to 5k RPS using Apache JMeter/k6."] },
            { "phase": "Phase 3: Processing & Persistence", "tasks": ["Build Golang Consumer to read from Kafka.", "Design ClickHouse schema and Materialized Views for time-series aggregation.", "Implement batch-writing logic from Consumer to ClickHouse."] },
            { "phase": "Phase 4: Deployment", "tasks": ["Write Dockerfiles for all microservices.", "Write Terraform scripts to provision AWS ECS and RDS.", "Set up GitHub Actions for automated testing and deployment."] }
        ],
        "resumeTips": [
            "Architected and deployed a distributed event-sourcing metrics aggregator capable of processing 10,000+ events/sec using Golang and Apache Kafka.",
            "Reduced analytical query latency by 85% by migrating from PostgreSQL to ClickHouse and implementing Materialized Views for time-series data."
        ]
    }
}

class ProjectBlueprintRequest(BaseModel):
    role: str
    level: str

@router.post("/generate")
def generate_project_blueprint(
    req: ProjectBlueprintRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    prompt = f"""You are an elite Staff Engineer architecting a complex, portfolio-worthy project.
The user wants to build a project for a "{req.role}" role at a "{req.level}" skill level.
The project should be unique and highly technical, avoiding cliché ideas.

Output strictly as a valid JSON object matching this exact schema:
{{
  "title": "Project Name: Subtitle",
  "problem": "The complex engineering problem this project solves.",
  "pitch": "A 30-second elevator pitch describing the project and its value.",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "stack": [
    {{ "category": "Category Name", "tools": ["Tool 1", "Tool 2"] }}
  ],
  "architecture": "A brief description of the architecture and data flow.",
  "schema": [
    {{ "table": "Table Name", "fields": ["field1 (Type)", "field2 (Type)"] }}
  ],
  "github": "A simple text representation of the expected GitHub repository structure.",
  "buildPlan": [
    {{ "phase": "Phase Name", "tasks": ["Task 1", "Task 2"] }}
  ],
  "resumeTips": [
    "A strong resume bullet point highlighting the technical achievement."
  ]
}}

Return ONLY raw JSON, nothing else."""

    fallback_data = MOCK_PROJECTS.get(req.role, MOCK_PROJECTS["backend"])
    
    project_data = resilient_ai_response(prompt, fallback=fallback_data)
    
    return {"success": True, "blueprint": project_data}
