import React, { useState, useEffect } from 'react';
import './QueuePage.css';

const QueuePage = ({ onNavigate, onQueueComplete }) => {
  const [queuePosition, setQueuePosition] = useState(Math.floor(Math.random() * 5) + 1);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3분

  useEffect(() => {
    // 대기열 시뮬레이션
    const queueInterval = setInterval(() => {
      setQueuePosition(prev => {
        if (prev <= 1) {
          clearInterval(queueInterval);
          setTimeout(() => {
            onQueueComplete();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 2000); // 2초마다 한 명씩 줄어듦

    // 타이머
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(timerInterval);
    };
  }, [onQueueComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    onNavigate('home');
  };

  if (queuePosition === 0) {
    return (
      <div className="queue-page">
        <div className="queue-container">
          <div className="queue-card card">
            <div className="queue-complete">
              <div className="success-icon">✅</div>
              <h2>차례가 되었습니다!</h2>
              <p>예약 페이지로 이동합니다...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-page">
      <div className="queue-container">
        <div className="queue-card card">
          <div className="queue-header">
            <h2>대기열에 진입했습니다</h2>
            <p>잠시만 기다려주세요</p>
          </div>

          <div className="queue-status">
            <div className="queue-position">
              <span className="position-number">{queuePosition}</span>
              <span className="position-label">번째 대기</span>
            </div>

            <div className="queue-timer">
              <div className="timer-circle">
                <span className="timer-text">{formatTime(timeRemaining)}</span>
              </div>
              <p>예상 대기 시간</p>
            </div>
          </div>

          <div className="queue-animation">
            <div className="waiting-dots">
              {[...Array(queuePosition)].map((_, index) => (
                <div 
                  key={index} 
                  className={`dot ${index === 0 ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="queue-info">
            <p>• 대기 중에는 페이지를 새로고침하지 마세요</p>
            <p>• 차례가 되면 자동으로 예약 페이지로 이동합니다</p>
            <p>• 최대 3분간 대기 시간이 주어집니다</p>
          </div>

          <button 
            className="btn btn-secondary cancel-btn"
            onClick={handleCancel}
          >
            대기 취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueuePage;

