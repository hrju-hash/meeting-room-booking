# 간단한 도메인 설정 - malgn.booking.com

현재 배포 주소: `https://f30a20df.meeting-room-booking-6ml.pages.dev/`  
변경할 주소: `http://malgn.booking.com`  
연결 대상: `meeting-room-booking-6ml.pages.dev`

## 가장 간단한 방법 (2분 소요)

### 1단계: Cloudflare 대시보드 접속
1. https://dash.cloudflare.com 접속
2. 로그인

### 2단계: Pages 프로젝트 선택
1. 왼쪽 메뉴에서 **Pages** 클릭
2. **meeting-room-booking** 프로젝트 클릭

### 3단계: 커스텀 도메인 추가
1. 상단 메뉴에서 **Custom domains** 탭 클릭
2. **Set up a custom domain** 버튼 클릭
3. `malgn.booking.com` 입력
4. **Continue** 클릭
5. 완료!

### 4단계: 확인
- DNS 전파까지 최대 24시간 소요
- http://malgn.booking.com 접속하여 확인
- Cloudflare가 자동으로 SSL 인증서 발급 (HTTPS 자동 활성화)

## 주의사항

⚠️ **중요**: `malgn.booking.com` 도메인이 Cloudflare에 등록되어 있어야 합니다.

도메인이 Cloudflare에 등록되어 있지 않다면:
1. Cloudflare에 도메인 추가 (Add a Site)
2. DNS 서버 변경
3. 위의 1-3단계 진행

## 문제 해결

### "Domain not found" 오류
- 도메인이 Cloudflare에 등록되어 있는지 확인
- DNS 설정이 올바른지 확인

### DNS 전파 지연
- 최대 24시간 소요될 수 있습니다
- `nslookup malgn.booking.com` 명령어로 확인 가능

### 이미 도메인이 추가되어 있음
- Custom domains 섹션에서 확인
- 이미 있다면 추가 설정 불필요

