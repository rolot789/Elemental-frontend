import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import BookingPage from './components/BookingPage';
import QueuePage from './components/QueuePage';
import MyBookingsPage from './components/MyBookingsPage';
import AdminPage from './components/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCurrentPage('home');
      }
    } catch (error) {
      console.log('Not logged in');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'home':
        return (
          <HomePage 
            user={user} 
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onEnterQueue={() => setIsInQueue(true)}
          />
        );
      case 'queue':
        return (
          <QueuePage 
            onNavigate={navigateTo}
            onQueueComplete={() => {
              setIsInQueue(false);
              setCurrentPage('booking');
            }}
          />
        );
      case 'booking':
        return (
          <BookingPage 
            user={user}
            onNavigate={navigateTo}
          />
        );
      case 'my-bookings':
        return (
          <MyBookingsPage 
            user={user}
            onNavigate={navigateTo}
          />
        );
      case 'admin':
        return (
          <AdminPage 
            user={user}
            onNavigate={navigateTo}
          />
        );
      default:
        return <HomePage user={user} onNavigate={navigateTo} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;

