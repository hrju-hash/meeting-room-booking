# Cloudflare 커스텀 도메인 자동 설정 가이드

⚠️ **중요**: Cloudflare API 토큰과 Account ID가 필요합니다.

## 방법 1: GitHub Actions 사용 (가장 쉬움, 권장)

### 사전 준비

1. **Cloudflare API 토큰 생성**
   - https://dash.cloudflare.com/profile/api-tokens 접속
   - "Create Token" 클릭
   - "Edit Cloudflare Workers" 템플릿 선택 또는 "Custom token" 선택
   - 권한 설정:
     - Account > Cloudflare Pages > Edit
   - 토큰 생성 및 복사

2. **Account ID 확인**
   - https://dash.cloudflare.com 접속
   - 우측 상단에서 Account ID 확인

### GitHub Actions 실행

1. GitHub 저장소로 이동: https://github.com/hrju-hash/meeting-room-booking
2. "Actions" 탭 클릭
3. 왼쪽에서 "Setup Custom Domain" 워크플로우 선택
4. "Run workflow" 버튼 클릭
5. 다음 정보 입력:
   - **API Token**: Cloudflare API 토큰
   - **Account ID**: Cloudflare Account ID
   - **Domain**: malgn.booking.com (기본값)
   - **Project Name**: meeting-room-booking (기본값)
6. "Run workflow" 클릭

워크플로우가 실행되면 자동으로 커스텀 도메인이 설정됩니다.

## 방법 2: PowerShell 스크립트 사용

### 대화형 스크립트 실행

```powershell
cd "C:\Users\hrju\AppData\Local\Temp\meeting-room-booking"
.\setup-domain-interactive.ps1
```

스크립트가 실행되면 API 토큰과 Account ID를 입력하라는 메시지가 나타납니다.

### 직접 실행 (매개변수 지정)

```powershell
.\setup-domain.ps1 `
    -ApiToken "YOUR_API_TOKEN" `
    -AccountId "YOUR_ACCOUNT_ID" `
    -ProjectName "meeting-room-booking" `
    -Domain "malgn.booking.com"
```

## 방법 3: Cloudflare 대시보드에서 수동 설정

1. https://dash.cloudflare.com 접속 및 로그인
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **meeting-room-booking** 프로젝트 선택
4. 상단 **Custom domains** 탭 클릭
5. **Set up a custom domain** 버튼 클릭
6. `malgn.booking.com` 입력 후 **Continue** 클릭
7. DNS 설정 확인 (자동으로 설정됨)

## 확인 방법

설정 완료 후 다음 URL로 접속하여 확인:
- http://malgn.booking.com
- https://malgn.booking.com (자동 리다이렉트)

DNS 전파까지 최대 24시간이 소요될 수 있습니다.

## 문제 해결

### API 토큰 오류
- API 토큰이 올바른지 확인
- API 토큰에 "Cloudflare Pages > Edit" 권한이 있는지 확인

### 도메인 이미 추가됨
- Cloudflare 대시보드에서 Custom domains 섹션 확인
- 이미 추가되어 있다면 오류가 발생할 수 있습니다

### DNS 전파 지연
- DNS 변경사항이 전파되기까지 최대 24시간 소요
- `nslookup malgn.booking.com` 명령어로 확인 가능

