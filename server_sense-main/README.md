# ServerSense

ServerSense is a single-host monitoring demo application that tracks system metrics and automates rule-based remediation. It features an AI diagnostic agent powered by the Gemini API that suggests human-approved resolutions for complex anomalies.

![ServerSense Dashboard Screenshot](<INSERT_SCREENSHOT_OR_GIF_HERE>)

> **Note**: This is a single-host monitoring demo, not a multi-server fleet product. It focuses on deep, intelligent remediation capabilities on a standalone basis.

## Tech Stack
- **MERN Stack**: MongoDB (Atlas), Express.js, React, Node.js
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (Minikube)
- **AI Agent**: Google Gemini API

## Key Features
- **Real-time Metrics**: Monitor system CPU, memory, and custom thresholds.
- **Threshold & Anomaly Alerts**: Instant alerts when system behavior deviates from norms.
- **Rule-based Remediation**: Automated actions triggered by defined alerting conditions.
- **AI Diagnostic Agent**: AI-driven root cause analysis (via Gemini API) providing actionable remediation steps for human approval.
- **Outcome Accuracy Tracking**: Track the historical accuracy of AI resolutions. (Current Model Accuracy: **<INSERT_ACCURACY_NUMBER_HERE>%**)

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Minikube & kubectl
- MongoDB Atlas account (or local MongoDB)
- Gemini API Key

### Local Development (Docker Compose)
1. Clone the repository.
2. In the `server` directory, create a `.env` file containing your environment variables (`MONGO_URI`, `PORT`, `GEMINI_API_KEY`).
3. Run `docker-compose up --build` from the root directory to start the React client and Node server.

### Kubernetes Deployment (Minikube)
1. Start Minikube: `minikube start`
2. Build images locally into the Minikube environment:
   ```bash
   eval $(minikube docker-env)
   docker build -t serversense-server:latest ./server
   docker build -t serversense-client:latest ./client
   ```
3. Prepare your secrets by copying the template and adding your real values:
   ```bash
   cp k8s/secret.yaml.example k8s/secret.yaml
   # Edit k8s/secret.yaml with real secrets (DO NOT COMMIT THIS FILE)
   ```
4. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/
   ```
5. Access the application:
   ```bash
   minikube service serversense-client-svc
   ```
