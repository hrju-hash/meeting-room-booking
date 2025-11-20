# 빠른 DNS 설정 - malgn.booking.com → meeting-room-booking-6ml.pages.dev

## 목표
`malgn.booking.com`을 입력하면 `meeting-room-booking-6ml.pages.dev`로 연결되도록 설정

## 단계별 설정 (2분)

### 1단계: Cloudflare DNS 접속
1. https://dash.cloudflare.com 접속 및 로그인
2. `booking.com` 도메인 선택 (또는 루트 도메인)

### 2단계: CNAME 레코드 추가
1. 왼쪽 메뉴에서 **DNS** 클릭
2. **Add record** 버튼 클릭
3. 다음 정보 입력:
   ```
   Type: CNAME
   Name: malgn
   Target: meeting-room-booking-6ml.pages.dev
   Proxy status: Proxied (🟠 주황색 구름)
   TTL: Auto
   ```
4. **Save** 클릭

### 3단계: Cloudflare Pages에서 도메인 추가
1. 왼쪽 메뉴에서 **Pages** 클릭
2. **meeting-room-booking** 프로젝트 선택
3. **Custom domains** 탭 클릭
4. **Set up a custom domain** 클릭
5. `malgn.booking.com` 입력
6. **Continue** 클릭

### 4단계: 확인
- DNS 전파까지 최대 24시간 소요
- http://malgn.booking.com 접속하여 확인
- `meeting-room-booking-6ml.pages.dev`로 연결되는지 확인

## DNS 레코드 요약

```
Type: CNAME
Name: malgn
Target: meeting-room-booking-6ml.pages.dev
Proxy: Proxied (🟠)
```

## 확인 명령어

```powershell
# PowerShell에서
nslookup malgn.booking.com
```

또는 브라우저에서:
- http://malgn.booking.com 접속
- 사이트가 정상적으로 로드되면 성공!

## 문제 해결

### DNS 레코드가 보이지 않음
- DNS 전파 대기 (최대 24시간)
- Cloudflare 대시보드에서 레코드 확인

### 연결이 안 됨
- Target 주소가 정확한지 확인: `meeting-room-booking-6ml.pages.dev`
- Proxy 상태가 Proxied인지 확인
- Cloudflare Pages에서 도메인이 추가되었는지 확인

