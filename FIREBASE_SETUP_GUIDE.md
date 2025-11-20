# Firebase 설정 가이드 - 모든 PC에서 예약 공유하기

## 문제
현재 LocalStorage를 사용하여 각 PC마다 데이터가 독립적으로 저장되어, 한 PC에서 등록한 예약이 다른 PC에서 보이지 않습니다.

## 해결 방법
Firebase Realtime Database를 사용하여 모든 PC에서 실시간으로 데이터를 공유하도록 변경했습니다.

---

## 단계별 설정 방법

### 1단계: Firebase 프로젝트 생성

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 추가**
   - "프로젝트 추가" 또는 "Add project" 클릭
   - 프로젝트 이름: `malgn-booking` (또는 원하는 이름)
   - Google Analytics 설정: 선택사항 (필요 없으면 비활성화 가능)
   - "프로젝트 만들기" 클릭
   - 생성 완료까지 대기 (약 1분)

### 2단계: Realtime Database 생성

1. **Realtime Database 메뉴**
   - 왼쪽 메뉴에서 "Realtime Database" 클릭
   - 또는 "Build" > "Realtime Database" 클릭

2. **데이터베이스 만들기**
   - "데이터베이스 만들기" 또는 "Create Database" 클릭
   - 위치 선택: **"asia-northeast3 (Seoul)"** 선택 (한국 서버)
   - 보안 규칙: **"테스트 모드로 시작"** 선택
   - "완료" 클릭

3. **보안 규칙 설정** (중요!)
   - 데이터베이스가 생성되면 "규칙" 탭 클릭
   - 아래 규칙으로 변경:
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
   - "게시" 버튼 클릭

### 3단계: 웹 앱 등록

1. **프로젝트 설정**
   - 왼쪽 상단 톱니바퀴 아이콘 클릭
   - "프로젝트 설정" 또는 "Project settings" 클릭

2. **앱 추가**
   - 아래로 스크롤하여 "앱" 섹션 확인
   - "웹" 아이콘 (`</>`) 클릭

3. **앱 등록**
   - 앱 닉네임: `malgn-booking-web` (또는 원하는 이름)
   - "Firebase Hosting도 설정하시겠습니까?" → 체크 해제 (선택사항)
   - "앱 등록" 클릭

4. **구성 정보 복사**
   - 다음 화면에서 Firebase 구성 정보가 표시됩니다
   - 아래와 같은 형식입니다:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "malgn-booking.firebaseapp.com",
     databaseURL: "https://malgn-booking-default-rtdb.asia-northeast3.firebasedatabase.app",
     projectId: "malgn-booking",
     storageBucket: "malgn-booking.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 4단계: 프로젝트에 Firebase 설정 추가

1. **firebase-config.js 파일 열기**
   - 프로젝트 폴더에서 `firebase-config.js` 파일 열기

2. **구성 정보 입력**
   - Firebase 콘솔에서 복사한 구성 정보를 붙여넣기
   - `YOUR_API_KEY`, `YOUR_PROJECT_ID` 등을 실제 값으로 변경

   예시:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyAbc123Def456Ghi789Jkl012Mno345",
       authDomain: "malgn-booking.firebaseapp.com",
       databaseURL: "https://malgn-booking-default-rtdb.asia-northeast3.firebasedatabase.app",
       projectId: "malgn-booking",
       storageBucket: "malgn-booking.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef123456"
   };
   ```

3. **파일 저장**

### 5단계: 테스트

1. **로컬에서 테스트**
   - `index.html` 파일을 브라우저에서 열기
   - 브라우저 콘솔(F12)에서 오류 확인
   - "Firebase가 성공적으로 초기화되었습니다." 메시지 확인

2. **예약 테스트**
   - 회의실 예약하기
   - 다른 브라우저나 다른 PC에서 같은 URL 접속
   - 예약이 실시간으로 나타나는지 확인

3. **Firebase 콘솔에서 확인**
   - Firebase 콘솔 > Realtime Database
   - 데이터가 저장되는지 확인

---

## 문제 해결

### Firebase가 초기화되지 않아요
- `firebase-config.js` 파일의 구성 정보가 올바른지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- Firebase SDK가 로드되었는지 확인 (네트워크 탭)

### 데이터가 저장되지 않아요
- Firebase 콘솔에서 보안 규칙 확인
- 데이터베이스 URL이 올바른지 확인
- 브라우저 콘솔에서 오류 확인

### 다른 PC에서 데이터가 안 보여요
- 두 PC 모두 같은 Firebase 프로젝트를 사용하는지 확인
- `firebase-config.js` 파일이 배포된 사이트에도 포함되어 있는지 확인
- 브라우저 캐시 지우기 (Ctrl+Shift+R)

### LocalStorage를 계속 사용하고 싶어요
- Firebase 설정을 하지 않으면 자동으로 LocalStorage를 사용합니다
- `firebase-config.js` 파일을 삭제하거나 구성 정보를 비워두면 됩니다

---

## 배포 시 주의사항

1. **firebase-config.js 파일 포함**
   - Cloudflare Pages에 배포할 때 `firebase-config.js` 파일도 함께 업로드되어야 합니다
   - Git에 커밋되어 있어야 합니다

2. **보안 규칙**
   - 현재는 모든 사람이 읽고 쓸 수 있는 규칙입니다
   - 프로덕션 환경에서는 인증을 추가하는 것을 권장합니다

3. **비용**
   - Firebase Realtime Database 무료 티어:
     - 동시 연결: 100개
     - 저장 용량: 1GB
     - 다운로드: 10GB/월
     - 업로드: 10GB/월
   - 일반적인 사용에는 충분합니다

---

## 완료!

Firebase 설정이 완료되면:
- ✅ 모든 PC에서 예약이 실시간으로 공유됩니다
- ✅ 한 PC에서 예약하면 다른 PC에서도 즉시 보입니다
- ✅ 예약 취소도 모든 PC에 실시간 반영됩니다

