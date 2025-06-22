import React, { useState, useEffect } from 'react';
import './BookingPage.css';

const BookingPage = ({ user, onNavigate }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    { time: 900, label: '09:00' },
    { time: 930, label: '09:30' },
    { time: 1000, label: '10:00' },
    { time: 1030, label: '10:30' },
    { time: 1100, label: '11:00' },
    { time: 1130, label: '11:30' },
    { time: 1200, label: '12:00' },
    { time: 1230, label: '12:30' },
    { time: 1300, label: '13:00' },
    { time: 1330, label: '13:30' },
    { time: 1400, label: '14:00' },
    { time: 1430, label: '14:30' },
    { time: 1500, label: '15:00' },
    { time: 1530, label: '15:30' },
    { time: 1600, label: '16:00' },
    { time: 1630, label: '16:30' },
    { time: 1700, label: '17:00' },
    { time: 1730, label: '17:30' },
    { time: 1800, label: '18:00' },
    { time: 1830, label: '18:30' },
  ];

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/bookings?date=${today}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const isTimeSlotBooked = (roomId, time) => {
    return bookings.some(booking => 
      booking.room_id === roomId && 
      time >= booking.start_time && 
      time < booking.end_time
    );
  };

  const handleTimeSlotClick = (time) => {
    if (isTimeSlotBooked(selectedRoom, time)) return;

    setSelectedTimeSlots(prev => {
      const isSelected = prev.includes(time);
      if (isSelected) {
        return prev.filter(t => t !== time);
      } else {
        const newSlots = [...prev, time].sort((a, b) => a - b);
        // 연속된 시간대만 선택 가능
        if (newSlots.length > 1) {
          const isConsecutive = newSlots.every((slot, index) => {
            if (index === 0) return true;
            return slot - newSlots[index - 1] === 30;
          });
          if (!isConsecutive) {
            return [time]; // 연속되지 않으면 새로 시작
          }
        }
        return newSlots;
      }
    });
  };

  const addTeamMember = () => {
    if (teamMembers.length < 3) { // 본인 포함 최대 4명
      setTeamMembers([...teamMembers, { name: '', studentId: '', department: '' }]);
    }
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index, field, value) => {
    const updated = teamMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    setTeamMembers(updated);
  };

  const handleBooking = async () => {
    if (selectedTimeSlots.length === 0) {
      setError('시간을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const startTime = Math.min(...selectedTimeSlots);
      const endTime = Math.max(...selectedTimeSlots) + 30;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_id: selectedRoom,
          start_time: startTime,
          end_time: endTime,
          team_members: teamMembers.filter(member => member.name.trim())
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('예약이 완료되었습니다!');
        onNavigate('home');
      } else {
        setError(data.error || '예약에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTimeRange = () => {
    if (selectedTimeSlots.length === 0) return '';
    const start = Math.min(...selectedTimeSlots);
    const end = Math.max(...selectedTimeSlots) + 30;
    const startLabel = timeSlots.find(slot => slot.time === start)?.label;
    const endLabel = timeSlots.find(slot => slot.time === end)?.label;
    return `${startLabel} - ${endLabel}`;
  };

  return (
    <div className="booking-page">
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

      <div className="booking-container">
        <div className="booking-header">
          <h2>스터디룸 예약</h2>
          <p>원하는 시간대를 선택하세요</p>
        </div>

        <div className="room-selector">
          <h3>스터디룸 선택</h3>
          <div className="room-buttons">
            {rooms.map(room => (
              <button
                key={room.id}
                className={`room-btn ${selectedRoom === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room.id)}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>

        <div className="time-table">
          <h3>시간 선택</h3>
          <div className="time-grid">
            {timeSlots.map(slot => {
              const isBooked = isTimeSlotBooked(selectedRoom, slot.time);
              const isSelected = selectedTimeSlots.includes(slot.time);
              
              return (
                <button
                  key={slot.time}
                  className={`time-slot ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotClick(slot.time)}
                  disabled={isBooked}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTimeSlots.length > 0 && (
          <div className="booking-summary card">
            <h3>예약 정보</h3>
            <div className="summary-item">
              <span>스터디룸:</span>
              <span>{rooms.find(r => r.id === selectedRoom)?.name}</span>
            </div>
            <div className="summary-item">
              <span>시간:</span>
              <span>{getSelectedTimeRange()}</span>
            </div>
            <div className="summary-item">
              <span>예약자:</span>
              <span>{user?.student_id}</span>
            </div>
          </div>
        )}

        <div className="team-members">
          <h3>팀원 추가 (선택사항)</h3>
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-form">
              <input
                type="text"
                placeholder="이름"
                value={member.name}
                onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="학번"
                value={member.studentId}
                onChange={(e) => updateTeamMember(index, 'studentId', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="학과"
                value={member.department}
                onChange={(e) => updateTeamMember(index, 'department', e.target.value)}
                className="input-field"
              />
              <button
                type="button"
                onClick={() => removeTeamMember(index)}
                className="btn btn-danger remove-btn"
              >
                제거
              </button>
            </div>
          ))}
          
          {teamMembers.length < 3 && (
            <button
              type="button"
              onClick={addTeamMember}
              className="btn btn-secondary add-member-btn"
            >
              + 팀원 추가
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="booking-actions">
          <button
            onClick={() => onNavigate('home')}
            className="btn btn-secondary"
          >
            취소
          </button>
          <button
            onClick={handleBooking}
            className="btn btn-primary"
            disabled={isLoading || selectedTimeSlots.length === 0}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                예약 중...
              </>
            ) : (
              '예약하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

