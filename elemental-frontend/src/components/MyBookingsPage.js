import React, { useState, useEffect } from 'react';
import './MyBookingsPage.css';

const MyBookingsPage = ({ user, onNavigate }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await fetch('/api/my-bookings', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('예약 내역을 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('정말 예약을 취소하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        alert('예약이 취소되었습니다.');
      } else {
        const data = await response.json();
        alert(data.error || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 연결에 실패했습니다.');
    }
  };

  const formatTime = (time) => {
    const hour = Math.floor(time / 100);
    const minute = time % 100;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isUpcoming = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  if (isLoading) {
    return (
      <div className="my-bookings-page">
        <header className="header">
          <div className="logo">Elemental</div>
          <nav className="nav-menu">
            <button 
              className="nav-item"
              onClick={() => onNavigate('home')}
            >
              홈으로
            </button>
          </nav>
        </header>
        <div className="loading-container">
          <div className="loading"></div>
          <p>예약 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <header className="header">
        <div className="logo">Elemental</div>
        <nav className="nav-menu">
          <button 
            className="nav-item"
            onClick={() => onNavigate('home')}
          >
            홈으로
          </button>
        </nav>
      </header>

      <div className="bookings-container">
        <div className="bookings-header">
          <h2>내 예약 내역</h2>
          <p>{user?.student_id}님의 예약 현황</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📅</div>
            <h3>예약 내역이 없습니다</h3>
            <p>새로운 스터디룸을 예약해보세요!</p>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('home')}
            >
              예약하러 가기
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className={`booking-card card ${!isUpcoming(booking.booking_date) ? 'past' : ''}`}>
                <div className="booking-header">
                  <div className="booking-info">
                    <h3>스터디룸 {booking.room_id}</h3>
                    <div className="booking-date">
                      {formatDate(booking.booking_date)}
                    </div>
                  </div>
                  <div className="booking-status">
                    {isUpcoming(booking.booking_date) ? (
                      <span className="status upcoming">예정</span>
                    ) : (
                      <span className="status completed">완료</span>
                    )}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-label">시간</span>
                    <span className="detail-value">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">예약자</span>
                    <span className="detail-value">{booking.student_id}</span>
                  </div>

                  {booking.team_members && booking.team_members.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">팀원</span>
                      <div className="team-members-list">
                        {booking.team_members.map((member, index) => (
                          <div key={index} className="team-member">
                            {member.name} ({member.studentId})
                            {member.department && ` - ${member.department}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">예약일시</span>
                    <span className="detail-value">
                      {new Date(booking.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>

                {isUpcoming(booking.booking_date) && (
                  <div className="booking-actions">
                    <button
                      className="btn btn-danger cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      예약 취소
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

