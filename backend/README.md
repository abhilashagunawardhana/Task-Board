# Task Board Backend API Service

A lightweight, robust REST API built with Node.js and Express. The backend acts as an isolated microservice, storing tasks in-memory and exposing REST endpoints for the client-side user interface.

---

## 🛠️ Tech Stack & Isolation

* **Engine**: Node.js v24 (Alpine-based Linux environment for containerization).
* **Framework**: Express.js for REST router management.
* **Testing**: Jest + Supertest for functional integration testing.
* **Linting**: ESLint v9 (Flat Configuration).

---

## 📂 Package Script Hooks

The backend package definition incorporates hooks to validate code quality before container compilation:

* **Linting**: `npm run lint` -> Analyzes code using ESLint configs to maintain style integrity.
* **Unit Testing**: `npm test` -> Runs Jest against the endpoint test suite (`server.test.js`) in isolated environments.
* **Security Scans**: `npm run audit` -> Executes npm vulnerability assessments, filtering for high/critical security advisories to block vulnerable container builds.

---

## ⚙️ Container Environment Specification ([Dockerfile](file://./Dockerfile))

The service runs inside a multi-stage Docker environment:
* **Stage 1 (Builder)**: Installs development and production dependencies (`npm ci`) and copies the workspace code to run linting and unit test cycles.
* **Stage 2 (Runtime)**: Provisions a fresh, minimal Node 24 alpine image, copies only the runtime source (`server.js`) and production dependencies (excluding test libraries), sets `ENV NODE_ENV=production`, and exposes port `5000`. This reduces container footprint size and limits attack vectors.

---

## 🔌 API Endpoints & Routes

The Express application exposes the following endpoints under the `/api/tasks` root route:

### 1. Retrieve Tasks
* **Route**: `GET /api/tasks`
* **Response Status**: `200 OK`
* **Output Payload**: An array of task objects.
  ```json
  [
    { "id": 1, "title": "Configure GitHub Actions", "status": "Todo" }
  ]
  ```

### 2. Create Task
* **Route**: `POST /api/tasks`
* **Headers**: `Content-Type: application/json`
* **Input Payload**: JSON object containing `title` (required) and `status` (optional).
  ```json
  { "title": "Set up VM networking", "status": "In Progress" }
  ```
* **Response Status**: `201 Created` (if successful) or `400 Bad Request` (if title parameter is missing).

---

## 🔒 Cross-Origin Resource Sharing (CORS) Configuration

In a cloud container layout, the frontend is loaded into the user's browser from port `80`, while the backend API runs on port `5000`. By default, browsers block XMLHttpRequests (like fetch or axios) directed at a port or domain different from the origin page (Same-Origin Policy).

To bypass this restriction securely, the API configures CORS middleware:
```javascript
const cors = require("cors");
app.use(cors());
```
This injects the `Access-Control-Allow-Origin: *` response header, signaling the browser that it is safe to accept responses and perform CRUD actions from the client web page.
