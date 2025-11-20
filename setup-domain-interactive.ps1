# Cloudflare Pages 커스텀 도메인 설정 대화형 스크립트
# 사용자가 API 토큰과 Account ID를 입력하면 자동으로 설정합니다

Write-Host "=== Cloudflare Pages 커스텀 도메인 설정 ===" -ForegroundColor Cyan
Write-Host ""

# API 토큰 입력 받기
Write-Host "Cloudflare API 토큰이 필요합니다." -ForegroundColor Yellow
Write-Host "API 토큰 생성 방법:" -ForegroundColor White
Write-Host "1. https://dash.cloudflare.com/profile/api-tokens 접속" -ForegroundColor Gray
Write-Host "2. 'Create Token' 클릭" -ForegroundColor Gray
Write-Host "3. 'Edit Cloudflare Workers' 템플릿 선택 또는 'Custom token' 선택" -ForegroundColor Gray
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

# 프로젝트 이름과 도메인
$projectName = "meeting-room-booking"
$domain = "malgn.booking.com"

Write-Host ""
Write-Host "설정 정보:" -ForegroundColor Cyan
Write-Host "  프로젝트: $projectName" -ForegroundColor White
Write-Host "  도메인: $domain" -ForegroundColor White
Write-Host "  Account ID: $accountId" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "계속하시겠습니까? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "취소되었습니다." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Cloudflare Pages 커스텀 도메인 설정 중..." -ForegroundColor Cyan

# 1. 프로젝트 정보 확인
Write-Host "프로젝트 정보 조회 중..." -ForegroundColor Yellow
$projectUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$projectName"
$headers = @{
    "Authorization" = "Bearer $apiTokenPlain"
    "Content-Type" = "application/json"
}

try {
    $projectResponse = Invoke-RestMethod -Uri $projectUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "프로젝트를 찾았습니다: $($projectResponse.result.name)" -ForegroundColor Green
    
    # 2. 커스텀 도메인 추가
    Write-Host "커스텀 도메인 추가 중: $domain" -ForegroundColor Yellow
    $domainUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$projectName/domains"
    $body = @{
        domain = $domain
    } | ConvertTo-Json
    
    $domainResponse = Invoke-RestMethod -Uri $domainUrl -Method Post -Headers $headers -Body $body -ErrorAction Stop
    
    if ($domainResponse.success) {
        Write-Host ""
        Write-Host "=== 성공! ===" -ForegroundColor Green
        Write-Host "커스텀 도메인이 성공적으로 추가되었습니다!" -ForegroundColor Green
        Write-Host "도메인: $domain" -ForegroundColor White
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Cyan
        Write-Host "1. DNS 전파까지 최대 24시간이 소요될 수 있습니다." -ForegroundColor White
        Write-Host "2. Cloudflare가 자동으로 SSL 인증서를 발급합니다." -ForegroundColor White
        Write-Host "3. 설정 확인: https://dash.cloudflare.com > Pages > $projectName > Custom domains" -ForegroundColor White
    } else {
        Write-Host "응답: $($domainResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Yellow
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
    Write-Host "3. API 토큰에 'Cloudflare Pages > Edit' 권한이 있는지 확인하세요." -ForegroundColor White
    Write-Host "4. 도메인이 이미 추가되어 있는지 확인하세요." -ForegroundColor White
    
    exit 1
}

Write-Host ""
Write-Host "완료!" -ForegroundColor Green

