// ?°ì´??ê´€ë¦?
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
                    name: '?ŒíšŒ?˜ì‹¤ A',
                    capacity: 4,
                    location: '1701??,
                    facilities: ['?„ë¡œ?í„°', '?”ì´?¸ë³´??]
                },
                {
                    id: 2,
                    name: '?ŒíšŒ?˜ì‹¤ B',
                    capacity: 6,
                    location: '1701??,
                    facilities: ['?„ë¡œ?í„°', '?”ì´?¸ë³´??]
                },
                {
                    id: 3,
                    name: '?ŒíšŒ?˜ì‹¤ C',
                    capacity: 8,
                    location: '1703??,
                    facilities: ['?„ë¡œ?í„°', '?”ì´?¸ë³´??]
                },
                {
                    id: 4,
                    name: '?€?Œì˜??,
                    capacity: 20,
                    location: '1701??,
                    facilities: ['?„ë¡œ?í„°', '?”ì´?¸ë³´??, '?„í™”', '?Œí–¥?œì„¤']
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

// UI ê´€ë¦?
class UI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentPage = 'rooms';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRooms();
        this.renderZoomAccount();
        this.renderBookings();
        this.renderCalendar();
        this.setupModal();
    }

    setupEventListeners() {
        // ?¤ë¹„ê²Œì´??
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });

        // ???ˆì•½ ë²„íŠ¼
        document.getElementById('new-booking-btn').addEventListener('click', () => {
            this.openBookingModal();
        });

        // ?„í„°
        document.getElementById('filter-date').addEventListener('change', () => {
            this.renderBookings();
        });
        document.getElementById('filter-room').addEventListener('change', () => {
            this.renderBookings();
        });

        // ?¬ë ¥ ?¤ë¹„ê²Œì´??
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
        } else if (page === 'calendar') {
            this.renderRooms();
            this.renderZoomAccount();
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
                        <strong>?„ì¹˜:</strong> ${room.location}
                    </div>
                    <div class="room-info-item">
                        <strong>?˜ìš©?¸ì›:</strong> ${room.capacity}ëª?
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
            bookBtn.textContent = '?ˆì•½?˜ê¸°';
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

        // ì¤?ê³„ì • ì¹´ë“œ ì¶”ê?
        const zoomCard = document.createElement('div');
        zoomCard.className = 'room-card';
        zoomCard.innerHTML = `
            <h3>?“¹ ì¤??ˆì•½</h3>
            <div class="room-info">
                <div class="room-info-item">
                    <strong>?€??</strong> ?”ìƒ?Œì˜ ê³„ì •
                </div>
                <div class="room-info-item">
                    <strong>?©ë„:</strong> ?¨ë¼???Œì˜
                </div>
            </div>
            <div class="facilities">
                <span class="facility-tag">?”ìƒ?Œì˜</span>
                <span class="facility-tag">?¹í™” ê°€??/span>
            </div>
        `;
        
        const zoomBookBtn = document.createElement('button');
        zoomBookBtn.className = 'btn-primary';
        zoomBookBtn.style.marginTop = '16px';
        zoomBookBtn.style.width = '100%';
        zoomBookBtn.textContent = 'ì¤??ˆì•½';
        zoomBookBtn.addEventListener('click', () => {
            this.openZoomBookingModal();
        });
        zoomCard.appendChild(zoomBookBtn);
        
        grid.appendChild(zoomCard);
    }

    renderBookings() {
        const list = document.getElementById('bookings-list');
        list.innerHTML = '';

        // ?Œì˜???ˆì•½ê³?ì¤??ˆì•½???©ì¹˜ê¸?
        let allBookings = [
            ...this.dataManager.bookings.map(b => ({...b, isZoom: false})),
            ...this.dataManager.zoomBookings.map(b => ({...b, isZoom: true}))
        ];
        
        // ? ì§œ ?„í„°
        const dateFilter = document.getElementById('filter-date').value;
        if (dateFilter) {
            allBookings = allBookings.filter(b => b.date === dateFilter);
        }

        // ?Œì˜???„í„° (ì¤??ˆì•½?€ ?„í„°?ì„œ ?œì™¸)
        const roomFilter = document.getElementById('filter-room').value;
        if (roomFilter) {
            allBookings = allBookings.filter(b => {
                if (b.isZoom) return false; // ì¤??ˆì•½?€ ?Œì˜???„í„°?ì„œ ?œì™¸
                return b.roomId === parseInt(roomFilter);
            });
        }

        // ?Œì˜???„í„° ?µì…˜ ?…ë°?´íŠ¸
        this.updateRoomFilterOptions();

        // ? ì§œ???•ë ¬
        allBookings.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        if (allBookings.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">?“…</div>
                    <h3>?ˆì•½???†ìŠµ?ˆë‹¤</h3>
                    <p>?ˆë¡œ???ˆì•½??ë§Œë“¤?´ë³´?¸ìš”!</p>
                </div>
            `;
            return;
        }

        allBookings.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            
            if (booking.isZoom) {
                // ì¤??ˆì•½ ì¹´ë“œ
                card.innerHTML = `
                    <div class="booking-info">
                        <h3>?“¹ ì¤??ˆì•½</h3>
                        <div class="booking-details">
                            <div><strong>? ì§œ:</strong> ${this.formatDate(booking.date)}</div>
                            <div><strong>?œê°„:</strong> ${booking.startTime} ~ ${booking.endTime}</div>
                            <div><strong>?ˆì•½??</strong> ${booking.userName}</div>
                            ${booking.attendees ? `<div><strong>ì°¸ì„??</strong> ${booking.attendees}</div>` : ''}
                            ${booking.purpose ? `<div><strong>ëª©ì :</strong> ${booking.purpose}</div>` : ''}
                            ${booking.roomName ? `<div><strong>?Œì˜??</strong> ${booking.roomName}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn-danger" data-zoom-booking-id="${booking.id}">ì·¨ì†Œ</button>
                `;
                
                card.querySelector('.btn-danger').addEventListener('click', () => {
                    if (confirm('?•ë§ ?ˆì•½??ì·¨ì†Œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
                        this.cancelZoomBooking(booking.id);
                    }
                });
            } else {
                // ?Œì˜???ˆì•½ ì¹´ë“œ
                const room = this.dataManager.rooms.find(r => r.id === booking.roomId);
                card.innerHTML = `
                    <div class="booking-info">
                        <h3>${booking.roomName}</h3>
                        <div class="booking-details">
                            <div><strong>? ì§œ:</strong> ${this.formatDate(booking.date)}</div>
                            <div><strong>?œê°„:</strong> ${booking.startTime} ~ ${booking.endTime}</div>
                            <div><strong>?ˆì•½??</strong> ${booking.userName}</div>
                            ${booking.attendees ? `<div><strong>ì°¸ì„??</strong> ${booking.attendees}</div>` : ''}
                            ${booking.purpose ? `<div><strong>ëª©ì :</strong> ${booking.purpose}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn-danger" data-booking-id="${booking.id}">ì·¨ì†Œ</button>
                `;
                
                card.querySelector('.btn-danger').addEventListener('click', () => {
                    if (confirm('?•ë§ ?ˆì•½??ì·¨ì†Œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
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
        select.innerHTML = '<option value="">?„ì²´ ?Œì˜??/option>';
        
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

        // ? ì§œ ê¸°ë³¸ê°’ì„ ?¤ëŠ˜ë¡??¤ì •
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').setAttribute('min', today);

        // ?œê°„ ? íƒ ?œë¡­?¤ìš´ ì´ˆê¸°??
        this.initTimeSelects();

        // ?œê°„ ? íƒ ??hidden input ?…ë°?´íŠ¸
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
        // ?œê°„ ?µì…˜ (0-23)
        const startHourSelect = document.getElementById('booking-start-hour');
        const endHourSelect = document.getElementById('booking-end-hour');
        
        for (let i = 0; i < 24; i++) {
            const option1 = document.createElement('option');
            option1.value = String(i).padStart(2, '0');
            option1.textContent = `${i}??;
            startHourSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = String(i).padStart(2, '0');
            option2.textContent = `${i}??;
            endHourSelect.appendChild(option2);
        }

        // ë¶??µì…˜ (0, 10, 20, 30, 40, 50)
        const startMinuteSelect = document.getElementById('booking-start-minute');
        const endMinuteSelect = document.getElementById('booking-end-minute');
        
        const minutes = [0, 10, 20, 30, 40, 50];
        minutes.forEach(min => {
            const option1 = document.createElement('option');
            option1.value = String(min).padStart(2, '0');
            option1.textContent = `${min}ë¶?;
            startMinuteSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = String(min).padStart(2, '0');
            option2.textContent = `${min}ë¶?;
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

        // ëª¨ë‹¬ ?œëª© ë³€ê²?
        document.querySelector('#booking-modal .modal-header h2').textContent = '?Œì˜???ˆì•½';

        // ?Œì˜??? íƒ ?œì‹œ
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        document.getElementById('booking-room').setAttribute('required', 'required');

        // ?Œì˜??? íƒ ?µì…˜ ì±„ìš°ê¸?
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">?Œì˜?¤ì„ ? íƒ?˜ì„¸??/option>';
        this.dataManager.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            if (roomId && room.id === roomId) {
                option.selected = true;
            }
            roomSelect.appendChild(option);
        });

        // ? ì§œ ê¸°ë³¸ê°?
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').value = today;

        // ?œê°„ ? íƒ ì´ˆê¸°??
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

        // ëª¨ë‹¬ ?œëª© ë³€ê²?
        document.querySelector('#booking-modal .modal-header h2').textContent = 'ì¤??ˆì•½';

        // ?Œì˜??? íƒ ?¨ê¸°ê¸?
        document.getElementById('booking-room').closest('.form-group').style.display = 'none';
        document.getElementById('booking-room').removeAttribute('required');

        // ? ì§œ ê¸°ë³¸ê°?
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('booking-date').value = today;

        // ?œê°„ ? íƒ ì´ˆê¸°??
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
        // ?Œì˜??? íƒ ?¤ì‹œ ?œì‹œ
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
    }

    submitBooking() {
        // ?œê°„ ?…ë ¥ ?•ì¸ (?œë¡­?¤ìš´?ì„œ ì§ì ‘ ?•ì¸)
        const startHour = document.getElementById('booking-start-hour').value;
        const startMinute = document.getElementById('booking-start-minute').value;
        const endHour = document.getElementById('booking-end-hour').value;
        const endMinute = document.getElementById('booking-end-minute').value;

        if (!startHour || !startMinute || !endHour || !endMinute) {
            this.showNotification('?œì‘ ?œê°„ê³?ì¢…ë£Œ ?œê°„??ëª¨ë‘ ? íƒ?´ì£¼?¸ìš”.', 'error');
            return;
        }

        // hidden input ?…ë°?´íŠ¸
        const startTime = `${startHour}:${startMinute}`;
        const endTime = `${endHour}:${endMinute}`;
        document.getElementById('booking-start').value = startTime;
        document.getElementById('booking-end').value = endTime;

        const date = document.getElementById('booking-date').value;
        const userName = document.getElementById('booking-user').value;
        const purpose = document.getElementById('booking-purpose').value;
        const attendees = document.getElementById('booking-attendees').value;

        // ? íš¨??ê²€??
        if (startTime >= endTime) {
            this.showNotification('ì¢…ë£Œ ?œê°„?€ ?œì‘ ?œê°„ë³´ë‹¤ ??–´???©ë‹ˆ??', 'error');
            return;
        }

        // ì¤??„ìš© ?ˆì•½?¸ì? ?•ì¸
        const isZoomOnly = document.getElementById('booking-room').closest('.form-group').style.display === 'none';

        if (isZoomOnly) {
            // ì¤??„ìš© ?ˆì•½
            if (!this.dataManager.isZoomTimeSlotAvailable(date, startTime, endTime)) {
                this.showNotification('?´ë‹¹ ?œê°„??ì¤??ˆì•½???´ë? ?ˆìŠµ?ˆë‹¤.', 'error');
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
            this.renderZoomAccount();
            this.renderBookings();
            this.renderCalendar();
            this.showNotification('ì¤??ˆì•½???„ë£Œ?˜ì—ˆ?µë‹ˆ??');
            return;
        }

        // ?Œì˜???ˆì•½
        const roomId = parseInt(document.getElementById('booking-room').value);
        
        // ?œê°„ ì¶©ëŒ ?•ì¸
        if (!this.dataManager.isTimeSlotAvailable(roomId, date, startTime, endTime)) {
            this.showNotification('?´ë‹¹ ?œê°„???´ë? ?ˆì•½???ˆìŠµ?ˆë‹¤. ?¤ë¥¸ ?œê°„??? íƒ?´ì£¼?¸ìš”.', 'error');
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
            attendees: attendees || '',
            purpose,
            useZoom: false
        };

        this.dataManager.addBooking(booking);

        this.closeBookingModal();
        this.renderRooms();
        this.renderZoomAccount();
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('?ˆì•½???„ë£Œ?˜ì—ˆ?µë‹ˆ??');
    }

    cancelBooking(bookingId) {
        this.dataManager.deleteBooking(bookingId);
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('?ˆì•½??ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??');
    }

    cancelZoomBooking(bookingId) {
        this.dataManager.deleteZoomBooking(bookingId);
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('ì¤??ˆì•½??ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const weekdays = ['??, '??, '??, '??, 'ëª?, 'ê¸?, '??];
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

    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthYearEl = document.getElementById('current-month-year');
        
        // ???„ë„ ?œì‹œ
        const monthNames = ['1??, '2??, '3??, '4??, '5??, '6??, 
                           '7??, '8??, '9??, '10??, '11??, '12??];
        monthYearEl.textContent = `${this.currentYear}??${monthNames[this.currentMonth]}`;

        // ?¬ë ¥ ê·¸ë¦¬??ì´ˆê¸°??
        grid.innerHTML = '';

        // ?”ì¼ ?¤ë”
        const weekdays = ['??, '??, '??, '??, 'ëª?, 'ê¸?, '??];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // ì²?? ì§œ?€ ë§ˆì?ë§?? ì§œ ê³„ì‚°
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // 6ì£??œì‹œ (42??
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            // ?¤ë¥¸ ?”ì˜ ? ì§œ???Œìƒ‰?¼ë¡œ
            if (currentDate.getMonth() !== this.currentMonth) {
                dayCell.classList.add('other-month');
            }
            
            // ?¤ëŠ˜ ? ì§œ ê°•ì¡°
            if (currentDate.getTime() === today.getTime()) {
                dayCell.classList.add('today');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate();
            dayCell.appendChild(dayNumber);

            // ?´ë‹¹ ? ì§œ???ˆì•½ ëª©ë¡ ê°€?¸ì˜¤ê¸?
            const dateStr = this.formatDateForCalendar(currentDate);
            const dayBookings = this.dataManager.bookings.filter(b => b.date === dateStr);
            const dayZoomBookings = this.dataManager.zoomBookings.filter(b => b.date === dateStr);
            
            // ëª¨ë“  ?ˆì•½ ?©ì¹˜ê¸?
            const allBookings = [...dayBookings, ...dayZoomBookings.map(b => ({...b, isZoom: true}))];
            
            // ?œê°„?œìœ¼ë¡??•ë ¬
            allBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

            // ?ˆì•½ ?´ë²¤???œì‹œ
            allBookings.forEach(booking => {
                const event = document.createElement('div');
                event.className = 'calendar-event';
                
                const roomName = document.createElement('span');
                roomName.className = 'event-room';
                roomName.textContent = booking.isZoom ? '?“¹ ì¤??ˆì•½' : (booking.roomName || '');
                
                const time = document.createElement('span');
                time.className = 'event-time';
                time.textContent = `${this.formatTime(booking.startTime)}`;
                
                event.appendChild(roomName);
                event.appendChild(time);
                
                // ?´ë¦­ ???ì„¸ ?•ë³´ ?œì‹œ ë°?ì·¨ì†Œ ?µì…˜
                event.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showBookingDetails(booking);
                });
                
                dayCell.appendChild(event);
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
        // "09:30" -> "9??30ë¶?
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const min = parseInt(minutes);
        if (min === 0) {
            return `${hour}??;
        }
        return `${hour}??${min}ë¶?;
    }

    showBookingDetails(booking) {
        let details = '';
        if (booking.isZoom) {
            details = `
ì¤??ˆì•½
? ì§œ: ${this.formatDate(booking.date)}
?œê°„: ${booking.startTime} ~ ${booking.endTime}
?ˆì•½?? ${booking.userName}
${booking.attendees ? `ì°¸ì„?? ${booking.attendees}` : ''}
${booking.purpose ? `ëª©ì : ${booking.purpose}` : ''}
${booking.roomName ? `?Œì˜?? ${booking.roomName}` : ''}
            `.trim();
            
            if (confirm(details + '\n\n?ˆì•½??ì·¨ì†Œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
                this.cancelZoomBooking(booking.id);
            }
        } else {
            const room = this.dataManager.rooms.find(r => r.id === booking.roomId);
            details = `
?Œì˜?? ${booking.roomName}
? ì§œ: ${this.formatDate(booking.date)}
?œê°„: ${booking.startTime} ~ ${booking.endTime}
?ˆì•½?? ${booking.userName}
${booking.attendees ? `ì°¸ì„?? ${booking.attendees}` : ''}
${booking.purpose ? `ëª©ì : ${booking.purpose}` : ''}
            `.trim();
            
            if (confirm(details + '\n\n?ˆì•½??ì·¨ì†Œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
                this.cancelBooking(booking.id);
            }
        }
    }
}

// ??ì´ˆê¸°??
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const ui = new UI(dataManager);
});
