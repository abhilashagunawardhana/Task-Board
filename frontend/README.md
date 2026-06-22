# Task Board Frontend Web UI

A responsive single-page React application built with Create React App (CRA) architecture. The client-side dashboard renders columns for task management (Todo, In Progress, Done) and integrates fetching structures to communicate with the REST API.

---

## 🛠️ Technology Stack & Styling

* **Framework**: React v18.
* **Build System**: `react-scripts` (CRA toolchain).
* **Styling**: Premium custom CSS utilizing HSL color slate palettes, glassmorphism card panels, flexible grids, and subtle keyframe entry micro-animations.
* **Testing**: React Testing Library + Jest with mock global fetch interfaces.

---

## 📂 Package Script Hooks

* **Development Start**: `npm start` -> Launches local webpack server at `http://localhost:3000`.
* **Code Linting**: `npm run lint` -> Invokes ESLint to verify Javascript rules inside `/src`.
* **Testing Suite**: `npm test` -> Runs Jest unit tests to verify element mounts and UI actions.
* **Static Compilation**: `npm run build` -> Compiles production-optimized HTML, CSS, and JS files into the `/build` folder.

---

## ⚙️ Container Environment Specification ([Dockerfile](file://./Dockerfile))

The frontend image uses a multi-stage Docker setup:
* **Stage 1 (Build)**: Sets up Node.js, installs dependencies (`npm ci`), injects the `REACT_APP_API_URL` build-time environment variable, and runs `npm run build` to generate static compilation directories.
* **Stage 2 (Nginx)**: Pulls a lightweight Nginx alpine image, copies the static `/build` files from Stage 1 into Nginx's HTML direct serving directory (`/usr/share/nginx/html`), exposes port `80`, and runs Nginx in the foreground.

---

## 🔌 Client-Side Network Bridging & Dynamic API Target

Because React components compile down to static HTML and JavaScript assets running directly in the end-user's browser, hardcoded API endpoints will fail when deployed to a remote cloud machine.

To enable cross-container communication in any environment without rebuilds, [App.js](file://./src/App.js) implements dynamic API hostname resolution:

```javascript
const getApiUrl = () => {
  // If a specific remote API URL is baked in during building (CI/CD), prioritize it
  if (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('localhost')) {
    return process.env.REACT_APP_API_URL;
  }
  // Otherwise, dynamically fetch the hostname of the server serving the HTML
  const hostname = typeof window !== 'undefined' && window.location && window.location.hostname
    ? window.location.hostname
    : 'localhost';
  return `http://${hostname}:5000/api/tasks`;
};
```

### How this works:
1. **Local Development**: If running the React dev server locally, the window hostname is `localhost`, so fetch calls hit `http://localhost:5000/api/tasks`.
2. **Cloud Deployments**: If accessed on a remote VM at `http://13.90.120.45`, the window hostname becomes `13.90.120.45`. The browser dynamically routes fetch calls to `http://13.90.120.45:5000/api/tasks` without requiring configuration.
3. **Domain Mapping**: If mapped to a custom domain (e.g. `http://my-tasks.com`), it targets `http://my-tasks.com:5000/api/tasks`.
