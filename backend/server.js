const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: "Review CI/CD Workflow", status: "In Progress" },
  { id: 2, title: "Configure GitHub Actions", status: "Todo" },
  { id: 3, title: "Optimize Dockerfile", status: "Done" }
];

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const newTask = {
    id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    status: status || "Todo"
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// For local running
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
