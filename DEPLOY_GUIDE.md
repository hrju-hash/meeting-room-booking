# Cloudflare Pages 배포 가이드

## 수정 사항
- ✅ 2025년 10월 10일을 공휴일에서 명시적으로 제외하도록 수정 완료

## 배포 방법

### 방법 1: Cloudflare 대시보드에서 직접 배포 (가장 간단)

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속
   - 로그인

2. **Pages 프로젝트 선택**
   - 왼쪽 메뉴에서 **Pages** 클릭
   - **malgn-booking** 프로젝트 선택 (또는 해당 프로젝트 이름)

3. **새 배포 업로드**
   - **Deployments** 탭 클릭
   - **Upload assets** 또는 **Create deployment** 버튼 클릭
   - 다음 파일들을 선택하여 업로드:
     - `index.html`
     - `app.js`
     - `styles.css`
     - `logo.jpg` (또는 `logo.svg`)
   - **Deploy** 버튼 클릭

4. **배포 확인**
   - 배포가 완료되면 자동으로 사이트가 업데이트됩니다
   - https://malgn-booking.pages.dev 에서 확인

### 방법 2: Git 연동 사용 (자동 배포)

만약 Git 저장소가 있다면:

1. **Git 저장소에 푸시**
   ```bash
   git add .
   git commit -m "2025년 10월 10일 공휴일 제외 수정"
   git push
   ```

2. **Cloudflare Pages 자동 배포**
   - Git 저장소와 연동되어 있다면 자동으로 배포됩니다
   - Cloudflare 대시보드에서 배포 상태 확인

### 방법 3: Wrangler CLI 사용 (고급)

Node.js와 npm이 설치되어 있다면:

1. **Wrangler 설치**
   ```bash
   npm install -g wrangler
   ```

2. **로그인**
   ```bash
   wrangler login
   ```

3. **배포**
   ```bash
   wrangler pages deploy . --project-name=malgn-booking
   ```

## 수정된 파일

- `app.js`: 2025년 10월 10일을 공휴일에서 명시적으로 제외하는 로직 추가

## 확인 사항

배포 후 다음을 확인하세요:
- ✅ 2025년 10월 달력에서 10월 10일이 공휴일로 표시되지 않는지 확인
- ✅ 다른 공휴일은 정상적으로 표시되는지 확인
- ✅ 예약 기능이 정상적으로 작동하는지 확인


