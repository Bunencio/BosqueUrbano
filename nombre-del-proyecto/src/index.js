import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Dashboard from './Dashboard/Dashboard';
import Evidencia from './Dashboard/Evidencia';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/evidencias" element={<Evidencia />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
