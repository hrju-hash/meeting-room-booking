# Cloudflare Pages 프로젝트 이름 변경 스크립트
# meeting-room-booking-6ml → malgn-booking

Write-Host "=== Cloudflare Pages 프로젝트 이름 변경 ===" -ForegroundColor Cyan
Write-Host ""

# API 토큰 입력 받기
Write-Host "Cloudflare API 토큰이 필요합니다." -ForegroundColor Yellow
Write-Host "API 토큰 생성 방법:" -ForegroundColor White
Write-Host "1. https://dash.cloudflare.com/profile/api-tokens 접속" -ForegroundColor Gray
Write-Host "2. 'Create Token' 클릭" -ForegroundColor Gray
Write-Host "3. 'Edit Cloudflare Workers' 템플릿 선택" -ForegroundColor Gray
Write-Host "4. 권한: Account > Cloudflare Pages > Edit" -ForegroundColor Gray
Write-Host ""
$apiToken = Read-Host "API 토큰을 입력하세요" -AsSecureString
$apiTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiToken))

if ([string]::IsNullOrWhiteSpace($apiTokenPlain)) {
    Write-Host "API 토큰이 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# Account ID 입력 받기
Write-Host ""
Write-Host "Account ID 확인 방법:" -ForegroundColor White
Write-Host "1. https://dash.cloudflare.com 접속" -ForegroundColor Gray
Write-Host "2. 우측 상단에서 Account ID 확인" -ForegroundColor Gray
Write-Host ""
$accountId = Read-Host "Account ID를 입력하세요"

if ([string]::IsNullOrWhiteSpace($accountId)) {
    Write-Host "Account ID가 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# 프로젝트 정보
$oldProjectName = "meeting-room-booking-6ml"
$newProjectName = "malgn-booking"

Write-Host ""
Write-Host "프로젝트 이름 변경:" -ForegroundColor Cyan
Write-Host "  기존: $oldProjectName" -ForegroundColor White
Write-Host "  새 이름: $newProjectName" -ForegroundColor White
Write-Host "  Account ID: $accountId" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "취소되었습니다." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "프로젝트 정보 조회 중..." -ForegroundColor Yellow

# 1. 기존 프로젝트 정보 가져오기
$projectUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$oldProjectName"
$headers = @{
    "Authorization" = "Bearer $apiTokenPlain"
    "Content-Type" = "application/json"
}

try {
    $projectResponse = Invoke-RestMethod -Uri $projectUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "프로젝트를 찾았습니다: $($projectResponse.result.name)" -ForegroundColor Green
    
    # 2. 프로젝트 이름 변경 시도
    Write-Host ""
    Write-Host "프로젝트 이름 변경 중..." -ForegroundColor Yellow
    
    # Cloudflare Pages API는 프로젝트 이름 변경을 직접 지원하지 않을 수 있습니다
    # 대신 프로젝트 설정을 업데이트 시도
    $updateUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$oldProjectName"
    $updateBody = @{
        name = $newProjectName
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri $updateUrl -Method Patch -Headers $headers -Body $updateBody -ErrorAction Stop
        
        if ($updateResponse.success) {
            Write-Host ""
            Write-Host "=== 성공! ===" -ForegroundColor Green
            Write-Host "프로젝트 이름이 변경되었습니다!" -ForegroundColor Green
            Write-Host "새 주소: https://$newProjectName.pages.dev" -ForegroundColor White
            Write-Host ""
            Write-Host "참고: 기존 커스텀 도메인(malgn.booking.com)은 그대로 유지됩니다." -ForegroundColor Cyan
        } else {
            Write-Host "응답: $($updateResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host ""
        Write-Host "=== 프로젝트 이름 변경 실패 ===" -ForegroundColor Red
        Write-Host "Cloudflare Pages API가 프로젝트 이름 변경을 직접 지원하지 않을 수 있습니다." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "대안 방법:" -ForegroundColor Cyan
        Write-Host "1. Cloudflare 대시보드에서 수동으로 변경" -ForegroundColor White
        Write-Host "   - Pages > 프로젝트 > Settings > Project name" -ForegroundColor Gray
        Write-Host "2. 새 프로젝트 생성 후 코드 재배포" -ForegroundColor White
        Write-Host "   - 새 프로젝트 이름: $newProjectName" -ForegroundColor Gray
        Write-Host "   - 기존 GitHub 저장소 연결" -ForegroundColor Gray
        Write-Host ""
        Write-Host "오류 메시지: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "=== 오류 발생 ===" -ForegroundColor Red
    Write-Host "오류 메시지: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host "상세 오류:" -ForegroundColor Red
            Write-Host "  Code: $($errorJson.errors[0].code)" -ForegroundColor Red
            Write-Host "  Message: $($errorJson.errors[0].message)" -ForegroundColor Red
        } catch {
            Write-Host "응답 본문: $responseBody" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "문제 해결 방법:" -ForegroundColor Yellow
    Write-Host "1. API 토큰이 올바른지 확인하세요." -ForegroundColor White
    Write-Host "2. Account ID가 올바른지 확인하세요." -ForegroundColor White
    Write-Host "3. 프로젝트 이름이 정확한지 확인하세요." -ForegroundColor White
    Write-Host "4. API 토큰에 'Cloudflare Pages > Edit' 권한이 있는지 확인하세요." -ForegroundColor White
    
    exit 1
}

Write-Host ""
Write-Host "완료!" -ForegroundColor Green

