// FLASHCARDS/client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom'; // 1. IMPORT BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* 2. WRAP your <App /> component with <Router> */}
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();