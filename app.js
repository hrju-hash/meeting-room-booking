// 데이터 관리
class DataManager {
    constructor() {
        this.rooms = this.loadRooms();
        this.bookings = this.loadBookings();
        this.initDefaultRooms();
    }

    initDefaultRooms() {
        if (this.rooms.length === 0) {
            this.rooms = [
                {
                    id: 1,
                    name: '소회의실 A',
                    capacity: 8,
                    location: '1701호',
                    facilities: ['프로젝터', '화이트보드']
                },
                {
                    id: 2,
                    name: '소회의실 B',
                    capacity: 8,
                    location: '1701호',
                    facilities: ['프로젝터', '화이트보드']
                },
                {
                    id: 3,
                    name: '소회의실 C',
                    capacity: 8,
                    location: '1703호',
                    facilities: ['프로젝터', '화이트보드']
                },
                {
                    id: 4,
                    name: '대회의실',
                    capacity: 20,
                    location: '1701호',
                    facilities: ['프로젝터', '화이트보드', '전화', '음향시설']
                }
            ];
            this.saveRooms();
        }
    }

    loadRooms() {
        const data = localStorage.getItem('meetingRooms');
        return data ? JSON.parse(data) : [];
    }

    saveRooms() {
        localStorage.setItem('meetingRooms', JSON.stringify(this.rooms));
    }

    loadBookings() {
        const data = localStorage.getItem('meetingBookings');
        return data ? JSON.parse(data) : [];
    }

    saveBookings() {
        localStorage.setItem('meetingBookings', JSON.stringify(this.bookings));
    }

    addBooking(booking) {
        booking.id = Date.now();
        booking.createdAt = new Date().toISOString();
        this.bookings.push(booking);
        this.saveBookings();
        return booking;
    }

    deleteBooking(bookingId) {
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.saveBookings();
    }

    getBookingsByDateAndRoom(date, roomId) {
        return this.bookings.filter(b => 
            b.date === date && b.roomId === roomId
        );
    }

    isTimeSlotAvailable(roomId, date, startTime, endTime) {
        const conflictingBookings = this.bookings.filter(booking => {
            if (booking.roomId !== roomId || booking.date !== date) {
                return false;
            }
            return (startTime < booking.endTime && endTime > booking.startTime);
        });
        return conflictingBookings.length === 0;
    }
}

// UI 관리
class UI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentPage = 'rooms';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRooms();
        this.renderBookings();
        this.setupModal();
    }

    setupEventListeners() {
        // 네비게이션
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });

        // 새 예약 버튼
        document.getElementById('new-booking-btn').addEventListener('click', () => {
            this.openBookingModal();
        });

        // 필터
        document.getElementById('filter-date').addEventListener('change', () => {
            this.renderBookings();
        });
        document.getElementById('filter-room').addEventListener('change', () => {
            this.renderBookings();
        });
    }

    switchPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });

        if (page === 'bookings') {
            this.renderBookings();
        }
    }

    renderRooms() {
        const grid = document.getElementById('rooms-grid');
        grid.innerHTML = '';

        this.dataManager.rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <h3>${room.name}</h3>
                <div class="room-info">
                    <div class="room-info-item">
                        <strong>위치:</strong> ${room.location}
                    </div>
                    <div class="room-info-item">
                        <strong>수용인원:</strong> ${room.capacity}명
                    </div>
                </div>
                <div class="facilities">
                    ${room.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
                </div>
            `;
            
            const bookBtn = document.createElement('button');
            bookBtn.className = 'btn-primary';
            bookBtn.style.marginTop = '16px';
            bookBtn.style.width = '100%';
            bookBtn.textContent = '예약하기';
            bookBtn.addEventListener('click', () => {
                this.openBookingModal(room.id);
            });
            card.appendChild(bookBtn);
            
            grid.appendChild(card);
        });
    }

    renderBookings() {
        const list = document.getElementById('bookings-list');
        list.innerHTML = '';

        let filteredBookings = [...this.dataManager.bookings];
        
        // 날짜 필터
        const dateFilter = document.getElementById('filter-date').value;
        if (dateFilter) {
            filteredBookings = filteredBookings.filter(b => b.date === dateFilter);
        }

        // 회의실 필터
        const roomFilter = document.getElementById('filter-room').value;
        if (roomFilter) {
            filteredBookings = filteredBookings.filter(b => b.roomId === parseInt(roomFilter));
        }

        // 회의실 필터 옵션 업데이트
        this.updateRoomFilterOptions();

        // 날짜순 정렬
        filteredBookings.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        if (filteredBookings.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>예약이 없습니다</h3>
                    <p>새로운 예약을 만들어보세요!</p>
                </div>
            `;
            return;
        }

        filteredBookings.forEach(booking => {
            const room = this.dataManager.rooms.find(r => r.id === booking.roomId);
            const card = document.createElement('div');
            card.className = 'booking-card';
            card.innerHTML = `
                <div class="booking-info">
                    <h3>${booking.roomName}</h3>
                    <div class="booking-details">
                        <div><strong>날짜:</strong> ${this.formatDate(booking.date)}</div>
                        <div><strong>시간:</strong> ${booking.startTime} ~ ${booking.endTime}</div>
                        <div><strong>예약자:</strong> ${booking.userName}</div>
                        ${booking.purpose ? `<div><strong>목적:</strong> ${booking.purpose}</div>` : ''}
                    </div>
                </div>
                <button class="btn-danger" data-booking-id="${booking.id}">취소</button>
            `;
            
            card.querySelector('.btn-danger').addEventListener('click', () => {
                if (confirm('정말 예약을 취소하시겠습니까?')) {
                    this.cancelBooking(booking.id);
                }
            });
            
            list.appendChild(card);
        });
    }

    updateRoomFilterOptions() {
        const select = document.getElementById('filter-room');
        const currentValue = select.value;
        select.innerHTML = '<option value="">전체 회의실</option>';
        
        this.dataManager.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    }

    setupModal() {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-booking');

        closeBtn.addEventListener('click', () => this.closeBookingModal());
        cancelBtn.addEventListener('click', () => this.closeBookingModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeBookingModal();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });

        // 날짜 기본값을 오늘로 설정
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').setAttribute('min', today);
    }

    openBookingModal(roomId = null) {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        form.reset();

        // 회의실 선택 옵션 채우기
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">회의실을 선택하세요</option>';
        this.dataManager.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            if (roomId && room.id === roomId) {
                option.selected = true;
            }
            roomSelect.appendChild(option);
        });

        // 날짜 기본값
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').value = today;

        modal.classList.add('active');
    }

    closeBookingModal() {
        document.getElementById('booking-modal').classList.remove('active');
    }

    submitBooking() {
        const roomId = parseInt(document.getElementById('booking-room').value);
        const date = document.getElementById('booking-date').value;
        const startTime = document.getElementById('booking-start').value;
        const endTime = document.getElementById('booking-end').value;
        const userName = document.getElementById('booking-user').value;
        const purpose = document.getElementById('booking-purpose').value;

        // 유효성 검사
        if (startTime >= endTime) {
            this.showNotification('종료 시간은 시작 시간보다 늦어야 합니다.', 'error');
            return;
        }

        // 시간 충돌 확인
        if (!this.dataManager.isTimeSlotAvailable(roomId, date, startTime, endTime)) {
            this.showNotification('해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.', 'error');
            return;
        }

        const room = this.dataManager.rooms.find(r => r.id === roomId);
        const booking = {
            roomId,
            roomName: room.name,
            date,
            startTime,
            endTime,
            userName,
            purpose
        };

        this.dataManager.addBooking(booking);
        this.closeBookingModal();
        this.renderRooms();
        this.renderBookings();
        this.showNotification('예약이 완료되었습니다!');
    }

    cancelBooking(bookingId) {
        this.dataManager.deleteBooking(bookingId);
        this.renderBookings();
        this.showNotification('예약이 취소되었습니다.');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekday = weekdays[date.getDay()];
        return `${year}-${month}-${day} (${weekday})`;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const ui = new UI(dataManager);
});

