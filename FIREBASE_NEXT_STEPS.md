# Firebase 설정 - 다음 단계 가이드

현재 Firebase 프로젝트 "malgn-booking"이 생성되었습니다! 🎉

## 📋 다음 단계 (순서대로 진행)

### 1단계: Realtime Database 생성 (2분)

1. **왼쪽 메뉴에서 "Realtime Database" 클릭**
   - 또는 "빌드" (Build) 섹션을 펼치고 "Realtime Database" 클릭

2. **"데이터베이스 만들기" 버튼 클릭**

3. **데이터베이스 설정**
   - 위치: **"asia-northeast3 (Seoul)"** 선택 ⚠️ 중요!
   - 보안 규칙: **"테스트 모드로 시작"** 선택
   - "완료" 클릭

4. **보안 규칙 설정** (중요!)
   - 데이터베이스가 생성되면 상단의 "규칙" 탭 클릭
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

---

### 2단계: 웹 앱 등록 (1분)

1. **프로젝트 설정 열기**
   - 왼쪽 상단 ⚙️ 아이콘 (설정) 클릭
   - 또는 상단의 프로젝트 이름 옆 ⚙️ 아이콘 클릭
   - "프로젝트 설정" 클릭

2. **웹 앱 추가**
   - 페이지를 아래로 스크롤
   - "앱" 섹션 찾기
   - 웹 아이콘 (`</>`) 클릭

3. **앱 등록**
   - 앱 닉네임: **malgn-booking-web** 입력
   - "Firebase Hosting도 설정하시겠습니까?" → **체크 해제** (선택사항)
   - "앱 등록" 버튼 클릭

4. **구성 정보 복사**
   - 다음 화면에 표시되는 `firebaseConfig` 객체 **전체 복사**
   - 다음과 같은 형식입니다:
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

---

### 3단계: 구성 정보 저장 (30초)

1. **프로젝트 폴더의 `firebase-config.js` 파일 열기**

2. **구성 정보 붙여넣기**
   - Firebase 콘솔에서 복사한 `firebaseConfig` 객체를 찾아서
   - `firebase-config.js` 파일의 `firebaseConfig` 객체를 **전체 교체**

3. **파일 저장**

---

### 4단계: 배포 (30초)

1. **`setup-and-deploy.bat` 파일 실행**
   - 프로젝트 폴더에서 `setup-and-deploy.bat` 파일을 더블클릭
   - 또는 PowerShell에서 실행:
   ```powershell
   .\setup-and-deploy.bat
   ```

2. **완료!**
   - 몇 분 후 https://malgn-booking.pages.dev 에서 확인하세요

---

## ✅ 완료 확인

1. 브라우저에서 `index.html` 열기
2. F12 > Console 탭
3. "Firebase가 성공적으로 초기화되었습니다." 메시지 확인 ✅
4. 회의실 예약하기
5. 새로고침 (F5)
6. 예약이 그대로 남아있는지 확인 ✅

---

## 🆘 문제 해결

### Realtime Database가 안 보여요
- 왼쪽 메뉴에서 "빌드" (Build) 섹션을 펼쳐보세요
- 또는 상단 검색창에 "Realtime Database" 검색

### 웹 앱 등록이 안 보여요
- 프로젝트 설정 페이지에서 아래로 스크롤하세요
- "앱" 섹션이 페이지 하단에 있습니다

### 구성 정보를 찾을 수 없어요
- 웹 앱 등록 후 표시되는 화면에서 `firebaseConfig` 객체를 찾으세요
- 또는 프로젝트 설정 > 일반 > 앱 섹션에서 웹 앱을 클릭하면 구성 정보가 표시됩니다


