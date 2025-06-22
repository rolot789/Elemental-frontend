import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('학번을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ student_id: studentId }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="logo-section">
            <h1 className="logo">Elemental</h1>
            <p className="subtitle">스터디룸 예약 시스템</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="studentId" className="input-label">
                학번
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="10자리 학번을 입력하세요"
                className="input-field"
                maxLength="10"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading"></span>
                  입장 중...
                </>
              ) : (
                '입장'
              )}
            </button>
          </form>
          
          <div className="login-info">
            <p>• 10자리 학번으로 로그인</p>
            <p>• 관리자는 "관리자1234" 입력</p>
            <p>• 당일 예약만 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

