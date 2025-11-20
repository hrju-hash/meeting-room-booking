# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 추가**
   - "프로젝트 추가" 클릭
   - 프로젝트 이름: "malgn-booking" (또는 원하는 이름)
   - Google Analytics 설정 (선택사항)
   - "프로젝트 만들기" 클릭

3. **Realtime Database 생성**
   - 왼쪽 메뉴에서 "Realtime Database" 클릭
   - "데이터베이스 만들기" 클릭
   - 위치: "asia-northeast3 (Seoul)" 선택
   - 보안 규칙: "테스트 모드로 시작" 선택 (나중에 수정 필요)
   - "완료" 클릭

4. **웹 앱 등록**
   - 왼쪽 메뉴에서 프로젝트 설정(톱니바퀴) 클릭
   - "프로젝트 설정" 클릭
   - 아래로 스크롤하여 "앱 추가" → "웹" 선택
   - 앱 닉네임: "malgn-booking-web"
   - "앱 등록" 클릭
   - **Firebase 구성 정보 복사** (나중에 필요)

## 2. 보안 규칙 설정

Realtime Database → 규칙 탭에서:

```json
{
  "rules": {
    "bookings": {
      ".read": true,
      ".write": true
    },
    "zoomBookings": {
      ".read": true,
      ".write": true
    },
    "rooms": {
      ".read": true,
      ".write": true
    }
  }
}
```

**주의**: 이 규칙은 모든 사람이 읽고 쓸 수 있습니다. 프로덕션 환경에서는 인증을 추가해야 합니다.

## 3. Firebase 구성 정보

프로젝트 설정에서 다음 정보를 복사하세요:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-northeast3.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

이 정보를 `app.js` 파일에 추가해야 합니다.

