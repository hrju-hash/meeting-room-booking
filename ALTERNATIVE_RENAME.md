# 프로젝트 이름 변경 대안 방법

Cloudflare Pages에서 프로젝트 이름 변경 섹션을 찾을 수 없는 경우, 다음 방법을 시도해보세요.

## 방법 1: Cloudflare 대시보드에서 직접 확인

### Settings 탭 확인
1. **Pages > meeting-room-booking 프로젝트 선택**
2. **Settings** 탭 클릭
3. 다음 섹션들을 확인:
   - **General settings**
   - **Project settings**
   - **Builds & deployments**
   - **Environment variables**

프로젝트 이름 변경 옵션이 다른 섹션에 있을 수 있습니다.

### 프로젝트 설정 확인
일부 Cloudflare Pages 버전에서는:
- **Project settings** 섹션에 이름 변경 옵션이 있을 수 있습니다
- 또는 프로젝트 이름 옆에 편집 아이콘이 있을 수 있습니다

## 방법 2: 새 프로젝트 생성 후 재배포

프로젝트 이름 변경이 불가능한 경우:

### 1단계: 새 프로젝트 생성
1. **Cloudflare Pages > Create a project**
2. **Connect to Git** 선택
3. **GitHub** 선택
4. **hrju-hash/meeting-room-booking** 저장소 선택
5. **프로젝트 이름**: `malgn-booking` 입력
6. **Save and Deploy** 클릭

### 2단계: 기존 커스텀 도메인 연결
1. 새 프로젝트 > **Custom domains**
2. **Set up a custom domain** 클릭
3. `malgn.booking.com` 입력
4. **Continue** 클릭

### 3단계: 기존 프로젝트 삭제 (선택사항)
1. 기존 프로젝트(`meeting-room-booking-6ml`) 선택
2. **Settings** > **Delete project**
3. 확인 후 삭제

## 방법 3: PowerShell 스크립트 사용

API를 통한 자동 변경 시도:

```powershell
.\rename-project.ps1
```

스크립트가 실행되면:
1. API 토큰 입력
2. Account ID 입력
3. 자동으로 프로젝트 이름 변경 시도

## 방법 4: Cloudflare 지원팀 문의

위 방법들이 모두 작동하지 않는 경우:
1. Cloudflare 지원팀에 문의
2. 프로젝트 이름 변경 요청
3. 프로젝트 ID와 새 이름 제공

## 확인 사항

### 프로젝트 이름이 변경되었는지 확인
- 새 주소: `https://malgn-booking.pages.dev`
- 접속하여 사이트가 정상 작동하는지 확인

### 커스텀 도메인 확인
- `http://malgn.booking.com` 접속
- 여전히 정상 작동하는지 확인

## 중요 참고사항

⚠️ **주의**:
- 프로젝트 이름 변경 후 기존 배포 주소는 더 이상 작동하지 않습니다
- 커스텀 도메인은 그대로 유지됩니다
- GitHub 연동은 그대로 유지됩니다

