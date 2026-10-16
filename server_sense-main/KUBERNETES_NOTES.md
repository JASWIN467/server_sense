# Kubernetes & CI/CD Development Notes

This file contains the step-by-step notes and concepts discussed for deploying and managing the ServerSense project.

## 1. Kubernetes vs Localhost (Why use Kubernetes?)
Running code locally (`npm run dev`) is best for active development. However, Kubernetes provides enterprise "superpowers" for production environments:
*   **Self-Healing:** If a server pod crashes due to a bug, Kubernetes instantly restarts it.
*   **Scalability:** By changing `replicas: 2`, Kubernetes runs multiple identical copies of your backend and balances traffic.
*   **Zero-Downtime Updates:** Kubernetes performs rolling updates, ensuring users never see a "Site Offline" page during deployments.
*   **Consistency:** The Docker containers ensure the app runs the exact same way on your laptop (via Minikube) as it would on a multi-million dollar Google Cloud cluster.
*(Fun Fact: Major platforms like YouTube, Netflix, Spotify, and Airbnb use Kubernetes or similar container orchestration to manage millions of users!)*

## 2. Minikube Local Deployment Steps
To run the project locally using Minikube on Windows:

1. **Start the cluster:**
   ```bash
   minikube start
   ```
2. **Build Docker images directly into Minikube:**
   ```bash
   minikube image build -t serversense-server:latest ./server
   minikube image build -t serversense-client:latest ./client
   ```
3. **Configure Secrets:**
   Create a `secret.yaml` file in the `k8s/` folder based on the `.example` template. Add your real `MONGODB_URI` and `GEMINI_API_KEY`.
   ```bash
   kubectl apply -f k8s/secret.yaml
   ```
4. **Deploy the application manifests:**
   ```bash
   kubectl apply -f k8s/
   ```
5. **Verify Pods are running:**
   ```bash
   kubectl get pods
   ```
6. **Access the application:**
   Minikube will create a tunnel from your Windows localhost to the cluster's NodePort service.
   ```bash
   minikube service serversense-client-svc
   ```

## 3. Fixing MongoDB "Fail to Fetch" Connection Errors
If your backend logs show an IP Whitelist error from MongoDB Atlas, it means your Minikube cluster (or local terminal) IP is being blocked for security reasons.
**Fix:**
1. Log into MongoDB Atlas.
2. Navigate to **Security -> Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Wait for it to become Active, then restart your server pods.

## 4. GitHub Actions CI/CD Pipeline
CI/CD (Continuous Integration / Continuous Deployment) automates building and pushing your code. 
*   **Location:** `.github/workflows/ci-cd.yml`
*   **Requirements:** You must add `DOCKER_USERNAME` and `DOCKER_PASSWORD` as Repository Secrets in your GitHub repository settings.
*   **Trigger:** Pushing code to the `main` branch automatically provisions a GitHub server, installs dependencies, builds the images, and pushes them to Docker Hub.
