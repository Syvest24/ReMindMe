import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import components
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import ContactDetail from './components/ContactDetail';
import Reminders from './components/Reminders';
import MessageComposer from './components/MessageComposer';
import Analytics from './components/Analytics';
import Navbar from './components/Navbar';

// API utilities
import { setAuthToken, getAuthToken } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    toast.success('Welcome back!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {!isAuthenticated ? (
          <Routes>
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        ) : (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="pt-16">
              <Routes>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/:contactId" element={<ContactDetail />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/message/:contactId" element={<MessageComposer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
