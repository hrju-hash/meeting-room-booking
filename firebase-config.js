// Firebase 설정 파일
// 이 파일의 Firebase 구성 정보를 실제 Firebase 프로젝트 정보로 변경하세요

// Firebase 프로젝트 생성 방법:
// 1. https://console.firebase.google.com/ 접속
// 2. 프로젝트 추가
// 3. Realtime Database 생성 (위치: asia-northeast3)
// 4. 웹 앱 등록 후 구성 정보 복사
// 5. 아래 firebaseConfig 객체의 값들을 실제 값으로 변경

const firebaseConfig = {
    apiKey: "AIzaSyBXvm6xweVo83OIBfILDOKZfwv1nk4tXk0",
    authDomain: "malgn-booking.firebaseapp.com",
    databaseURL: "https://malgn-booking-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "malgn-booking",
    storageBucket: "malgn-booking.firebasestorage.app",
    messagingSenderId: "768220823948",
    appId: "1:768220823948:web:a820f41e7f19da314056a9"
};

// Firebase 초기화
let firebaseInitialized = false;
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('Firebase가 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('Firebase 초기화 오류:', error);
        console.warn('Firebase 구성 정보를 확인하세요. LocalStorage를 사용합니다.');
    }
} else {
    console.error('Firebase SDK가 로드되지 않았습니다.');
}

