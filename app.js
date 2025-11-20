// 데이터 관리
class DataManager {
    constructor() {
        this.rooms = this.loadRooms();
        this.bookings = this.loadBookings();
        this.zoomBookings = this.loadZoomBookings();
        this.initDefaultRooms();
    }

    initDefaultRooms() {
        if (this.rooms.length === 0) {
            this.rooms = [
                {
                    id: 1,
                    name: '소회의실 A',
                    capacity: 4,
                    location: '1701호',
                    facilities: ['프로젝터', '화이트보드']
                },
                {
                    id: 2,
                    name: '소회의실 B',
                    capacity: 6,
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

    loadZoomBookings() {
        const data = localStorage.getItem('zoomBookings');
        return data ? JSON.parse(data) : [];
    }

    saveZoomBookings() {
        localStorage.setItem('zoomBookings', JSON.stringify(this.zoomBookings));
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

    addZoomBooking(booking) {
        booking.id = Date.now();
        booking.createdAt = new Date().toISOString();
        this.zoomBookings.push(booking);
        this.saveZoomBookings();
        return booking;
    }

    deleteZoomBooking(bookingId) {
        this.zoomBookings = this.zoomBookings.filter(b => b.id !== bookingId);
        this.saveZoomBookings();
    }

    isZoomTimeSlotAvailable(date, startTime, endTime) {
        const conflictingBookings = this.zoomBookings.filter(booking => {
            if (booking.date !== date) {
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
        this.currentPage = 'calendar';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderBookings();
        this.renderCalendar();
        this.setupModal();
        this.setupFAQ();
    }

    setupEventListeners() {
        // 네비게이션
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });


        // 필터
        document.getElementById('filter-date').addEventListener('change', () => {
            this.renderBookings();
        });
        document.getElementById('filter-room').addEventListener('change', () => {
            this.renderBookings();
        });

        // 달력 네비게이션
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
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
        } else if (page === 'calendar') {
            this.renderCalendar();
        } else if (page === 'faq') {
            this.setupFAQ();
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

    renderZoomAccount() {
        const grid = document.getElementById('zoom-grid');
        if (!grid) return;
        
        grid.innerHTML = '';

        // 줌 계정 카드 추가
        const zoomCard = document.createElement('div');
        zoomCard.className = 'room-card';
        zoomCard.innerHTML = `
            <h3>📹 줌 예약</h3>
            <div class="room-info">
                <div class="room-info-item">
                    <strong>타입:</strong> 화상회의 계정
                </div>
                <div class="room-info-item">
                    <strong>용도:</strong> 온라인 회의
                </div>
            </div>
            <div class="facilities">
                <span class="facility-tag">화상회의</span>
                <span class="facility-tag">녹화 가능</span>
            </div>
        `;
        
        const zoomBookBtn = document.createElement('button');
        zoomBookBtn.className = 'btn-primary';
        zoomBookBtn.style.marginTop = '16px';
        zoomBookBtn.style.width = '100%';
        zoomBookBtn.textContent = '줌 예약';
        zoomBookBtn.addEventListener('click', () => {
            this.openZoomBookingModal();
        });
        zoomCard.appendChild(zoomBookBtn);
        
        grid.appendChild(zoomCard);
    }

    renderBookings() {
        const list = document.getElementById('bookings-list');
        list.innerHTML = '';

        // 회의실 예약과 줌 예약을 합치기
        let allBookings = [
            ...this.dataManager.bookings.map(b => ({...b, isZoom: false})),
            ...this.dataManager.zoomBookings.map(b => ({...b, isZoom: true}))
        ];
        
        // 날짜 필터
        const dateFilter = document.getElementById('filter-date').value;
        if (dateFilter) {
            allBookings = allBookings.filter(b => b.date === dateFilter);
        }

        // 회의실 필터 (줌 예약은 필터에서 제외)
        const roomFilter = document.getElementById('filter-room').value;
        if (roomFilter) {
            allBookings = allBookings.filter(b => {
                if (b.isZoom) return false; // 줌 예약은 회의실 필터에서 제외
                return b.roomId === parseInt(roomFilter);
            });
        }

        // 회의실 필터 옵션 업데이트
        this.updateRoomFilterOptions();

        // 날짜순 정렬
        allBookings.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        if (allBookings.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>예약이 없습니다</h3>
                    <p>새로운 예약을 만들어보세요!</p>
                </div>
            `;
            return;
        }

        allBookings.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            
            if (booking.isZoom) {
                // 줌 예약 카드
                card.innerHTML = `
                    <div class="booking-info">
                        <h3>📹 줌 예약</h3>
                        <div class="booking-details">
                            <div><strong>날짜:</strong> ${this.formatDate(booking.date)}</div>
                            <div><strong>시간:</strong> ${booking.startTime} ~ ${booking.endTime}</div>
                            <div><strong>예약자:</strong> ${booking.userName}</div>
                            ${booking.attendees ? `<div><strong>참석자:</strong> ${booking.attendees}</div>` : ''}
                            ${booking.purpose ? `<div><strong>목적:</strong> ${booking.purpose}</div>` : ''}
                            ${booking.roomName ? `<div><strong>회의실:</strong> ${booking.roomName}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn-danger" data-zoom-booking-id="${booking.id}">취소</button>
                `;
                
                card.querySelector('.btn-danger').addEventListener('click', () => {
                    if (confirm('정말 예약을 취소하시겠습니까?')) {
                        this.cancelZoomBooking(booking.id);
                    }
                });
            } else {
                // 회의실 예약 카드
                const room = this.dataManager.rooms.find(r => r.id === booking.roomId);
                card.innerHTML = `
                    <div class="booking-info">
                        <h3>${booking.roomName}</h3>
                        <div class="booking-details">
                            <div><strong>날짜:</strong> ${this.formatDate(booking.date)}</div>
                            <div><strong>시간:</strong> ${booking.startTime} ~ ${booking.endTime}</div>
                            <div><strong>예약자:</strong> ${booking.userName}</div>
                            ${booking.attendees ? `<div><strong>참석자:</strong> ${booking.attendees}</div>` : ''}
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
            }
            
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

        // 시간 선택 드롭다운 초기화
        this.initTimeSelects();

        // 시간 선택 시 hidden input 업데이트
        document.getElementById('booking-start-hour').addEventListener('change', () => {
            this.updateTimeInput('start');
        });
        document.getElementById('booking-start-minute').addEventListener('change', () => {
            this.updateTimeInput('start');
        });
        document.getElementById('booking-end-hour').addEventListener('change', () => {
            this.updateTimeInput('end');
        });
        document.getElementById('booking-end-minute').addEventListener('change', () => {
            this.updateTimeInput('end');
        });
    }

    initTimeSelects() {
        // 시간 옵션 (0-23)
        const startHourSelect = document.getElementById('booking-start-hour');
        const endHourSelect = document.getElementById('booking-end-hour');
        
        for (let i = 0; i < 24; i++) {
            const option1 = document.createElement('option');
            option1.value = String(i).padStart(2, '0');
            option1.textContent = `${i}시`;
            startHourSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = String(i).padStart(2, '0');
            option2.textContent = `${i}시`;
            endHourSelect.appendChild(option2);
        }

        // 분 옵션 (0, 10, 20, 30, 40, 50)
        const startMinuteSelect = document.getElementById('booking-start-minute');
        const endMinuteSelect = document.getElementById('booking-end-minute');
        
        const minutes = [0, 10, 20, 30, 40, 50];
        minutes.forEach(min => {
            const option1 = document.createElement('option');
            option1.value = String(min).padStart(2, '0');
            option1.textContent = `${min}분`;
            startMinuteSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = String(min).padStart(2, '0');
            option2.textContent = `${min}분`;
            endMinuteSelect.appendChild(option2);
        });
    }

    updateTimeInput(type) {
        const hourSelect = document.getElementById(`booking-${type}-hour`);
        const minuteSelect = document.getElementById(`booking-${type}-minute`);
        const hiddenInput = document.getElementById(`booking-${type}`);

        const hour = hourSelect.value;
        const minute = minuteSelect.value;

        if (hour && minute) {
            hiddenInput.value = `${hour}:${minute}`;
        } else {
            hiddenInput.value = '';
        }
    }

    openBookingModal(roomId = null) {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        form.reset();

        // 모달 제목 변경
        document.querySelector('#booking-modal .modal-header h2').textContent = '회의실 예약';

        // 회의실 선택 표시
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        document.getElementById('booking-room').setAttribute('required', 'required');

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
        document.getElementById('booking-date').removeAttribute('readonly');
        document.getElementById('booking-date').style.backgroundColor = '';
        document.getElementById('booking-date').style.cursor = '';

        // 줌 체크박스 표시 (회의실이 선택된 경우)
        if (roomId) {
            document.getElementById('zoom-checkbox-group').style.display = 'block';
        } else {
            document.getElementById('zoom-checkbox-group').style.display = 'none';
        }
        document.getElementById('booking-zoom').checked = false;

        // 회의실 선택 변경 이벤트 추가
        roomSelect.onchange = () => {
            if (roomSelect.value && roomSelect.value !== '') {
                document.getElementById('zoom-checkbox-group').style.display = 'block';
            } else {
                document.getElementById('zoom-checkbox-group').style.display = 'none';
            }
        };

        // 시간 선택 초기화
        document.getElementById('booking-start-hour').value = '';
        document.getElementById('booking-start-minute').value = '';
        document.getElementById('booking-end-hour').value = '';
        document.getElementById('booking-end-minute').value = '';
        document.getElementById('booking-start').value = '';
        document.getElementById('booking-end').value = '';
        document.getElementById('booking-attendees').value = '';

        modal.classList.add('active');
    }

    openBookingModalFromCalendar(selectedDate) {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        form.reset();

        // 모달 제목 변경
        document.querySelector('#booking-modal .modal-header h2').textContent = '예약하기';

        // 날짜 설정 (선택된 날짜)
        document.getElementById('booking-date').value = selectedDate;
        document.getElementById('booking-date').setAttribute('readonly', 'readonly');
        document.getElementById('booking-date').style.backgroundColor = '#f3f4f6';
        document.getElementById('booking-date').style.cursor = 'not-allowed';

        // 회의실 선택 표시
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        document.getElementById('booking-room').setAttribute('required', 'required');

        // 회의실 선택 옵션 채우기
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">회의실을 선택하세요</option>';
        this.dataManager.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
        });

        // 줌 예약 옵션 추가
        const zoomOption = document.createElement('option');
        zoomOption.value = 'zoom';
        zoomOption.textContent = '📹 줌 예약';
        roomSelect.appendChild(zoomOption);

        // 줌 체크박스 숨기기 (초기 상태)
        document.getElementById('zoom-checkbox-group').style.display = 'none';
        document.getElementById('booking-zoom').checked = false;

        // 회의실 선택 변경 이벤트
        roomSelect.onchange = () => {
            if (roomSelect.value === 'zoom') {
                // 줌 예약 선택 시 줌 체크박스 숨기기 (줌만 예약하는 경우)
                document.getElementById('zoom-checkbox-group').style.display = 'none';
            } else if (roomSelect.value && roomSelect.value !== '') {
                // 회의실 선택 시 줌 체크박스 표시
                document.getElementById('zoom-checkbox-group').style.display = 'block';
            } else {
                // 선택 없음
                document.getElementById('zoom-checkbox-group').style.display = 'none';
            }
        };

        // 시간 선택 초기화
        document.getElementById('booking-start-hour').value = '';
        document.getElementById('booking-start-minute').value = '';
        document.getElementById('booking-end-hour').value = '';
        document.getElementById('booking-end-minute').value = '';
        document.getElementById('booking-start').value = '';
        document.getElementById('booking-end').value = '';
        document.getElementById('booking-attendees').value = '';

        modal.classList.add('active');
    }

    openZoomBookingModal() {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        form.reset();

        // 모달 제목 변경
        document.querySelector('#booking-modal .modal-header h2').textContent = '줌 예약';

        // 회의실 선택 표시 (줌 예약도 선택 가능하도록)
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        document.getElementById('booking-room').setAttribute('required', 'required');
        
        // 회의실 선택 옵션 채우기
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">회의실을 선택하세요</option>';
        this.dataManager.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
        });

        // 줌 예약 옵션 추가
        const zoomOption = document.createElement('option');
        zoomOption.value = 'zoom';
        zoomOption.textContent = '📹 줌 예약';
        zoomOption.selected = true; // 기본 선택
        roomSelect.appendChild(zoomOption);

        // 회의실 선택 변경 이벤트
        roomSelect.onchange = () => {
            if (roomSelect.value === 'zoom') {
                // 줌 예약 선택 시 줌 체크박스 숨기기
                document.getElementById('zoom-checkbox-group').style.display = 'none';
            } else if (roomSelect.value && roomSelect.value !== '') {
                // 회의실 선택 시 줌 체크박스 표시
                document.getElementById('zoom-checkbox-group').style.display = 'block';
            } else {
                // 선택 없음
                document.getElementById('zoom-checkbox-group').style.display = 'none';
            }
        };

        // 줌 체크박스 숨기기 (줌만 예약하는 경우)
        document.getElementById('zoom-checkbox-group').style.display = 'none';
        document.getElementById('booking-zoom').checked = false;

        // 날짜 기본값
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').value = today;
        document.getElementById('booking-date').removeAttribute('readonly');
        document.getElementById('booking-date').style.backgroundColor = '';
        document.getElementById('booking-date').style.cursor = '';

        // 줌 체크박스 숨기기
        document.getElementById('zoom-checkbox-group').style.display = 'none';
        document.getElementById('booking-zoom').checked = false;

        // 시간 선택 초기화
        document.getElementById('booking-start-hour').value = '';
        document.getElementById('booking-start-minute').value = '';
        document.getElementById('booking-end-hour').value = '';
        document.getElementById('booking-end-minute').value = '';
        document.getElementById('booking-start').value = '';
        document.getElementById('booking-end').value = '';
        document.getElementById('booking-attendees').value = '';

        modal.classList.add('active');
    }

    closeBookingModal() {
        document.getElementById('booking-modal').classList.remove('active');
        // 회의실 선택 다시 표시
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        // 줌 체크박스 숨기기
        document.getElementById('zoom-checkbox-group').style.display = 'none';
        document.getElementById('booking-zoom').checked = false;
        // 날짜 필드 초기화
        document.getElementById('booking-date').removeAttribute('readonly');
        document.getElementById('booking-date').style.backgroundColor = '';
        document.getElementById('booking-date').style.cursor = '';
        // 회의실 선택 이벤트 리스너 제거
        const roomSelect = document.getElementById('booking-room');
        roomSelect.onchange = null;
    }

    submitBooking() {
        // 시간 입력 확인 (드롭다운에서 직접 확인)
        const startHour = document.getElementById('booking-start-hour').value;
        const startMinute = document.getElementById('booking-start-minute').value;
        const endHour = document.getElementById('booking-end-hour').value;
        const endMinute = document.getElementById('booking-end-minute').value;

        if (!startHour || !startMinute || !endHour || !endMinute) {
            this.showNotification('시작 시간과 종료 시간을 모두 선택해주세요.', 'error');
            return;
        }

        // hidden input 업데이트
        const startTime = `${startHour}:${startMinute}`;
        const endTime = `${endHour}:${endMinute}`;
        document.getElementById('booking-start').value = startTime;
        document.getElementById('booking-end').value = endTime;

        const date = document.getElementById('booking-date').value;
        const userName = document.getElementById('booking-user').value;
        const purpose = document.getElementById('booking-purpose').value;
        const attendees = document.getElementById('booking-attendees').value;

        // 유효성 검사
        if (startTime >= endTime) {
            this.showNotification('종료 시간은 시작 시간보다 늦어야 합니다.', 'error');
            return;
        }

        // 줌 전용 예약인지 확인
        const roomSelect = document.getElementById('booking-room');
        const isZoomOnly = roomSelect.value === 'zoom';

        if (isZoomOnly) {
            // 줌 전용 예약
            if (!this.dataManager.isZoomTimeSlotAvailable(date, startTime, endTime)) {
                this.showNotification('해당 시간에 줌 예약이 이미 있습니다.', 'error');
                return;
            }

            const zoomBooking = {
                date,
                startTime,
                endTime,
                userName,
                attendees: attendees || '',
                purpose
            };

            this.dataManager.addZoomBooking(zoomBooking);
            this.closeBookingModal();
            this.renderBookings();
            this.renderCalendar();
            this.showNotification('줌 예약이 완료되었습니다!');
            return;
        }

        // 회의실 예약
        const roomId = parseInt(roomSelect.value);
        
        if (!roomId || isNaN(roomId)) {
            this.showNotification('회의실을 선택해주세요.', 'error');
            return;
        }
        
        // 시간 충돌 확인
        if (!this.dataManager.isTimeSlotAvailable(roomId, date, startTime, endTime)) {
            this.showNotification('해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.', 'error');
            return;
        }

        const room = this.dataManager.rooms.find(r => r.id === roomId);
        
        const useZoom = document.getElementById('booking-zoom') && document.getElementById('booking-zoom').checked;

        const booking = {
            roomId,
            roomName: room.name,
            date,
            startTime,
            endTime,
            userName,
            attendees: attendees || '',
            purpose,
            useZoom: useZoom || false
        };

        this.dataManager.addBooking(booking);

        // 줌 예약도 함께 처리
        if (useZoom) {
            // 줌 시간 충돌 확인
            if (!this.dataManager.isZoomTimeSlotAvailable(date, startTime, endTime)) {
                this.showNotification('회의실 예약은 완료되었지만, 해당 시간에 줌 예약이 이미 있어 줌 예약은 추가되지 않았습니다.', 'error');
            } else {
                const zoomBooking = {
                    date,
                    startTime,
                    endTime,
                    userName,
                    attendees: attendees || '',
                    purpose,
                    roomName: room.name
                };
                this.dataManager.addZoomBooking(zoomBooking);
            }
        }

        this.closeBookingModal();
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('예약이 완료되었습니다!');
    }

    cancelBooking(bookingId) {
        this.dataManager.deleteBooking(bookingId);
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('예약이 취소되었습니다.');
    }

    cancelZoomBooking(bookingId) {
        this.dataManager.deleteZoomBooking(bookingId);
        this.renderCalendar();
        this.showNotification('줌 예약이 취소되었습니다.');
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

    getKoreanHolidays(year) {
        // 한국 공휴일 목록 (날짜: 이름)
        const holidays = {};
        
        // 고정 공휴일
        holidays[`${year}-01-01`] = '신정';
        holidays[`${year}-03-01`] = '삼일절';
        holidays[`${year}-05-05`] = '어린이날';
        holidays[`${year}-06-06`] = '현충일';
        holidays[`${year}-08-15`] = '광복절';
        holidays[`${year}-10-03`] = '개천절';
        holidays[`${year}-10-09`] = '한글날';
        holidays[`${year}-12-25`] = '크리스마스';
        
        // 음력 공휴일 (2024-2026 기준)
        if (year === 2024) {
            holidays['2024-02-10'] = '설날';
            holidays['2024-02-11'] = '설날';
            holidays['2024-02-12'] = '설날';
            holidays['2024-09-16'] = '추석';
            holidays['2024-09-17'] = '추석';
            holidays['2024-09-18'] = '추석';
        } else if (year === 2025) {
            holidays['2025-01-29'] = '설날';
            holidays['2025-01-30'] = '설날';
            holidays['2025-01-31'] = '설날';
            holidays['2025-10-05'] = '추석';
            holidays['2025-10-06'] = '추석';
            holidays['2025-10-07'] = '추석';
            // 2025년 10월 10일은 대체공휴일이 아님 (한글날 10월 9일이 목요일이므로)
        } else if (year === 2026) {
            holidays['2026-02-17'] = '설날';
            holidays['2026-02-18'] = '설날';
            holidays['2026-02-19'] = '설날';
            holidays['2026-09-24'] = '추석';
            holidays['2026-09-25'] = '추석';
            holidays['2026-09-26'] = '추석';
        }
        
        // 대체공휴일 계산 (공휴일이 토요일 또는 일요일인 경우 다음 평일을 대체공휴일로 지정)
        // 단, 2025년 10월 10일은 대체공휴일이 아님
        const substituteHolidays = this.calculateSubstituteHolidays(year, holidays);
        Object.assign(holidays, substituteHolidays);
        
        return holidays;
    }

    calculateSubstituteHolidays(year, holidays) {
        const substituteHolidays = {};
        const excludeDates = ['2025-10-10']; // 대체공휴일이 아닌 날짜 목록
        
        // 모든 공휴일 확인
        for (const dateStr in holidays) {
            // 날짜 문자열 파싱 (YYYY-MM-DD 형식)
            const [y, m, d] = dateStr.split('-').map(Number);
            const date = new Date(y, m - 1, d); // 월은 0부터 시작
            const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
            
            // 공휴일이 토요일 또는 일요일인 경우
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                // 다음 평일 찾기
                let nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                
                // 평일이 될 때까지 반복 (월~금)
                while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
                    nextDay.setDate(nextDay.getDate() + 1);
                }
                
                const nextDayStr = this.formatDateForCalendar(nextDay);
                
                // 제외 목록에 없고, 이미 공휴일이 아닌 경우에만 대체공휴일로 추가
                if (!excludeDates.includes(nextDayStr) && !holidays.hasOwnProperty(nextDayStr)) {
                    substituteHolidays[nextDayStr] = '대체공휴일';
                }
            }
        }
        
        return substituteHolidays;
    }

    getHolidayName(dateStr) {
        const year = parseInt(dateStr.split('-')[0]);
        const holidays = this.getKoreanHolidays(year);
        return holidays[dateStr] || null;
    }

    isHoliday(dateStr) {
        const year = parseInt(dateStr.split('-')[0]);
        const holidays = this.getKoreanHolidays(year);
        return holidays.hasOwnProperty(dateStr);
    }

    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthYearEl = document.getElementById('current-month-year');
        
        // 월/년도 표시
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                           '7월', '8월', '9월', '10월', '11월', '12월'];
        monthYearEl.textContent = `${this.currentYear}년 ${monthNames[this.currentMonth]}`;

        // 달력 그리드 초기화
        grid.innerHTML = '';

        // 요일 헤더
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // 첫 날짜와 마지막 날짜 계산
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // 6주 표시 (42일)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            // 요일 확인
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0) {
                dayCell.classList.add('sunday');
            } else if (dayOfWeek === 6) {
                dayCell.classList.add('saturday');
            }
            
            // 다른 월의 날짜는 회색으로
            if (currentDate.getMonth() !== this.currentMonth) {
                dayCell.classList.add('other-month');
            }
            
            // 오늘 날짜 강조
            if (currentDate.getTime() === today.getTime()) {
                dayCell.classList.add('today');
            }

            const dateStr = this.formatDateForCalendar(currentDate);
            const isHoliday = this.isHoliday(dateStr);
            const holidayName = isHoliday ? this.getHolidayName(dateStr) : null;
            
            if (isHoliday) {
                dayCell.classList.add('holiday');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate();
            dayCell.appendChild(dayNumber);

            // 공휴일 이름 표시
            if (holidayName) {
                const holidayLabel = document.createElement('div');
                holidayLabel.className = 'holiday-label';
                holidayLabel.textContent = holidayName;
                dayCell.appendChild(holidayLabel);
            }

            // 해당 날짜의 예약 목록 가져오기
            const dayBookings = this.dataManager.bookings.filter(b => b.date === dateStr);
            const dayZoomBookings = this.dataManager.zoomBookings.filter(b => b.date === dateStr);
            
            // 모든 예약 합치기
            const allBookings = [...dayBookings, ...dayZoomBookings.map(b => ({...b, isZoom: true}))];
            
            // 시간순으로 정렬
            allBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

            // 예약 이벤트 표시
            allBookings.forEach(booking => {
                const event = document.createElement('div');
                event.className = 'calendar-event';
                
                const roomName = document.createElement('span');
                roomName.className = 'event-room';
                roomName.textContent = booking.isZoom ? '📹 줌 예약' : (booking.roomName || '');
                
                const time = document.createElement('span');
                time.className = 'event-time';
                time.textContent = `${this.formatTime(booking.startTime)}`;
                
                event.appendChild(roomName);
                event.appendChild(time);
                
                // 클릭 시 상세 정보 표시 및 취소 옵션
                event.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showBookingDetails(booking);
                });
                
                dayCell.appendChild(event);
            });

            // 날짜 클릭 시 예약 모달 열기
            dayCell.addEventListener('click', (e) => {
                // 예약 이벤트 클릭이 아닌 경우에만
                if (!e.target.closest('.calendar-event')) {
                    this.openBookingModalFromCalendar(dateStr);
                }
            });

            grid.appendChild(dayCell);
        }
    }

    formatDateForCalendar(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatTime(timeStr) {
        // "09:30" -> "9시 30분"
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const min = parseInt(minutes);
        if (min === 0) {
            return `${hour}시`;
        }
        return `${hour}시 ${min}분`;
    }

    showBookingDetails(booking) {
        let details = '';
        if (booking.isZoom) {
            details = `
줌 예약
날짜: ${this.formatDate(booking.date)}
시간: ${booking.startTime} ~ ${booking.endTime}
예약자: ${booking.userName}
${booking.attendees ? `참석자: ${booking.attendees}` : ''}
${booking.purpose ? `목적: ${booking.purpose}` : ''}
${booking.roomName ? `회의실: ${booking.roomName}` : ''}
            `.trim();
            
            if (confirm(details + '\n\n예약을 취소하시겠습니까?')) {
                this.cancelZoomBooking(booking.id);
            }
        } else {
            const room = this.dataManager.rooms.find(r => r.id === booking.roomId);
            details = `
회의실: ${booking.roomName}
날짜: ${this.formatDate(booking.date)}
시간: ${booking.startTime} ~ ${booking.endTime}
예약자: ${booking.userName}
${booking.attendees ? `참석자: ${booking.attendees}` : ''}
${booking.purpose ? `목적: ${booking.purpose}` : ''}
            `.trim();
            
            if (confirm(details + '\n\n예약을 취소하시겠습니까?')) {
                this.cancelBooking(booking.id);
            }
        }
    }

    setupFAQ() {
        // 기존 이벤트 리스너 제거를 위해 모든 FAQ 항목 재설정
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach((item, index) => {
            // 기존 이벤트 리스너 제거를 위해 새로 설정
            const question = item.querySelector('.faq-question');
            if (question) {
                // 클릭 이벤트 리스너 추가
                question.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isActive = item.classList.contains('active');
                    
                    // 모든 FAQ 항목 닫기
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // 클릭한 항목만 토글
                    if (isActive) {
                        item.classList.remove('active');
                    } else {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const ui = new UI(dataManager);
});

