import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import AssignmentsPage from './pages/AssignmentsPage';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentPage('login');
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Military Asset Management System</div>
        <div className="nav-menu">
          <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
          <button className={currentPage === 'purchases' ? 'active' : ''} onClick={() => setCurrentPage('purchases')}>Purchases</button>
          <button className={currentPage === 'transfers' ? 'active' : ''} onClick={() => setCurrentPage('transfers')}>Transfers</button>
          <button className={currentPage === 'assignments' ? 'active' : ''} onClick={() => setCurrentPage('assignments')}>Assignments</button>
        </div>
        <div className="nav-user">
          <span>{user?.username} ({user?.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && <DashboardPage apiBase={API_BASE} />}
        {currentPage === 'purchases' && <PurchasesPage apiBase={API_BASE} user={user} />}
        {currentPage === 'transfers' && <TransfersPage apiBase={API_BASE} user={user} />}
        {currentPage === 'assignments' && <AssignmentsPage apiBase={API_BASE} user={user} />}
      </main>
    </div>
  );
}

export default App;
