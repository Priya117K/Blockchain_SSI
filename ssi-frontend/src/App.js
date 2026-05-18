import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RegisterIdentity from './pages/RegisterIdentity';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Register Identity', icon: '👤' },
    { path: '/issue', label: 'Issue Credential', icon: '📄' },
    { path: '/verify', label: 'Verify Credential', icon: '✓' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🔐</span>
        <h1>SSI System</h1>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<RegisterIdentity />} />
            <Route path="/issue" element={<IssueCredential />} />
            <Route path="/verify" element={<VerifyCredential />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
