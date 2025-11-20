# Firebase 간단 설정 (5분 완료)

## 🚀 자동 설정 스크립트 사용

1. **PowerShell에서 실행**
   ```powershell
   .\setup-firebase.ps1
   ```

2. **스크립트가 자동으로 처리**
   - Firebase CLI 설치 확인/설치
   - Firebase 로그인
   - 프로젝트 생성 또는 선택
   - 보안 규칙 파일 생성

3. **수동 작업 (2분)**
   - Firebase 콘솔에서 Realtime Database 생성
   - 웹 앱 등록 후 구성 정보 복사
   - `firebase-config.js`에 구성 정보 붙여넣기

---

## 📝 수동 설정 (스크립트 없이)

### 1단계: Firebase 프로젝트 생성 (1분)

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `malgn-booking`
4. Google Analytics: 비활성화
5. "프로젝트 만들기" 클릭

### 2단계: Realtime Database 생성 (1분)

1. 왼쪽 메뉴: "Realtime Database"
2. "데이터베이스 만들기" 클릭
3. 위치: **asia-northeast3 (Seoul)** 선택
4. 보안 규칙: **테스트 모드로 시작**
5. "완료" 클릭

### 3단계: 보안 규칙 설정 (30초)

1. "규칙" 탭 클릭
2. 아래 코드로 교체:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. "게시" 클릭

### 4단계: 웹 앱 등록 및 구성 정보 복사 (1분)

1. 왼쪽 상단 ⚙️ 아이콘 > "프로젝트 설정"
2. 아래로 스크롤 > "앱" 섹션
3. 웹 아이콘 (`</>`) 클릭
4. 앱 닉네임: `malgn-booking-web`
5. "Firebase Hosting도 설정하시겠습니까?" → 체크 해제
6. "앱 등록" 클릭
7. 표시되는 구성 정보 **전체 복사**

### 5단계: firebase-config.js 파일 업데이트 (30초)

1. 프로젝트 폴더의 `firebase-config.js` 파일 열기
2. Firebase 콘솔에서 복사한 `firebaseConfig` 객체를 찾아서
3. `firebase-config.js`의 `firebaseConfig` 객체를 **전체 교체**
4. 파일 저장

### 6단계: 테스트 (30초)

1. `index.html` 파일을 브라우저에서 열기
2. F12 키 > Console 탭
3. "Firebase가 성공적으로 초기화되었습니다." 메시지 확인 ✅
4. 회의실 예약하기
5. 새로고침 (F5)
6. 예약이 그대로 남아있는지 확인 ✅

---

## ✅ 완료!

이제 모든 PC에서 예약이 실시간으로 공유됩니다!

