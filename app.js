// Firebase 데이터베이스 참조 가져오기
function getDatabase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        return firebase.database();
    }
    return null;
}

// 데이터 관리 (Firebase Realtime Database 사용)
class DataManager {
    constructor() {
        this.db = getDatabase();
        this.rooms = [];
        this.bookings = [];
        this.zoomBookings = [];
        this.callbacks = {
            onRoomsUpdate: null,
            onBookingsUpdate: null,
            onZoomBookingsUpdate: null
        };
        
        if (this.db) {
            this.initFirebase();
        } else {
            // Firebase가 없으면 LocalStorage 사용 (폴백)
            console.warn('Firebase가 초기화되지 않았습니다. LocalStorage를 사용합니다.');
            this.rooms = this.loadRoomsFromLocal();
            this.bookings = this.loadBookingsFromLocal();
            this.zoomBookings = this.loadZoomBookingsFromLocal();
            this.initDefaultRooms();
        }
    }

    initFirebase() {
        // Firebase Realtime Database 리스너 설정
        const roomsRef = this.db.ref('rooms');
        const bookingsRef = this.db.ref('bookings');
        const zoomBookingsRef = this.db.ref('zoomBookings');

        // 실시간 동기화
        roomsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Firebase는 배열을 객체로 저장하므로 변환 필요
                if (Array.isArray(data)) {
                    this.rooms = data;
                } else {
                    // 객체인 경우 배열로 변환 (id 순서대로 정렬)
                    this.rooms = Object.values(data).sort((a, b) => (a.id || 0) - (b.id || 0));
                }
            } else {
                this.rooms = [];
            }
            
            if (this.rooms.length === 0) {
                this.initDefaultRooms();
            }
            if (this.callbacks.onRoomsUpdate) {
                this.callbacks.onRoomsUpdate(this.rooms);
            }
        });

        bookingsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('Firebase bookings 데이터 수신:', data);
            
            if (data) {
                // Firebase는 객체로 저장되므로 배열로 변환
                if (Array.isArray(data)) {
                    this.bookings = data;
                } else {
                    this.bookings = Object.values(data);
                }
            } else {
                this.bookings = [];
            }
            
            console.log('Firebase bookings 업데이트 완료:', this.bookings.length, '개', this.bookings);
            
            // LocalStorage에도 동기화 (폴백용)
            this.saveBookingsToLocal();
            
            if (this.callbacks.onBookingsUpdate) {
                console.log('Bookings 업데이트 콜백 실행');
                this.callbacks.onBookingsUpdate(this.bookings);
            } else {
                console.warn('Bookings 업데이트 콜백이 설정되지 않았습니다!');
            }
        }, (error) => {
            console.error('Firebase bookings 읽기 오류:', error);
            // 오류 발생 시 LocalStorage에서 로드
            this.bookings = this.loadBookingsFromLocal();
            if (this.callbacks.onBookingsUpdate) {
                this.callbacks.onBookingsUpdate(this.bookings);
            }
        });

        zoomBookingsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('Firebase zoomBookings 데이터 수신:', data);
            
            if (data) {
                // Firebase는 객체로 저장되므로 배열로 변환
                if (Array.isArray(data)) {
                    this.zoomBookings = data;
                } else {
                    this.zoomBookings = Object.values(data);
                }
            } else {
                this.zoomBookings = [];
            }
            
            console.log('Firebase zoomBookings 업데이트 완료:', this.zoomBookings.length, '개', this.zoomBookings);
            
            // LocalStorage에도 동기화 (폴백용)
            this.saveZoomBookingsToLocal();
            
            if (this.callbacks.onZoomBookingsUpdate) {
                console.log('ZoomBookings 업데이트 콜백 실행');
                this.callbacks.onZoomBookingsUpdate(this.zoomBookings);
            } else {
                console.warn('ZoomBookings 업데이트 콜백이 설정되지 않았습니다!');
            }
        }, (error) => {
            console.error('Firebase zoomBookings 읽기 오류:', error);
            // 오류 발생 시 LocalStorage에서 로드
            this.zoomBookings = this.loadZoomBookingsFromLocal();
            if (this.callbacks.onZoomBookingsUpdate) {
                this.callbacks.onZoomBookingsUpdate(this.zoomBookings);
            }
        });
    }

    initDefaultRooms() {
        if (this.rooms.length === 0) {
            const defaultRooms = [
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
            
            if (this.db) {
                // Firebase에 저장 (배열을 객체로 변환하여 저장)
                const roomsObj = {};
                defaultRooms.forEach(room => {
                    roomsObj[room.id] = room;
                });
                this.db.ref('rooms').set(roomsObj);
                this.rooms = defaultRooms; // 즉시 사용 가능하도록
            } else {
                // LocalStorage에 저장
                this.rooms = defaultRooms;
                this.saveRoomsToLocal();
            }
        }
    }

    // LocalStorage 폴백 메서드
    loadRoomsFromLocal() {
        const data = localStorage.getItem('meetingRooms');
        return data ? JSON.parse(data) : [];
    }

    saveRoomsToLocal() {
        localStorage.setItem('meetingRooms', JSON.stringify(this.rooms));
    }

    loadBookingsFromLocal() {
        const data = localStorage.getItem('meetingBookings');
        return data ? JSON.parse(data) : [];
    }

    saveBookingsToLocal() {
        localStorage.setItem('meetingBookings', JSON.stringify(this.bookings));
    }

    loadZoomBookingsFromLocal() {
        const data = localStorage.getItem('zoomBookings');
        return data ? JSON.parse(data) : [];
    }

    saveZoomBookingsToLocal() {
        localStorage.setItem('zoomBookings', JSON.stringify(this.zoomBookings));
    }

    // Firebase 저장 메서드
    saveRooms() {
        if (this.db) {
            this.db.ref('rooms').set(this.rooms);
        } else {
            this.saveRoomsToLocal();
        }
    }

    saveBookings() {
        if (this.db) {
            // 배열을 객체로 변환 (Firebase는 배열 인덱스를 키로 사용)
            const bookingsObj = {};
            this.bookings.forEach(booking => {
                if (booking && booking.id) {
                    bookingsObj[booking.id] = booking;
                }
            });
            console.log('Firebase에 예약 저장:', Object.keys(bookingsObj).length, '개', bookingsObj);
            this.db.ref('bookings').set(bookingsObj).then(() => {
                console.log('✅ Firebase 저장 완료');
                // 저장 후 콜백 호출 (UI 업데이트)
                if (this.callbacks.onBookingsUpdate) {
                    console.log('✅ Firebase 저장 후 콜백 호출');
                    this.callbacks.onBookingsUpdate(this.bookings);
                }
            }).catch((error) => {
                console.error('❌ Firebase 저장 오류:', error);
            });
        } else {
            console.log('LocalStorage에 예약 저장:', this.bookings.length, '개');
            this.saveBookingsToLocal();
            // LocalStorage 저장 후에도 콜백 호출
            if (this.callbacks.onBookingsUpdate) {
                this.callbacks.onBookingsUpdate(this.bookings);
            }
        }
    }

    saveZoomBookings() {
        if (this.db) {
            const zoomBookingsObj = {};
            this.zoomBookings.forEach(booking => {
                if (booking && booking.id) {
                    zoomBookingsObj[booking.id] = booking;
                }
            });
            console.log('Firebase에 줌 예약 저장:', Object.keys(zoomBookingsObj).length, '개', zoomBookingsObj);
            this.db.ref('zoomBookings').set(zoomBookingsObj).then(() => {
                console.log('✅ Firebase 줌 예약 저장 완료');
                // 저장 후 콜백 호출 (UI 업데이트)
                if (this.callbacks.onZoomBookingsUpdate) {
                    console.log('✅ Firebase 줌 예약 저장 후 콜백 호출');
                    this.callbacks.onZoomBookingsUpdate(this.zoomBookings);
                }
            }).catch((error) => {
                console.error('❌ Firebase 줌 예약 저장 오류:', error);
            });
        } else {
            console.log('LocalStorage에 줌 예약 저장:', this.zoomBookings.length, '개');
            this.saveZoomBookingsToLocal();
            // LocalStorage 저장 후에도 콜백 호출
            if (this.callbacks.onZoomBookingsUpdate) {
                this.callbacks.onZoomBookingsUpdate(this.zoomBookings);
            }
        }
    }

    addBooking(booking) {
        booking.id = Date.now();
        booking.createdAt = new Date().toISOString();
        this.bookings.push(booking);
        console.log('✅ 예약 추가:', booking);
        console.log('현재 bookings 배열:', this.bookings);
        this.saveBookings();
        
        // 콜백 즉시 호출 (UI 업데이트)
        if (this.callbacks.onBookingsUpdate) {
            console.log('✅ Bookings 업데이트 콜백 즉시 호출');
            this.callbacks.onBookingsUpdate(this.bookings);
        }
        
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
        console.log('✅ 줌 예약 추가:', booking);
        console.log('현재 zoomBookings 배열:', this.zoomBookings);
        this.saveZoomBookings();
        
        // 콜백 즉시 호출 (UI 업데이트)
        if (this.callbacks.onZoomBookingsUpdate) {
            console.log('✅ ZoomBookings 업데이트 콜백 즉시 호출');
            this.callbacks.onZoomBookingsUpdate(this.zoomBookings);
        }
        
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

    // 콜백 설정 (UI 업데이트용)
    setOnRoomsUpdate(callback) {
        this.callbacks.onRoomsUpdate = callback;
    }

    setOnBookingsUpdate(callback) {
        this.callbacks.onBookingsUpdate = callback;
    }

    setOnZoomBookingsUpdate(callback) {
        this.callbacks.onZoomBookingsUpdate = callback;
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
        this.renderCalendar();
        this.renderRooms();
        this.renderZoomAccount();
        this.setupModal();
        this.setupFAQ();
        
        // Firebase 실시간 업데이트 콜백 설정
        if (this.dataManager.db) {
            console.log('Firebase가 활성화되어 있습니다. 데이터 로딩 대기 중...');
            
            // 콜백이 호출될 때마다 렌더링
            this.dataManager.setOnBookingsUpdate(() => {
                console.log('Bookings 업데이트 콜백 호출');
                this.renderBookings();
                this.renderCalendar();
            });
            this.dataManager.setOnZoomBookingsUpdate(() => {
                console.log('ZoomBookings 업데이트 콜백 호출');
                this.renderBookings();
                this.renderCalendar();
            });
            this.dataManager.setOnRoomsUpdate(() => {
                this.renderRooms();
                this.renderZoomAccount();
            });
            
            // Firebase 초기화 후 데이터 로드 대기
            // 여러 번 시도하여 데이터가 확실히 로드되도록
            setTimeout(() => {
                console.log('초기 데이터 로드 시도 1');
                this.renderBookings();
            }, 300);
            
            setTimeout(() => {
                console.log('초기 데이터 로드 시도 2');
                this.renderBookings();
            }, 1000);
            
            setTimeout(() => {
                console.log('초기 데이터 로드 시도 3');
                this.renderBookings();
            }, 2000);
        } else {
            console.log('LocalStorage를 사용합니다.');
            // LocalStorage 사용 시 즉시 렌더링
            this.renderBookings();
        }
    }

    setupEventListeners() {
        // 로고 클릭 시 목록 화면으로 이동
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.switchPage('calendar');
            });
        }

        // 네비게이션
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });
        
        // 이벤트 위임: rooms-grid의 모든 버튼 클릭 처리
        const roomsGrid = document.getElementById('rooms-grid');
        if (roomsGrid) {
            // 기존 이벤트 리스너 제거 (중복 방지)
            const existingHandler = roomsGrid._bookingClickHandler;
            if (existingHandler) {
                roomsGrid.removeEventListener('click', existingHandler);
            }
            
            // 이벤트 위임으로 버튼 클릭 처리
            const bookingClickHandler = (e) => {
                const button = e.target.closest('button.btn-primary');
                if (!button) return;
                
                const roomId = button.getAttribute('data-room-id');
                const roomName = button.getAttribute('data-room-name');
                
                if (roomId && button.textContent === '예약하기') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔵 이벤트 위임으로 예약하기 버튼 클릭:', roomId, roomName);
                    
                    try {
                        this.openBookingModal(parseInt(roomId));
                    } catch (error) {
                        console.error('모달 열기 오류:', error);
                        alert('예약 모달을 열 수 없습니다: ' + error.message);
                    }
                } else if (button.textContent === '줌 예약') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔵 이벤트 위임으로 줌 예약 버튼 클릭');
                    
                    try {
                        this.openZoomBookingModal();
                    } catch (error) {
                        console.error('줌 모달 열기 오류:', error);
                        alert('줌 예약 모달을 열 수 없습니다: ' + error.message);
                    }
                }
            };
            
            roomsGrid.addEventListener('click', bookingClickHandler);
            roomsGrid._bookingClickHandler = bookingClickHandler; // 나중에 제거하기 위해 저장
            console.log('✅ 이벤트 위임 등록 완료 (rooms-grid)');
        }


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
            // 필터 초기화
            document.getElementById('filter-date').value = '';
            document.getElementById('filter-room').value = '';
            
            // 데이터가 로드될 시간을 주기 위해 여러 번 시도
            console.log('내 예약 페이지로 전환 - 데이터 로드 시작');
            this.renderBookings(); // 즉시 시도
            
            setTimeout(() => {
                console.log('내 예약 페이지 - 데이터 로드 시도 2');
                this.renderBookings();
            }, 300);
            
            setTimeout(() => {
                console.log('내 예약 페이지 - 데이터 로드 시도 3');
                this.renderBookings();
            }, 800);
        } else if (page === 'calendar') {
            this.renderCalendar();
        } else if (page === 'faq') {
            this.setupFAQ();
        }
    }

    renderRooms() {
        const grid = document.getElementById('rooms-grid');
        if (!grid) return; // rooms-grid가 없으면 종료
        
        // 줌 카드를 제외하고 회의실 카드만 제거
        const zoomCard = grid.querySelector('[data-zoom-card]');
        const roomCards = grid.querySelectorAll('.room-card:not([data-zoom-card])');
        roomCards.forEach(card => card.remove());
        
        // 줌 카드가 있으면 임시로 저장했다가 나중에 다시 추가
        let zoomCardElement = null;
        if (zoomCard) {
            zoomCardElement = zoomCard.cloneNode(true);
            zoomCard.remove();
        }

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
            bookBtn.type = 'button';
            bookBtn.setAttribute('data-room-id', room.id);
            bookBtn.setAttribute('data-room-name', room.name);
            
            // CSS 강제 설정 - 클릭 가능하도록
            bookBtn.style.cursor = 'pointer';
            bookBtn.style.pointerEvents = 'auto';
            bookBtn.style.position = 'relative';
            bookBtn.style.zIndex = '999';
            bookBtn.style.userSelect = 'none';
            bookBtn.style.touchAction = 'manipulation';
            
            // 가장 간단하고 확실한 클릭 이벤트 - 직접 함수 바인딩
            const self = this;
            const roomIdValue = room.id;
            const roomNameValue = room.name;
            
            // onclick 이벤트 (이벤트 위임과 함께 작동)
            bookBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 예약하기 버튼 onclick:', roomIdValue, roomNameValue);
                
                try {
                    self.openBookingModal(roomIdValue);
                } catch (error) {
                    console.error('모달 열기 오류 (onclick):', error);
                    alert('예약 모달을 열 수 없습니다: ' + error.message);
                }
                return false;
            };
            
            // addEventListener도 추가 (이중 보험) - 캡처 단계에서 실행
            bookBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 예약하기 버튼 addEventListener:', roomIdValue, roomNameValue);
                
                try {
                    self.openBookingModal(roomIdValue);
                } catch (error) {
                    console.error('모달 열기 오류 (addEventListener):', error);
                }
            }, true); // 캡처 단계에서 실행
            
            // mousedown 이벤트도 추가
            bookBtn.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 예약하기 버튼 mousedown:', roomIdValue);
            });
            
            // touchstart 이벤트 (모바일)
            bookBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 예약하기 버튼 touchstart:', roomIdValue);
                try {
                    self.openBookingModal(roomIdValue);
                } catch (error) {
                    console.error('모달 열기 오류 (touchstart):', error);
                }
            });
            
            card.appendChild(bookBtn);
            
            grid.appendChild(card);
        });
        
        // 줌 카드가 있었으면 다시 추가
        if (zoomCardElement) {
            grid.appendChild(zoomCardElement);
            // 이벤트 리스너 다시 연결
            const zoomBtn = zoomCardElement.querySelector('.btn-primary');
            if (zoomBtn) {
                const self = this;
                zoomBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        self.openZoomBookingModal();
                    } catch (error) {
                        console.error('줌 모달 열기 오류:', error);
                        alert('줌 예약 모달을 열 수 없습니다: ' + error.message);
                    }
                    return false;
                };
            }
        }
    }

    renderZoomAccount() {
        const grid = document.getElementById('rooms-grid');
        if (!grid) return;
        
        // 기존 줌 카드가 있으면 제거 (중복 방지)
        const existingZoomCard = grid.querySelector('[data-zoom-card]');
        if (existingZoomCard) {
            existingZoomCard.remove();
        }
        
        // 줌 계정 카드 추가 (rooms-grid에 직접 추가)
        const zoomCard = document.createElement('div');
        zoomCard.className = 'room-card';
        zoomCard.setAttribute('data-zoom-card', 'true');
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
        zoomBookBtn.type = 'button';
        zoomBookBtn.style.cursor = 'pointer';
        zoomBookBtn.style.pointerEvents = 'auto';
        zoomBookBtn.style.position = 'relative';
        zoomBookBtn.style.zIndex = '999';
        
        // 이벤트 위임과 함께 작동하도록 여러 방법으로 시도
        const self = this;
        
        // onclick 이벤트
        zoomBookBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 줌 예약 버튼 onclick');
            
            try {
                self.openZoomBookingModal();
            } catch (error) {
                console.error('줌 모달 열기 오류 (onclick):', error);
                alert('줌 예약 모달을 열 수 없습니다: ' + error.message);
            }
            return false;
        };
        
        // addEventListener도 추가 (이중 보험)
        zoomBookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 줌 예약 버튼 addEventListener');
            
            try {
                self.openZoomBookingModal();
            } catch (error) {
                console.error('줌 모달 열기 오류 (addEventListener):', error);
            }
        }, true); // 캡처 단계에서 실행
        
        zoomCard.appendChild(zoomBookBtn);
        
        grid.appendChild(zoomCard);
    }

    renderBookings() {
        const list = document.getElementById('bookings-list');
        if (!list) {
            console.warn('bookings-list 요소를 찾을 수 없습니다!');
            return; // bookings-list 요소가 없으면 종료
        }
        
        console.log('=== renderBookings 시작 ===');
        list.innerHTML = '';

        // 데이터 확인 - LocalStorage 폴백도 확인
        let bookings = [];
        let zoomBookings = [];
        
        // 먼저 Firebase에서 확인
        if (this.dataManager.db) {
            bookings = Array.isArray(this.dataManager.bookings) ? this.dataManager.bookings : [];
            zoomBookings = Array.isArray(this.dataManager.zoomBookings) ? this.dataManager.zoomBookings : [];
            console.log('Firebase에서 로드:', {
                bookings: bookings.length,
                zoomBookings: zoomBookings.length,
                bookingsData: bookings,
                zoomBookingsData: zoomBookings
            });
        }
        
        // Firebase가 없거나 데이터가 비어있으면 LocalStorage에서 로드
        if (bookings.length === 0) {
            const localBookings = this.dataManager.loadBookingsFromLocal();
            if (localBookings.length > 0) {
                console.log('LocalStorage에서 bookings 로드:', localBookings.length, '개');
                bookings = localBookings;
            }
        }
        
        if (zoomBookings.length === 0) {
            const localZoomBookings = this.dataManager.loadZoomBookingsFromLocal();
            if (localZoomBookings.length > 0) {
                console.log('LocalStorage에서 zoomBookings 로드:', localZoomBookings.length, '개');
                zoomBookings = localZoomBookings;
            }
        }
        
        const bookingsCount = bookings.length;
        const zoomBookingsCount = zoomBookings.length;
        
        console.log('renderBookings 데이터:', {
            bookings: bookingsCount,
            zoomBookings: zoomBookingsCount,
            total: bookingsCount + zoomBookingsCount,
            bookingsData: bookings,
            zoomBookingsData: zoomBookings,
            hasFirebase: !!this.dataManager.db
        });

        // 회의실 예약과 줌 예약을 합치기
        let allBookings = [
            ...bookings.map(b => ({...b, isZoom: false})),
            ...zoomBookings.map(b => ({...b, isZoom: true}))
        ];
        
        console.log('합쳐진 예약 목록:', allBookings.length, '개', allBookings);
        
        // 날짜 필터 (날짜 형식 정규화)
        const dateFilter = document.getElementById('filter-date').value;
        if (dateFilter) {
            const normalizedFilter = dateFilter.trim();
            allBookings = allBookings.filter(b => {
                const bookingDate = b.date ? b.date.trim() : '';
                return bookingDate === normalizedFilter;
            });
            console.log('날짜 필터 적용:', normalizedFilter, '->', allBookings.length, '개');
        }
        
        // 2025-11-24 날짜 확인
        const testDate = '2025-11-24';
        const testBookings = allBookings.filter(b => {
            const bookingDate = b.date ? b.date.trim() : '';
            return bookingDate === testDate;
        });
        if (testBookings.length > 0) {
            console.log('2025-11-24 예약 발견:', testBookings.length, '개', testBookings);
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
            // booking이 유효한지 확인
            if (!booking || !booking.id) {
                console.warn('유효하지 않은 예약 데이터:', booking);
                return;
            }
            
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
                
                card.querySelector('.btn-danger').addEventListener('click', async () => {
                    if (await customConfirm('정말 예약을 취소하시겠습니까?')) {
                        const confirmed = await this.verifyPassword(booking);
                        if (confirmed) {
                            this.cancelZoomBooking(booking.id);
                        }
                    }
                });
            } else {
                // 회의실 예약 카드
                // 회의실 정보 찾기 (Firebase 또는 LocalStorage에서)
                let room = null;
                
                // rooms가 배열이고 비어있지 않은지 확인
                if (Array.isArray(this.dataManager.rooms) && this.dataManager.rooms.length > 0) {
                    room = this.dataManager.rooms.find(r => r && r.id === booking.roomId);
                }
                
                if (!room) {
                    const localRooms = this.dataManager.loadRoomsFromLocal();
                    if (Array.isArray(localRooms) && localRooms.length > 0) {
                        room = localRooms.find(r => r && r.id === booking.roomId);
                    }
                }
                
                if (!room) {
                    room = { id: booking.roomId, name: booking.roomName || `회의실 ${booking.roomId}` };
                }
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
                
                card.querySelector('.btn-danger').addEventListener('click', async () => {
                    if (await customConfirm('정말 예약을 취소하시겠습니까?')) {
                        const confirmed = await this.verifyPassword(booking);
                        if (confirmed) {
                            this.cancelBooking(booking.id);
                        }
                    }
                });
            }
            
            list.appendChild(card);
        });
    }

    updateRoomFilterOptions() {
        const select = document.getElementById('filter-room');
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">전체 회의실</option>';
        
        // rooms가 배열이고 비어있지 않은지 확인
        if (Array.isArray(this.dataManager.rooms) && this.dataManager.rooms.length > 0) {
            this.dataManager.rooms.forEach(room => {
                if (room && room.id && room.name) {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = room.name;
                    select.appendChild(option);
                }
            });
        } else {
            // LocalStorage에서 로드 시도
            const localRooms = this.dataManager.loadRoomsFromLocal();
            if (Array.isArray(localRooms) && localRooms.length > 0) {
                localRooms.forEach(room => {
                    if (room && room.id && room.name) {
                        const option = document.createElement('option');
                        option.value = room.id;
                        option.textContent = room.name;
                        select.appendChild(option);
                    }
                });
            }
        }
        
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
        console.log('=== openBookingModal 시작 ===', roomId);
        
        // 모달 요소 확인
        const modal = document.getElementById('booking-modal');
        if (!modal) {
            console.error('❌ booking-modal 요소를 찾을 수 없습니다!');
            alert('예약 모달을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        console.log('✅ 모달 요소 찾음:', modal);
        
        // 폼 요소 확인
        const form = document.getElementById('booking-form');
        if (!form) {
            console.error('❌ booking-form 요소를 찾을 수 없습니다!');
            alert('예약 폼을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        console.log('✅ 폼 요소 찾음:', form);
        
        form.reset();

        // 모달 제목 변경
        document.querySelector('#booking-modal .modal-header h2').textContent = '회의실 예약';

        // 회의실 선택 표시
        document.getElementById('booking-room').closest('.form-group').style.display = 'block';
        document.getElementById('booking-room').setAttribute('required', 'required');

        // 회의실 선택 옵션 채우기
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">회의실을 선택하세요</option>';
        
        // rooms가 비어있으면 LocalStorage에서도 확인
        let roomsToUse = this.dataManager.rooms;
        if (roomsToUse.length === 0) {
            roomsToUse = this.dataManager.loadRoomsFromLocal();
            // LocalStorage에도 없으면 기본 회의실 사용
            if (roomsToUse.length === 0) {
                this.dataManager.initDefaultRooms();
                roomsToUse = this.dataManager.rooms.length > 0 ? this.dataManager.rooms : [
                    { id: 1, name: '소회의실 A' },
                    { id: 2, name: '소회의실 B' },
                    { id: 3, name: '소회의실 C' },
                    { id: 4, name: '대회의실' }
                ];
            }
        }
        
        roomsToUse.forEach(room => {
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
        const zoomCheckboxGroup = document.getElementById('zoom-checkbox-group');
        if (zoomCheckboxGroup) {
            if (roomId) {
                zoomCheckboxGroup.style.display = 'block';
                console.log('✅ 줌 체크박스 그룹 표시 (roomId 있음):', roomId);
            } else {
                zoomCheckboxGroup.style.display = 'none';
                console.log('줌 체크박스 그룹 숨김 (roomId 없음)');
            }
        } else {
            console.error('❌ zoom-checkbox-group 요소를 찾을 수 없습니다!');
        }
        
        const bookingZoom = document.getElementById('booking-zoom');
        if (bookingZoom) {
            bookingZoom.checked = false;
        } else {
            console.error('❌ booking-zoom 요소를 찾을 수 없습니다!');
        }

        // 회의실 선택 변경 이벤트 추가
        roomSelect.onchange = () => {
            const selectedValue = roomSelect.value;
            console.log('회의실 선택 변경:', selectedValue);
            
            if (zoomCheckboxGroup) {
                if (selectedValue && selectedValue !== '') {
                    zoomCheckboxGroup.style.display = 'block';
                    console.log('✅ 줌 체크박스 그룹 표시 (회의실 선택됨):', selectedValue);
                } else {
                    zoomCheckboxGroup.style.display = 'none';
                    console.log('줌 체크박스 그룹 숨김 (회의실 선택 안됨)');
                }
            }
        };
        
        // roomId가 있으면 즉시 줌 체크박스 표시 (강제)
        if (roomId && zoomCheckboxGroup) {
            setTimeout(() => {
                zoomCheckboxGroup.style.display = 'block';
                console.log('✅ 줌 체크박스 그룹 강제 표시 (roomId:', roomId, ')');
            }, 100);
        }

        // 시간 선택 초기화
        document.getElementById('booking-start-hour').value = '';
        document.getElementById('booking-start-minute').value = '';
        document.getElementById('booking-end-hour').value = '';
        document.getElementById('booking-end-minute').value = '';
        document.getElementById('booking-start').value = '';
        document.getElementById('booking-end').value = '';
        document.getElementById('booking-attendees').value = '';

        // 모달 표시 - 여러 방법으로 시도
        console.log('모달 표시 시도...');
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        console.log('모달 상태:', {
            hasActive: modal.classList.contains('active'),
            display: modal.style.display,
            visibility: modal.style.visibility,
            opacity: modal.style.opacity
        });
        
        // 모달이 실제로 표시되는지 확인 및 재시도
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                console.warn('⚠️ 모달이 열리지 않았습니다. 강제로 다시 시도합니다.');
                modal.classList.add('active');
                modal.style.display = 'flex';
            }
            console.log('✅ 모달 열기 완료');
        }, 50);
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
        
        // rooms가 비어있으면 LocalStorage에서도 확인
        let roomsToUse = this.dataManager.rooms;
        if (roomsToUse.length === 0) {
            roomsToUse = this.dataManager.loadRoomsFromLocal();
            // LocalStorage에도 없으면 기본 회의실 사용
            if (roomsToUse.length === 0) {
                this.dataManager.initDefaultRooms();
                roomsToUse = this.dataManager.rooms.length > 0 ? this.dataManager.rooms : [
                    { id: 1, name: '소회의실 A' },
                    { id: 2, name: '소회의실 B' },
                    { id: 3, name: '소회의실 C' },
                    { id: 4, name: '대회의실' }
                ];
            }
        }
        
        roomsToUse.forEach(room => {
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

        // 모달 표시 - 여러 방법으로 시도
        console.log('달력에서 모달 표시 시도...');
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                console.warn('⚠️ 모달이 열리지 않았습니다. 강제로 다시 시도합니다.');
                modal.classList.add('active');
                modal.style.display = 'flex';
            }
            console.log('✅ 달력 모달 열기 완료');
        }, 50);
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
        
        // rooms가 비어있으면 LocalStorage에서도 확인
        let roomsToUse = this.dataManager.rooms;
        if (roomsToUse.length === 0) {
            roomsToUse = this.dataManager.loadRoomsFromLocal();
            // LocalStorage에도 없으면 기본 회의실 사용
            if (roomsToUse.length === 0) {
                this.dataManager.initDefaultRooms();
                roomsToUse = this.dataManager.rooms.length > 0 ? this.dataManager.rooms : [
                    { id: 1, name: '소회의실 A' },
                    { id: 2, name: '소회의실 B' },
                    { id: 3, name: '소회의실 C' },
                    { id: 4, name: '대회의실' }
                ];
            }
        }
        
        roomsToUse.forEach(room => {
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

        // 모달 표시 - 여러 방법으로 시도
        console.log('줌 모달 표시 시도...');
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        console.log('줌 모달 상태:', {
            hasActive: modal.classList.contains('active'),
            display: modal.style.display,
            visibility: modal.style.visibility,
            opacity: modal.style.opacity
        });
        
        // 모달이 실제로 표시되는지 확인 및 재시도
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                console.warn('⚠️ 줌 모달이 열리지 않았습니다. 강제로 다시 시도합니다.');
                modal.classList.add('active');
                modal.style.display = 'flex';
            }
            console.log('✅ 줌 모달 열기 완료');
        }, 50);
    }

    closeBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (!modal) {
            console.error('booking-modal 요소를 찾을 수 없습니다!');
            return;
        }
        
        console.log('모달 닫기 시작');
        
        // 여러 방법으로 모달 닫기 시도
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        
        // 폼 초기화
        const form = document.getElementById('booking-form');
        if (form) {
            form.reset();
        }
        
        // 회의실 선택 다시 표시
        const roomGroup = document.getElementById('booking-room')?.closest('.form-group');
        if (roomGroup) {
            roomGroup.style.display = 'block';
        }
        
        // 줌 체크박스 숨기기
        const zoomGroup = document.getElementById('zoom-checkbox-group');
        if (zoomGroup) {
            zoomGroup.style.display = 'none';
        }
        
        const zoomCheckbox = document.getElementById('booking-zoom');
        if (zoomCheckbox) {
            zoomCheckbox.checked = false;
        }
        
        // 날짜 필드 초기화
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            dateInput.removeAttribute('readonly');
            dateInput.style.backgroundColor = '';
            dateInput.style.cursor = '';
        }
        
        // 회의실 선택 이벤트 리스너 제거
        const roomSelect = document.getElementById('booking-room');
        if (roomSelect) {
            roomSelect.onchange = null;
        }
        
        console.log('모달 닫기 완료');
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
        const password = document.getElementById('booking-password').value;
        
        // 비밀번호 유효성 검사
        if (!password || password.trim() === '') {
            this.showNotification('예약 비밀번호를 입력해주세요.', 'error');
            return;
        }
        
        if (password.length < 4) {
            this.showNotification('비밀번호는 최소 4자 이상이어야 합니다.', 'error');
            return;
        }

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
                purpose,
                password: password
            };

            this.dataManager.addZoomBooking(zoomBooking);
            
            // 알림 먼저 표시
            this.showNotification('줌 예약이 완료되었습니다!');
            
            // 모달 닫기
            this.closeBookingModal();
            
            // 약간의 지연을 두고 렌더링 (Firebase 저장 완료 대기)
            setTimeout(() => {
                console.log('줌 예약 완료 후 렌더링 시작');
                this.renderBookings();
                this.renderCalendar();
            }, 300);
            
            setTimeout(() => {
                console.log('줌 예약 완료 후 렌더링 재시도');
                this.renderBookings();
                this.renderCalendar();
            }, 1000);
            
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

        // 회의실 정보 찾기 (Firebase 또는 LocalStorage에서)
        let room = null;
        
        // rooms가 배열이고 비어있지 않은지 확인
        if (Array.isArray(this.dataManager.rooms) && this.dataManager.rooms.length > 0) {
            room = this.dataManager.rooms.find(r => r && r.id === roomId);
        }
        
        // Firebase 데이터가 없으면 LocalStorage에서 찾기
        if (!room) {
            const localRooms = this.dataManager.loadRoomsFromLocal();
            if (Array.isArray(localRooms) && localRooms.length > 0) {
                room = localRooms.find(r => r && r.id === roomId);
            }
        }
        
        // 여전히 없으면 기본 회의실 정보 사용
        if (!room) {
            console.warn('회의실 정보를 찾을 수 없습니다. 기본 정보를 사용합니다. roomId:', roomId);
            const defaultRooms = [
                { id: 1, name: '소회의실 A' },
                { id: 2, name: '소회의실 B' },
                { id: 3, name: '소회의실 C' },
                { id: 4, name: '대회의실' }
            ];
            room = defaultRooms.find(r => r.id === roomId) || { id: roomId, name: `회의실 ${roomId}` };
        }
        
        console.log('회의실 정보:', room);
        
        // room이 여전히 없으면 오류
        if (!room) {
            console.error('회의실 정보를 찾을 수 없습니다. roomId:', roomId);
            this.showNotification('회의실 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.', 'error');
            return;
        }
        
        const useZoom = document.getElementById('booking-zoom') && document.getElementById('booking-zoom').checked;

        // room.name이 없을 수 있으므로 안전하게 처리
        const roomName = (room && room.name) ? room.name : `회의실 ${roomId}`;
        
        const booking = {
            roomId,
            roomName: roomName,
            date,
            startTime,
            endTime,
            userName,
            attendees: attendees || '',
            purpose,
            useZoom: useZoom || false,
            password: password
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
                    roomName: (room && room.name) ? room.name : `회의실 ${roomId}`,
                    password: password
                };
                this.dataManager.addZoomBooking(zoomBooking);
            }
        }

        // 알림 먼저 표시
        this.showNotification('예약이 완료되었습니다!');
        
        // 모달 닫기
        this.closeBookingModal();
        
        // 약간의 지연을 두고 렌더링 (Firebase 저장 완료 대기)
        setTimeout(() => {
            console.log('예약 완료 후 렌더링 시작');
            this.renderBookings();
            this.renderCalendar();
        }, 300);
        
        setTimeout(() => {
            console.log('예약 완료 후 렌더링 재시도');
            this.renderBookings();
            this.renderCalendar();
        }, 1000);
    }

    cancelBooking(bookingId) {
        this.dataManager.deleteBooking(bookingId);
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('예약이 취소되었습니다.');
    }

    cancelZoomBooking(bookingId) {
        this.dataManager.deleteZoomBooking(bookingId);
        this.renderBookings();
        this.renderCalendar();
        this.showNotification('줌 예약이 취소되었습니다.');
    }
    
    verifyPassword(booking) {
        return new Promise((resolve) => {
            const modal = document.getElementById('password-modal');
            const passwordInput = document.getElementById('cancel-password');
            const okBtn = document.getElementById('password-ok-btn');
            const cancelBtn = document.getElementById('password-cancel-btn');
            const closeBtn = document.getElementById('close-password-modal');
            
            if (!modal || !passwordInput || !okBtn || !cancelBtn) {
                console.error('비밀번호 확인 모달 요소를 찾을 수 없습니다!');
                resolve(false);
                return;
            }
            
            // 입력 필드 초기화
            passwordInput.value = '';
            passwordInput.focus();
            
            // 모달 표시
            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            
            const cleanup = () => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                modal.style.pointerEvents = 'none';
                passwordInput.value = '';
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                if (closeBtn) closeBtn.onclick = null;
            };
            
            const handleConfirm = () => {
                const inputPassword = passwordInput.value.trim();
                const bookingPassword = booking.password || '';
                
                if (!inputPassword) {
                    this.showNotification('비밀번호를 입력해주세요.', 'error');
                    passwordInput.focus();
                    return;
                }
                
                if (inputPassword !== bookingPassword) {
                    this.showNotification('비밀번호가 일치하지 않습니다.', 'error');
                    passwordInput.value = '';
                    passwordInput.focus();
                    return;
                }
                
                cleanup();
                resolve(true);
            };
            
            okBtn.onclick = handleConfirm;
            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };
            
            if (closeBtn) {
                closeBtn.onclick = () => {
                    cleanup();
                    resolve(false);
                };
            }
            
            // Enter 키로 확인
            passwordInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                }
            };
            
            // 모달 배경 클릭 시 취소
            modal.addEventListener('click', function backdropClick(e) {
                if (e.target === modal) {
                    cleanup();
                    resolve(false);
                    modal.removeEventListener('click', backdropClick);
                }
            }, { once: true });
        });
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
            holidays['2026-06-03'] = '지방선거';
            holidays['2026-07-17'] = '제헌절';
            holidays['2026-09-24'] = '추석';
            holidays['2026-09-25'] = '추석';
            holidays['2026-09-26'] = '추석';
        }
        
        // 대체공휴일 계산 (공휴일이 토요일 또는 일요일인 경우 다음 평일을 대체공휴일로 지정)
        // 단, 2025년 10월 10일은 대체공휴일이 아님
        const substituteHolidays = this.calculateSubstituteHolidays(year, holidays);
        Object.assign(holidays, substituteHolidays);
        
        // 2025년 특별 처리
        if (year === 2025) {
            // 2025년 10월 8일은 대체공휴일 (추석 연휴 대체)
            holidays['2025-10-08'] = '대체공휴일';
            // 2025년 10월 10일을 공휴일에서 명시적으로 제외
            delete holidays['2025-10-10'];
        }
        // 2026년 특별 처리 (대체공휴일이 아닌 날짜 명시적 제외)
        if (year === 2026) {
            delete holidays['2026-06-08'];
            delete holidays['2026-09-28'];
        }
        
        return holidays;
    }

    calculateSubstituteHolidays(year, holidays) {
        const substituteHolidays = {};
        const excludeDates = ['2025-10-10', '2026-06-08', '2026-09-28']; // 대체공휴일이 아닌 날짜 목록
        
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

            // 날짜와 공휴일 이름을 함께 표시하는 컨테이너
            const dayNumberContainer = document.createElement('div');
            dayNumberContainer.className = 'day-number-container';
            
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate();
            dayNumberContainer.appendChild(dayNumber);

            // 공휴일 이름 표시 (숫자 옆에)
            if (holidayName) {
                const holidayLabel = document.createElement('span');
                holidayLabel.className = 'holiday-label';
                holidayLabel.textContent = holidayName;
                dayNumberContainer.appendChild(holidayLabel);
            }
            
            dayCell.appendChild(dayNumberContainer);

            // 해당 날짜의 예약 목록 가져오기
            // LocalStorage 폴백도 확인
            let bookings = this.dataManager.bookings || [];
            let zoomBookings = this.dataManager.zoomBookings || [];
            
            if (!this.dataManager.db || bookings.length === 0) {
                const localBookings = this.dataManager.loadBookingsFromLocal();
                if (localBookings.length > 0) {
                    bookings = localBookings;
                }
            }
            
            if (!this.dataManager.db || zoomBookings.length === 0) {
                const localZoomBookings = this.dataManager.loadZoomBookingsFromLocal();
                if (localZoomBookings.length > 0) {
                    zoomBookings = localZoomBookings;
                }
            }
            
            // 날짜 형식 정규화 (YYYY-MM-DD)
            const normalizedDateStr = dateStr;
            
            const dayBookings = bookings.filter(b => {
                // 날짜 형식 정규화
                const bookingDate = b.date ? b.date.trim() : '';
                return bookingDate === normalizedDateStr;
            });
            
            const dayZoomBookings = zoomBookings.filter(b => {
                // 날짜 형식 정규화
                const bookingDate = b.date ? b.date.trim() : '';
                return bookingDate === normalizedDateStr;
            });
            
            // 디버깅: 2025-11-24 날짜 확인
            if (normalizedDateStr === '2025-11-24') {
                console.log('2025-11-24 예약 확인:', {
                    dateStr: normalizedDateStr,
                    allBookings: bookings.length,
                    allZoomBookings: zoomBookings.length,
                    dayBookings: dayBookings.length,
                    dayZoomBookings: dayZoomBookings.length,
                    dayBookingsData: dayBookings,
                    dayZoomBookingsData: dayZoomBookings
                });
            }
            
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
                event.style.cursor = 'pointer';
                event.style.pointerEvents = 'auto';
                event.style.position = 'relative';
                event.style.zIndex = '10';
                
                event.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('예약 클릭:', booking);
                    this.showBookingDetails(booking);
                });
                
                // 터치 이벤트도 지원
                event.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('예약 터치:', booking);
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
            
            customConfirm(details + '\n\n예약을 취소하시겠습니까?').then(async (confirmed) => {
                if (confirmed) {
                    const passwordConfirmed = await this.verifyPassword(booking);
                    if (passwordConfirmed) {
                        this.cancelZoomBooking(booking.id);
                    }
                }
            });
        } else {
            // room은 사용하지 않지만 안전을 위해 확인
            let room = null;
            
            // rooms가 배열이고 비어있지 않은지 확인
            if (Array.isArray(this.dataManager.rooms) && this.dataManager.rooms.length > 0) {
                room = this.dataManager.rooms.find(r => r && r.id === booking.roomId);
            }
            
            if (!room) {
                const localRooms = this.dataManager.loadRoomsFromLocal();
                if (Array.isArray(localRooms) && localRooms.length > 0) {
                    room = localRooms.find(r => r && r.id === booking.roomId);
                }
            }
            
            details = `
            회의실: ${booking.roomName || (room ? room.name : `회의실 ${booking.roomId}`)}
날짜: ${this.formatDate(booking.date)}
시간: ${booking.startTime} ~ ${booking.endTime}
예약자: ${booking.userName}
${booking.attendees ? `참석자: ${booking.attendees}` : ''}
${booking.purpose ? `목적: ${booking.purpose}` : ''}
            `.trim();
            
            customConfirm(details + '\n\n예약을 취소하시겠습니까?').then(async (confirmed) => {
                if (confirmed) {
                    const passwordConfirmed = await this.verifyPassword(booking);
                    if (passwordConfirmed) {
                        this.cancelBooking(booking.id);
                    }
                }
            });
        }
    }

    setupFAQ() {
        // 이벤트 위임을 사용하여 FAQ 컨테이너에 한 번만 이벤트 리스너 추가
        const faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) return;
        
        // 기존 이벤트 리스너가 있다면 제거 (중복 방지)
        const existingHandler = faqContainer._faqClickHandler;
        if (existingHandler) {
            faqContainer.removeEventListener('click', existingHandler);
        }
        
        // 이벤트 위임으로 FAQ 질문 클릭 처리
        const clickHandler = (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;
            
            const faqItem = question.closest('.faq-item');
            if (!faqItem) return;
            
            e.stopPropagation();
            e.preventDefault();
            
            const isActive = faqItem.classList.contains('active');
            const allFaqItems = faqContainer.querySelectorAll('.faq-item');
            
            // 모든 FAQ 항목 닫기
            allFaqItems.forEach(otherItem => {
                if (otherItem !== faqItem) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 클릭한 항목만 토글
            if (isActive) {
                faqItem.classList.remove('active');
            } else {
                faqItem.classList.add('active');
            }
        };
        
        // 핸들러를 저장하여 나중에 제거할 수 있도록 함
        faqContainer._faqClickHandler = clickHandler;
        faqContainer.addEventListener('click', clickHandler);
    }
}

// 커스텀 confirm 함수
function customConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        
        messageEl.textContent = message;
        modal.classList.add('active');
        
        const cleanup = () => {
            modal.classList.remove('active');
            okBtn.onclick = null;
            cancelBtn.onclick = null;
        };
        
        okBtn.onclick = () => {
            cleanup();
            resolve(true);
        };
        
        cancelBtn.onclick = () => {
            cleanup();
            resolve(false);
        };
        
        // 모달 배경 클릭 시 취소
        modal.addEventListener('click', function backdropClick(e) {
            if (e.target === modal) {
                cleanup();
                resolve(false);
                modal.removeEventListener('click', backdropClick);
            }
        });
    });
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const ui = new UI(dataManager);
});

