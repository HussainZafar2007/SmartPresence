import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

// Get the root element from index.html
const rootElement = document.getElementById('root');

// Create a React root
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide the loading screen after React loads
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  // Immediately add hidden class since React has loaded
  loadingScreen.classList.add('hidden');
}

// Optional: Log startup message
console.log('Smart Presence System initialized successfully!');
console.log('Version: 1.0.0');
console.log('Developed by: Smart Presence Team');