// Import external dependencies
const express = require("express");
const cors = require("cors");

// Initialize the Express application instance
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so that frontend running on other ports/domains can access the API
app.use(cors());

// Middleware to parse incoming JSON request bodies (e.g. in POST requests)
app.use(express.json());

// In-memory tasks database initialized with sample developer workflows
let tasks = [
  { id: 1, title: "Review CI/CD Workflow", status: "In Progress" },
  { id: 2, title: "Configure GitHub Actions", status: "Todo" },
  { id: 3, title: "Optimize Dockerfile", status: "Done" }
];

// HTTP GET /api/tasks: Returns the full list of tasks as a JSON array
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// HTTP POST /api/tasks: Adds a new task to the in-memory array and returns it
app.post("/api/tasks", (req, res) => {
  const { title, status } = req.body;
  
  // Validation check: Title is mandatory for task creation
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  // Create task payload; dynamically increment ID and default status to 'Todo'
  const newTask = {
    id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    status: status || "Todo"
  };
  
  tasks.push(newTask);
  
  // Respond with HTTP 201 Created and the new task object
  res.status(201).json(newTask);
});

// Start the Express listener only if the environment is not a Jest test runner.
// This prevents Jest tests from leaving open port handlers or crashing due to 'Port in use' errors.
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app instance so it can be imported in the test suites
module.exports = app;
