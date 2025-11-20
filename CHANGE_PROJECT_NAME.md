# 프로젝트 이름 변경 가이드

현재 주소: `https://026b8ac3.meeting-room-booking-6ml.pages.dev/`  
변경할 주소: `http://malgn-booking.pages.dev`

## 방법: Cloudflare Pages에서 프로젝트 이름 변경

### 1단계: Cloudflare Pages 프로젝트 설정 접속

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속 및 로그인

2. **Pages 프로젝트 선택**
   - 왼쪽 메뉴에서 **Pages** 클릭
   - **meeting-room-booking** (또는 `meeting-room-booking-6ml`) 프로젝트 선택

### 2단계: 프로젝트 이름 변경

1. **Settings 탭 클릭**
   - 상단 메뉴에서 **Settings** 탭 클릭

2. **프로젝트 이름 변경**
   - **Project name** 섹션 찾기
   - 현재 이름: `meeting-room-booking-6ml` (또는 `meeting-room-booking`)
   - 새 이름으로 변경: `malgn-booking`
   - **Save** 클릭

### 3단계: 확인

- 프로젝트 이름이 변경되면 자동으로 새로운 도메인이 생성됩니다
- 새 주소: `https://malgn-booking.pages.dev`
- 기존 주소는 더 이상 작동하지 않을 수 있습니다

## 주의사항

⚠️ **중요 사항**:

1. **기존 커스텀 도메인**
   - 기존에 설정한 커스텀 도메인(`malgn.booking.com`)은 그대로 유지됩니다
   - 프로젝트 이름 변경 후에도 커스텀 도메인은 계속 작동합니다

2. **배포 주소 변경**
   - 프로젝트 이름 변경 후 새로운 배포 주소가 생성됩니다
   - 기존 배포 주소(`026b8ac3.meeting-room-booking-6ml.pages.dev`)는 더 이상 사용할 수 없습니다

3. **GitHub 연동**
   - GitHub 저장소와의 연동은 그대로 유지됩니다
   - 새로운 배포도 자동으로 새 주소로 배포됩니다

## 대안: 커스텀 도메인 사용

프로젝트 이름을 변경하지 않고 커스텀 도메인만 사용하는 방법:

1. **기존 프로젝트 이름 유지**
2. **커스텀 도메인 설정**
   - `malgn.booking.com` (이미 설정됨)
   - 또는 다른 커스텀 도메인 추가

이 경우 기본 `.pages.dev` 주소는 변경되지 않지만, 커스텀 도메인으로 접속할 수 있습니다.

## 확인 방법

프로젝트 이름 변경 후:

1. **새 주소 확인**
   - `https://malgn-booking.pages.dev` 접속
   - 사이트가 정상적으로 로드되는지 확인

2. **커스텀 도메인 확인**
   - `http://malgn.booking.com` 접속
   - 여전히 정상 작동하는지 확인

## 문제 해결

### 프로젝트 이름 변경 옵션이 보이지 않음
- Settings 탭에서 Project name 섹션을 찾아보세요
- 일부 Cloudflare Pages 버전에서는 프로젝트 이름 변경이 제한될 수 있습니다

### 기존 주소가 여전히 작동함
- DNS 캐시로 인해 일시적으로 기존 주소가 작동할 수 있습니다
- 시간이 지나면 새 주소로만 접속 가능합니다

### 커스텀 도메인이 작동하지 않음
- Custom domains 섹션에서 도메인 상태 확인
- DNS 레코드가 올바르게 설정되었는지 확인

