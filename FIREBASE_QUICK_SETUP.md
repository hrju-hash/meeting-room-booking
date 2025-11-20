# Firebase 빠른 설정 가이드

## 🚀 5분 안에 완료하기

### 1단계: Firebase 프로젝트 생성 (2분)

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 추가**
   - "프로젝트 추가" 또는 "Add project" 클릭
   - 프로젝트 이름: `malgn-booking` 입력
   - Google Analytics: **비활성화** (체크 해제)
   - "프로젝트 만들기" 클릭
   - 생성 완료까지 대기 (약 30초)

### 2단계: Realtime Database 생성 (1분)

1. **Realtime Database 메뉴**
   - 왼쪽 메뉴에서 "Realtime Database" 클릭
   - "데이터베이스 만들기" 클릭

2. **데이터베이스 설정**
   - 위치: **"asia-northeast3 (Seoul)"** 선택
   - 보안 규칙: **"테스트 모드로 시작"** 선택
   - "완료" 클릭

3. **보안 규칙 설정** (중요!)
   - "규칙" 탭 클릭
   - 아래 코드로 **전체 교체**:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - "게시" 버튼 클릭

### 3단계: 웹 앱 등록 및 설정 정보 복사 (1분)

1. **프로젝트 설정**
   - 왼쪽 상단 ⚙️ 아이콘 클릭
   - "프로젝트 설정" 클릭

2. **웹 앱 추가**
   - 아래로 스크롤하여 "앱" 섹션 확인
   - "웹" 아이콘 (`</>`) 클릭
   - 앱 닉네임: `malgn-booking-web` 입력
   - "Firebase Hosting도 설정하시겠습니까?" → **체크 해제**
   - "앱 등록" 클릭

3. **구성 정보 복사**
   - 다음 화면에 표시되는 Firebase 구성 정보를 **전체 복사**
   - 아래와 같은 형식입니다:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     databaseURL: "https://...-default-rtdb.asia-northeast3.firebasedatabase.app",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

### 4단계: 프로젝트에 설정 추가 (1분)

1. **firebase-config.js 파일 열기**
   - 프로젝트 폴더의 `firebase-config.js` 파일을 텍스트 에디터로 열기

2. **구성 정보 붙여넣기**
   - Firebase 콘솔에서 복사한 `firebaseConfig` 객체 전체를 찾아서
   - `firebase-config.js` 파일의 `firebaseConfig` 객체를 **전체 교체**

3. **파일 저장**

### 5단계: 테스트 및 배포

1. **로컬 테스트**
   - `index.html` 파일을 브라우저에서 열기
   - F12 키를 눌러 개발자 도구 열기
   - Console 탭에서 "Firebase가 성공적으로 초기화되었습니다." 메시지 확인

2. **예약 테스트**
   - 회의실 예약하기
   - 새로고침 (F5)
   - 예약이 그대로 남아있는지 확인 ✅

3. **배포**
   - 변경사항을 Git에 커밋하고 푸시
   - Cloudflare Pages에 자동 배포됨

---

## ✅ 완료 체크리스트

- [ ] Firebase 프로젝트 생성 완료
- [ ] Realtime Database 생성 완료 (위치: asia-northeast3)
- [ ] 보안 규칙 설정 완료 (읽기/쓰기 모두 true)
- [ ] 웹 앱 등록 완료
- [ ] firebase-config.js 파일에 구성 정보 입력 완료
- [ ] 브라우저 콘솔에서 "Firebase가 성공적으로 초기화되었습니다." 확인
- [ ] 예약 후 새로고침해도 데이터 유지 확인

---

## 🆘 문제 해결

### "Firebase가 초기화되지 않았습니다" 메시지가 나와요
- `firebase-config.js` 파일의 구성 정보가 올바른지 확인
- 브라우저 콘솔(F12)에서 오류 메시지 확인
- Firebase SDK가 로드되었는지 확인 (Network 탭)

### 데이터가 저장되지 않아요
- Firebase 콘솔 > Realtime Database > 규칙 탭에서 읽기/쓰기가 모두 `true`인지 확인
- 데이터베이스 URL이 올바른지 확인 (`asia-northeast3` 포함)

### 새로고침 후 데이터가 사라져요
- Firebase가 제대로 초기화되었는지 확인 (콘솔 메시지)
- Firebase 콘솔 > Realtime Database에서 데이터가 저장되어 있는지 확인
- 브라우저 캐시 지우기 (Ctrl+Shift+R)

---

## 💡 팁

- Firebase 무료 티어로 충분합니다 (동시 연결 100개, 저장 1GB)
- 데이터는 실시간으로 모든 PC에서 공유됩니다
- Firebase 콘솔에서 데이터를 직접 확인하고 수정할 수 있습니다

