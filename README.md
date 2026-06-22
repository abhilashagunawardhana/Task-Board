# Premium Task Board - Monorepo Infrastructure

An enterprise-grade, containerized Full-Stack Task Board application built on a monorepo architecture. This project serves as a showcase for modern DevOps paradigms, featuring automated path-filtered continuous integration (CI) and secure continuous deployment (CD) onto an Azure Ubuntu VM via Docker Compose.

---

## 🏗️ System Architecture & Workflow Diagram

The diagram below maps the complete lifecycle of a code change, from a local push on a development machine through parallel build validation pipelines in GitHub Actions, culminating in an automated rolling deployment on a remote cloud server.

```text
                     [ Developer Workspace ]
                                │
                       git push origin main
                                │
                                ▼
                     [ GitHub Remote Repo ]
                                │
                                ▼ Triggers
               ┌─────────────────────────────────┐
               │     GitHub Actions Runner       │
               │                                 │
               │   1. Path-Based Job Filter      │
               │      (dorny/paths-filter)       │
               └──────┬───────────────────┬──────┘
                      │                   │
             backend  │                   │  frontend
             changed  ▼                   ▼  changed
        ┌─────────────┴──────────┐   ┌────┴────────────────────┐
        │  2. Backend Pipeline   │   │  3. Frontend Pipeline   │
        │     (Parallel check)   │   │     (Parallel check)    │
        │                        │   │                         │
        │   a. backend-checks    │   │   a. frontend-checks    │
        │      (lint/test/audit) │   │      (lint/test)        │
        │          │             │   │          │              │
        │          ▼             │   │          ▼              │
        │   b. backend-build     │   │   b. frontend-build     │
        │      (Docker build)    │   │      (npm build check)  │
        └──────────┬─────────────┘   └──────────┬──────────────┘
                   │                            │
                   └─────────────┬──────────────┘
                                 │
                                 ▼ Needs (Active Passes Only)
                 ┌───────────────┴──────────────┐
                 │    4. deploy-production      │
                 │     (appleboy/ssh-action)    │
                 └───────────────┬──────────────┘
                                 │
                                 ├─► SSH Connects via Key (.pem)
                                 │
                                 ▼
                     [ Azure Ubuntu VM Node ]
           ┌──────────────────────────────────────────┐
           │ Docker Compose                           │
           │                                          │
           │  ├── Frontend Container (Nginx Port 80)  │
           │  │    │                                  │
           │  │    │ (Fetches API via User Browser)   │
           │  │    ▼                                  │
           │  └── Backend Container (Express Port 5000)
           └──────────────────────────────────────────┘
```

---

## 🛠️ DevOps Paradigms & CI/CD Pipeline

The integration and delivery configurations are managed in [.github/workflows/ci-cd.yml](file://./.github/workflows/ci-cd.yml).

### 1. Path-Targeted Triggers
To optimize GitHub Actions runner usage, the pipeline implements **path filtering** using `dorny/paths-filter`. 
* If commits contain updates *only* inside the `backend/` directory, the frontend testing and build compilation pipelines are skipped.
* If commits contain updates *only* inside the `frontend/` directory, the backend linting, testing, and container build steps are skipped.
* If root configurations (like `docker-compose.yml` or the workflow file itself) are modified, both workflows execute to guarantee integrity.

### 2. Parallel Check Architecture
The CI checks for backend and frontend run **concurrently** on separate virtual host machines.
* **Backend Checks**: Installs dependencies via `npm ci` (using locks for determinism) and runs linting (`eslint`), unit testing (`jest`), and security auditing (`npm audit`) in parallel to the frontend checks.
* **Frontend Checks**: Executes style linting and Jest component suites asynchronously.
* **Dependent Build Checks**: Build jobs (`backend-build` and `frontend-build`) run only if their respective check jobs pass successfully.

### 3. Automated Rolling CD Deployment
The deployment job (`deploy-production`) triggers securely using `appleboy/ssh-action@master`. 
* **Skip Resilience**: Uses an advanced logical conditional wrapper (`if: always() && ...`) to verify that all *active* pipelines succeeded, while ignoring skipped pipelines.
* **Rolling Updates**: Executes shell scripts on the remote host to fetch git updates (`git pull origin main`) and perform rolling container rebuilds (`docker-compose up --build -d`) in background mode.

---

## ⚙️ Environment Setup & Port Routing

The infrastructure utilizes Docker Compose to organize port mapping and ensure clean network bridges.

### Host Network & Port Mapping
* **Frontend App**: Maps container port `80` (handled internally by Nginx) to host port `80` on the VM.
* **Backend REST API**: Maps container port `5000` (handled internally by Express) to host port `5000`.

### Required GitHub Repository Secrets
To connect the CI/CD pipeline securely to the Azure environment, add the following secrets under your repository's settings:

1. `AZURE_VM_IP`: The public IPv4 address of your Azure VM.
2. `AZURE_VM_USERNAME`: The SSH connection administrator user (`azureuser`).
3. `SSH_PRIVATE_KEY`: The complete plaintext string of your `.pem` SSH private key.
