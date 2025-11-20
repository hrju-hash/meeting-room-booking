# DNS 레코드 설정 가이드 - malgn.booking.com

Cloudflare Pages에서 커스텀 도메인을 설정하려면 DNS 레코드가 필요합니다.

## 방법 1: Cloudflare가 자동으로 설정 (권장)

대부분의 경우 Cloudflare가 자동으로 DNS 레코드를 생성합니다:

1. **Cloudflare Pages에서 도메인 추가**
   - Pages > meeting-room-booking > Custom domains
   - `malgn.booking.com` 입력
   - Cloudflare가 자동으로 DNS 레코드 생성

2. **자동 생성 확인**
   - Cloudflare 대시보드 > DNS > Records에서 확인
   - CNAME 레코드가 자동으로 생성됨

## 방법 2: 수동으로 DNS 레코드 추가

자동 설정이 되지 않는 경우, 수동으로 추가해야 합니다:

### 2-1. Cloudflare DNS에서 설정 (도메인이 Cloudflare에 등록된 경우)

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com
   - `booking.com` 도메인 선택 (또는 `malgn.booking.com`의 루트 도메인)

2. **DNS 레코드 추가**
   - 왼쪽 메뉴에서 **DNS** 클릭
   - **Add record** 클릭
   - 다음 정보 입력:
     - **Type**: `CNAME`
     - **Name**: `malgn` (또는 `malgn.booking.com`의 서브도메인 부분)
     - **Target**: `meeting-room-booking-6ml.pages.dev` (정확한 주소)
     - **Proxy status**: 🟠 Proxied (주황색 구름 아이콘)
     - **TTL**: Auto
   - **Save** 클릭

3. **확인**
   - DNS 레코드가 추가되었는지 확인
   - 전파까지 최대 24시간 소요

### 2-2. 다른 DNS 제공업체에서 설정 (도메인이 다른 곳에 등록된 경우)

1. **도메인 등록기관의 DNS 설정 접속**
   - 예: GoDaddy, Namecheap, AWS Route 53 등

2. **CNAME 레코드 추가**
   - 레코드 타입: `CNAME`
   - 호스트/이름: `malgn` (또는 `malgn.booking.com`)
   - 값/대상: `meeting-room-booking-6ml.pages.dev`
   - TTL: 3600 (또는 기본값)

3. **저장 및 확인**

## 정확한 Target 주소 확인 방법

Cloudflare Pages에서 정확한 Target 주소를 확인하려면:

1. **Cloudflare Pages 프로젝트로 이동**
   - Pages > meeting-room-booking

2. **Custom domains 섹션 확인**
   - 도메인을 추가하려고 할 때 표시되는 Target 주소 확인
   - 또는 프로젝트의 기본 주소 확인: `meeting-room-booking-6ml.pages.dev`

3. **정확한 주소**
   - 현재 프로젝트 주소: `meeting-room-booking-6ml.pages.dev`
   - 이 주소를 DNS 레코드의 Target으로 사용

## DNS 레코드 예시

### Cloudflare DNS에서

```
Type: CNAME
Name: malgn
Target: meeting-room-booking-6ml.pages.dev
Proxy: Proxied (🟠)
TTL: Auto
```

### 다른 DNS 제공업체에서

```
Type: CNAME
Host: malgn
Value: meeting-room-booking-6ml.pages.dev
TTL: 3600
```

## 확인 방법

### 1. DNS 전파 확인

```powershell
# PowerShell에서
nslookup malgn.booking.com
```

또는 온라인 도구 사용:
- https://dnschecker.org
- https://www.whatsmydns.net

### 2. Cloudflare 대시보드에서 확인

- DNS > Records에서 CNAME 레코드 확인
- 상태가 "Active"인지 확인

### 3. 브라우저에서 확인

- http://malgn.booking.com 접속
- 사이트가 로드되면 성공!

## 문제 해결

### "DNS 레코드를 찾을 수 없습니다"
- DNS 레코드가 올바르게 추가되었는지 확인
- DNS 전파 대기 (최대 24시간)
- TTL 값 확인

### "CNAME 레코드가 중복됩니다"
- 기존 CNAME 레코드가 있는지 확인
- 기존 레코드를 삭제하거나 수정

### "도메인이 Cloudflare에 등록되지 않았습니다"
- 도메인을 Cloudflare에 추가해야 합니다
- Add a Site에서 도메인 추가
- DNS 서버 변경 필요

## 추가 정보

- **Proxy 상태**: Cloudflare의 CDN을 사용하려면 Proxied (주황색 구름)로 설정
- **DNS 전파 시간**: 일반적으로 1-24시간 소요
- **SSL 인증서**: Cloudflare가 자동으로 발급 (HTTPS 자동 활성화)

