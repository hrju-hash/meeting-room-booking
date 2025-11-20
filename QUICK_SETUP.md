# 빠른 설정 가이드 - malgn.booking.com

## 1단계: Cloudflare API 토큰 생성 (2분)

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속 및 로그인

2. **API 토큰 생성**
   - 우측 상단 프로필 아이콘 클릭 > **My Profile**
   - 왼쪽 메뉴에서 **API Tokens** 클릭
   - **Create Token** 버튼 클릭
   - **Edit Cloudflare Workers** 템플릿 선택
   - 또는 **Custom token** 선택 후 다음 권한 설정:
     - **Account** > **Cloudflare Pages** > **Edit**
   - **Continue to summary** > **Create Token**
   - **토큰 복사** (한 번만 표시되므로 안전하게 보관)

## 2단계: Account ID 확인 (30초)

1. Cloudflare 대시보드 우측 상단에서 **Account ID** 확인
2. 복사해두기

## 3단계: GitHub Actions 실행 (1분)

1. **GitHub 저장소 접속**
   - https://github.com/hrju-hash/meeting-room-booking

2. **Actions 탭 클릭**
   - 상단 메뉴에서 **Actions** 클릭

3. **워크플로우 선택**
   - 왼쪽에서 **Setup Custom Domain** 선택

4. **워크플로우 실행**
   - **Run workflow** 버튼 클릭
   - 다음 정보 입력:
     - **API Token**: 1단계에서 복사한 토큰
     - **Account ID**: 2단계에서 확인한 ID
     - **Domain**: `malgn.booking.com` (기본값)
     - **Project Name**: `meeting-room-booking` (기본값)
   - **Run workflow** 클릭

5. **완료 대기**
   - 워크플로우 실행 완료까지 약 1분 소요
   - 초록색 체크 표시가 나타나면 성공!

## 4단계: 확인 (최대 24시간)

- DNS 전파까지 최대 24시간 소요될 수 있습니다
- http://malgn.booking.com 접속하여 확인
- Cloudflare가 자동으로 SSL 인증서를 발급합니다

## 문제 해결

### "Invalid API Token" 오류
- API 토큰이 올바른지 확인
- 토큰에 "Cloudflare Pages > Edit" 권한이 있는지 확인

### "Domain already exists" 오류
- 이미 도메인이 설정되어 있을 수 있습니다
- Cloudflare 대시보드 > Pages > meeting-room-booking > Custom domains에서 확인

### DNS 전파 지연
- 최대 24시간 소요될 수 있습니다
- `nslookup malgn.booking.com` 명령어로 확인 가능

## 대안: Cloudflare 대시보드에서 수동 설정

GitHub Actions가 작동하지 않는 경우:

1. https://dash.cloudflare.com 접속
2. **Pages** > **meeting-room-booking** 프로젝트 선택
3. **Custom domains** 탭 클릭
4. **Set up a custom domain** 클릭
5. `malgn.booking.com` 입력 후 **Continue**
6. 완료!

