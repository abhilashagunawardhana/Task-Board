import React, { useState, useEffect } from 'react';

// Resolves the backend API endpoint dynamically.
// If an environment variable is set at compile-time to a remote host, we use that.
// Otherwise, we dynamically fetch the VM's hostname (or localhost) from the browser's location bar,
// allowing zero-configuration deployments on any server.
const getApiUrl = () => {
  // Use explicitly set environment variable if it points to a remote IP or domain
  if (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('localhost')) {
    return process.env.REACT_APP_API_URL;
  }
  // Fall back to the hostname of the server serving the frontend
  const hostname = typeof window !== 'undefined' && window.location && window.location.hostname
    ? window.location.hostname
    : 'localhost';
  return `http://${hostname}:5000/api/tasks`;
};

const API_URL = getApiUrl();

function App() {
  // State variables for application management
  const [tasks, setTasks] = useState([]);      // List of tasks from the server
  const [title, setTitle] = useState('');      // Form input for task title
  const [status, setStatus] = useState('Todo'); // Form input for task column/status
  const [error, setError] = useState(null);    // Error messages if backend call fails
  const [loading, setLoading] = useState(true); // Loading spinner toggle

  // Automatically retrieve tasks when the application component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // API Call: Fetch tasks list from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not connect to the backend server. Please verify the API is running.');
    } finally {
      setLoading(false);
    }
  };

  // API Call: Create new task via POST request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      // Append the new task directly to state to update UI immediately without page reload
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTitle('');
      setStatus('Todo');
      setError(null);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  // API Call: Update an existing task's status via PUT request
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      // Update state immediately
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  // API Call: Delete an existing task via DELETE request
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove the task from local state immediately
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      setError(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  // Filter tasks locally by status for each column
  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Task Board</h1>
        <p>Manage and track development workflows in parallel</p>
      </header>

      <div className="form-container">
        <h2 className="form-title">Create New Task</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Write backend tests"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="form-group button-group">
            <button type="submit" className="btn-submit">
              Add Task
            </button>
          </div>
        </form>
        {error && (
          <div style={{ color: '#ef4444', marginTop: '15px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading board tasks...</div>
      ) : (
        <div className="board-grid">
          {/* Todo Column */}
          <div className="board-column todo">
            <div className="column-header">
              <span className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                Todo
              </span>
              <span className="column-badge">{todoTasks.length}</span>
            </div>
            <div className="task-list">
              {todoTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📋</span>
                  <span>No tasks in Todo</span>
                </div>
              ) : (
                todoTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    <div className="task-footer">
                      <span className="task-id">#TSK-{task.id}</span>
                      <span className="task-tag">Todo</span>
                    </div>
                    <div className="task-controls">
                      <select
                        className="task-status-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="board-column in-progress">
            <div className="column-header">
              <span className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
                In Progress
              </span>
              <span className="column-badge">{inProgressTasks.length}</span>
            </div>
            <div className="task-list">
              {inProgressTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">⚡</span>
                  <span>No tasks in progress</span>
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    <div className="task-footer">
                      <span className="task-id">#TSK-{task.id}</span>
                      <span className="task-tag">In Progress</span>
                    </div>
                    <div className="task-controls">
                      <select
                        className="task-status-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="board-column done">
            <div className="column-header">
              <span className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                Done
              </span>
              <span className="column-badge">{doneTasks.length}</span>
            </div>
            <div className="task-list">
              {doneTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">✨</span>
                  <span>No completed tasks</span>
                </div>
              ) : (
                doneTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    <div className="task-footer">
                      <span className="task-id">#TSK-{task.id}</span>
                      <span className="task-tag">Done</span>
                    </div>
                    <div className="task-controls">
                      <select
                        className="task-status-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
