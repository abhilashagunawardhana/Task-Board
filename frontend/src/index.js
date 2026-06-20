// Import core React libraries and index styles
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Find the target container div in public/index.html and initialize virtual DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application wrapped in React StrictMode (enables warnings and diagnostic logs in development)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
