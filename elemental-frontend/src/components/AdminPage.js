import React, { useState, useEffect } from 'react';
import './AdminPage.css';

const AdminPage = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.is_admin) {
      onNavigate('home');
      return;
    }
    
    if (activeTab === 'bookings') {
      fetchAllBookings();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'rooms') {
      fetchAllRooms();
    }
  }, [activeTab, user]);

  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/admin/bookings?date=${today}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('예약 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('사용자 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/rooms', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        setError('스터디룸 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('정말 이 예약을 취소하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
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

  const handleBanUser = async (studentId, isBanned) => {
    const action = isBanned ? '해제' : '제한';
    if (!window.confirm(`정말 이 사용자의 이용을 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${studentId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_banned: !isBanned }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.student_id === studentId 
            ? { ...user, is_banned: !isBanned }
            : user
        ));
        alert(`사용자 이용이 ${action}되었습니다.`);
      } else {
        const data = await response.json();
        alert(data.error || `사용자 이용 ${action}에 실패했습니다.`);
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
    return date.toLocaleDateString('ko-KR');
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="admin-page">
      <header className="header">
        <div className="logo">Elemental Admin</div>
        <nav className="nav-menu">
          <button 
            className="nav-item"
            onClick={() => onNavigate('home')}
          >
            홈으로
          </button>
        </nav>
      </header>

      <div className="admin-container">
        <div className="admin-header">
          <h2>관리자 대시보드</h2>
          <p>시스템 관리 및 모니터링</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            예약 관리
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            사용자 관리
          </button>
          <button
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            스터디룸 관리
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="admin-content">
            {activeTab === 'bookings' && (
              <div className="bookings-section">
                <h3>오늘의 예약 현황</h3>
                {bookings.length === 0 ? (
                  <div className="empty-state card">
                    <p>오늘 예약이 없습니다.</p>
                  </div>
                ) : (
                  <div className="admin-table">
                    <div className="table-header">
                      <span>예약 ID</span>
                      <span>스터디룸</span>
                      <span>사용자</span>
                      <span>시간</span>
                      <span>팀원 수</span>
                      <span>작업</span>
                    </div>
                    {bookings.map(booking => (
                      <div key={booking.id} className="table-row">
                        <span>#{booking.id}</span>
                        <span>룸 {booking.room_id}</span>
                        <span>{booking.student_id}</span>
                        <span>
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                        <span>{booking.team_members ? booking.team_members.length + 1 : 1}명</span>
                        <span>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            취소
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <h3>사용자 관리</h3>
                {users.length === 0 ? (
                  <div className="empty-state card">
                    <p>등록된 사용자가 없습니다.</p>
                  </div>
                ) : (
                  <div className="admin-table">
                    <div className="table-header">
                      <span>학번</span>
                      <span>관리자</span>
                      <span>이용 제한</span>
                      <span>마지막 로그인</span>
                      <span>작업</span>
                    </div>
                    {users.map(user => (
                      <div key={user.id} className="table-row">
                        <span>{user.student_id}</span>
                        <span>{user.is_admin ? '✅' : '❌'}</span>
                        <span className={user.is_banned ? 'banned' : 'active'}>
                          {user.is_banned ? '제한됨' : '정상'}
                        </span>
                        <span>
                          {user.last_login ? formatDate(user.last_login) : '없음'}
                        </span>
                        <span>
                          {!user.is_admin && (
                            <button
                              className={`btn btn-sm ${user.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                              onClick={() => handleBanUser(user.student_id, user.is_banned)}
                            >
                              {user.is_banned ? '해제' : '제한'}
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="rooms-section">
                <h3>스터디룸 관리</h3>
                {rooms.length === 0 ? (
                  <div className="empty-state card">
                    <p>등록된 스터디룸이 없습니다.</p>
                  </div>
                ) : (
                  <div className="admin-table">
                    <div className="table-header">
                      <span>룸 ID</span>
                      <span>이름</span>
                      <span>수용인원</span>
                      <span>상태</span>
                      <span>생성일</span>
                    </div>
                    {rooms.map(room => (
                      <div key={room.id} className="table-row">
                        <span>#{room.id}</span>
                        <span>{room.name}</span>
                        <span>{room.capacity}명</span>
                        <span className={room.is_active ? 'active' : 'inactive'}>
                          {room.is_active ? '활성' : '비활성'}
                        </span>
                        <span>{formatDate(room.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

