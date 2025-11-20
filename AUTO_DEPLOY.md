# 자동 배포 가이드

## 수정 완료 사항
✅ 2025년 10월 10일을 공휴일에서 명시적으로 제외하도록 수정 완료

## 자동 배포 방법

### 방법 1: PowerShell 스크립트 사용 (권장)

1. **Cloudflare API 토큰 생성**
   - https://dash.cloudflare.com 접속
   - My Profile > API Tokens
   - "Create Token" 클릭
   - "Edit Cloudflare Workers" 템플릿 선택 또는 다음 권한 설정:
     - Account > Cloudflare Pages > Edit
   - 토큰 생성 및 복사

2. **Account ID 확인**
   - Cloudflare 대시보드 우측 상단에서 Account ID 확인

3. **배포 스크립트 실행**
   ```powershell
   .\deploy-cloudflare.ps1 -ApiToken "YOUR_API_TOKEN" -AccountId "YOUR_ACCOUNT_ID"
   ```

   또는 프로젝트 이름 지정:
   ```powershell
   .\deploy-cloudflare.ps1 -ApiToken "YOUR_API_TOKEN" -AccountId "YOUR_ACCOUNT_ID" -ProjectName "malgn-booking"
   ```

### 방법 2: Cloudflare 대시보드에서 직접 배포 (가장 간단)

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속
   - 로그인

2. **Pages 프로젝트 선택**
   - 왼쪽 메뉴에서 **Pages** 클릭
   - **malgn-booking** 프로젝트 선택

3. **새 배포 업로드**
   - **Deployments** 탭 클릭
   - **Upload assets** 또는 **Create deployment** 버튼 클릭
   - 다음 파일들을 선택하여 업로드:
     - `index.html`
     - `app.js` (수정된 파일)
     - `styles.css`
     - `logo.jpg` 또는 `logo.svg` (있는 경우)
   - **Deploy** 버튼 클릭

4. **배포 확인**
   - 배포가 완료되면 자동으로 사이트가 업데이트됩니다
   - https://malgn-booking.pages.dev 에서 확인

## 수정된 파일

- `app.js`: 2025년 10월 10일을 공휴일에서 명시적으로 제외하는 로직 추가 (879-882줄)

## 확인 사항

배포 후 다음을 확인하세요:
- ✅ 2025년 10월 달력에서 10월 10일이 공휴일로 표시되지 않는지 확인
- ✅ 다른 공휴일은 정상적으로 표시되는지 확인
- ✅ 예약 기능이 정상적으로 작동하는지 확인

