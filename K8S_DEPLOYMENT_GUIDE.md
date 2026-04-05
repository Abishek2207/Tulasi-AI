# TulasiAI Kubernetes Deployment Guide

This guide provides step-by-step instructions for deploying the TulasiAI platform to a Kubernetes cluster using the provided YAML manifests.

## Prerequisites

- Access to a Kubernetes cluster (Minikube, KinD, GKE, EKS, Azure AKS, etc.)
- `kubectl` CLI installed and configured.
- Docker or a similar container runtime.
- A container registry (e.g., Docker Hub, GCR) to push your images.

## Step 1: Build and Push Docker Images

Before applying the Kubernetes files, you must build and push the images for the frontend and backend.

```bash
# Build Frontend
cd frontend
docker build -t abishek223/tulasiai-frontend:latest .
docker push abishek223/tulasiai-frontend:latest

# Build Backend
cd ../backend
docker build -t abishek223/tulasiai-backend:latest .
docker push abishek223/tulasiai-backend:latest
```

> [!IMPORTANT]
> **UPDATE IMAGE TAGS**: Open `k8s/frontend-deployment.yaml` and `k8s/backend-deployment.yaml` and replace the image placeholders (`tulasiai-frontend:latest`, `tulasiai-backend:latest`) with your actual registry tags.

## Step 2: Configure Secrets

Update the `tulasi-secrets.yaml` with your actual sensitive keys.

1.  Base64 encode your keys:
    ```bash
    echo -n "your-secret-here" | base64
    ```
2.  Paste the encoded strings into `k8s/tulasi-config.yaml` under the `Secret` section.

## Step 3: Apply YAML Files

Apply the manifests in the following order:

```bash
# 1. Config & Secrets
kubectl apply -f k8s/tulasi-config.yaml

# 2. Infrastructure (DB & Vector Store)
kubectl apply -f k8s/database-deployment.yaml
kubectl apply -f k8s/chromadb-deployment.yaml

# 3. Application (Backend & Frontend)
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

## Step 4: Check Deployment Status

Verify that all pods are running and healthy:

```bash
kubectl get pods -l app=tulasiai -A
# or more broadly
kubectl get pods
```

Check the status of services:
```bash
kubectl get svc
```

## Step 5: Accessing Services Externally

- **Frontend**: Look for the `EXTERNAL-IP` of the `frontend-service`. If using Minikube, run `minikube service frontend-service`.
- **Domain Mapping**: Ensure `www.tulasiai.in` points to the `EXTERNAL-IP` of the `frontend-service`.

## Step 6: Scaling and Maintenance

### Manual Scaling
To scale the frontend or backend manually:
```bash
kubectl scale deployment frontend-deployment --replicas=5
kubectl scale deployment backend-deployment --replicas=3
```

### Checking Logs
If a pod is failing, check the logs:
```bash
kubectl logs <pod-name>
```

### Self-Healing
Kubernetes will automatically restart any pod that fails its liveness probe or crashes. You can simulate this by deleting a pod and watching it reappear:
```bash
kubectl delete pod <pod-name>
kubectl get pods -w
```
