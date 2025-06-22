import React from 'react';
import './HomePage.css';

const HomePage = ({ user, onNavigate, onLogout, onEnterQueue }) => {
  const handleReservationClick = () => {
    onNavigate('queue');
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="logo">Elemental</div>
        <nav className="nav-menu">
          <button 
            className="nav-item"
            onClick={() => onNavigate('my-bookings')}
          >
            내 예약
          </button>
          {user?.is_admin && (
            <button 
              className="nav-item"
              onClick={() => onNavigate('admin')}
            >
              관리자
            </button>
          )}
          <button 
            className="nav-item"
            onClick={onLogout}
          >
            로그아웃
          </button>
        </nav>
      </header>

      <div className="home-container">
        <div className="welcome-section">
          <h2 className="welcome-title">
            안녕하세요, {user?.student_id}님
          </h2>
          <p className="welcome-subtitle">
            스터디룸을 예약하고 효율적으로 학습하세요
          </p>
        </div>

        <div className="reservation-section">
          <button 
            className="reservation-btn btn btn-primary"
            onClick={handleReservationClick}
          >
            <span className="btn-icon">📚</span>
            예약하기
          </button>
        </div>

        <div className="info-cards">
          <div className="info-card card">
            <h3>이용 안내</h3>
            <ul>
              <li>당일 예약만 가능합니다</li>
              <li>1인당 최대 4시간까지 예약 가능</li>
              <li>선착순 대기열 시스템</li>
              <li>예약 취소는 언제든 가능</li>
            </ul>
          </div>
          
          <div className="info-card card">
            <h3>스터디룸 정보</h3>
            <ul>
              <li>총 6개의 스터디룸 운영</li>
              <li>각 룸당 최대 4명 수용</li>
              <li>화이트보드, 프로젝터 완비</li>
              <li>조용한 학습 환경 제공</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

