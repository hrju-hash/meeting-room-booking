# Cloudflare Pages 커스텀 도메인 설정 가이드

## 방법 1: Cloudflare 대시보드에서 수동 설정 (권장)

### 단계별 가이드

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속
   - 로그인

2. **Pages 프로젝트 선택**
   - 왼쪽 메뉴에서 **Pages** 클릭
   - **meeting-room-booking** 프로젝트 선택

3. **커스텀 도메인 설정**
   - 상단 메뉴에서 **Custom domains** 탭 클릭
   - **Set up a custom domain** 버튼 클릭
   - `malgn.booking.com` 입력
   - **Continue** 클릭

4. **DNS 설정 확인**
   - Cloudflare가 자동으로 필요한 DNS 레코드를 생성합니다
   - DNS 전파까지 최대 24시간 소요될 수 있습니다

5. **SSL/TLS 인증서**
   - Cloudflare가 자동으로 SSL 인증서를 발급합니다
   - HTTPS 연결이 자동으로 활성화됩니다

## 방법 2: PowerShell 스크립트 사용 (API 토큰 필요)

### 사전 준비

1. **Cloudflare API 토큰 생성**
   - Cloudflare 대시보드 > My Profile > API Tokens
   - "Create Token" 클릭
   - "Edit Cloudflare Workers" 템플릿 선택 또는 다음 권한 설정:
     - Account > Cloudflare Pages > Edit
   - 토큰 생성 및 복사

2. **Account ID 확인**
   - Cloudflare 대시보드 우측 상단에서 Account ID 확인

### 스크립트 실행

```powershell
.\setup-domain.ps1 -ApiToken "YOUR_API_TOKEN" -AccountId "YOUR_ACCOUNT_ID"
```

또는 매개변수 지정:

```powershell
.\setup-domain.ps1 `
    -ApiToken "YOUR_API_TOKEN" `
    -AccountId "YOUR_ACCOUNT_ID" `
    -ProjectName "meeting-room-booking" `
    -Domain "malgn.booking.com"
```

## 방법 3: Cloudflare API 직접 호출

### cURL 명령어

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/meeting-room-booking/domains" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"malgn.booking.com"}'
```

### PowerShell 명령어

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_API_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    domain = "malgn.booking.com"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/meeting-room-booking/domains" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

## 확인 방법

설정 완료 후 다음 URL로 접속하여 확인:
- http://malgn.booking.com
- https://malgn.booking.com (자동 리다이렉트)

## 문제 해결

### DNS 전파 지연
- DNS 변경사항이 전파되기까지 최대 24시간 소요
- `nslookup malgn.booking.com` 명령어로 확인 가능

### SSL 인증서 발급 지연
- Cloudflare가 자동으로 SSL 인증서를 발급하지만 최대 24시간 소요될 수 있음
- 대시보드에서 SSL/TLS 상태 확인 가능

### 도메인 연결 실패
- DNS 레코드가 올바르게 설정되었는지 확인
- Cloudflare 대시보드의 Custom domains 섹션에서 상태 확인

