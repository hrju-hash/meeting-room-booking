# Cloudflare Pages 커스텀 도메인 설정 스크립트
# 사용법: .\setup-domain.ps1 -ApiToken "YOUR_API_TOKEN" -AccountId "YOUR_ACCOUNT_ID" -ProjectName "meeting-room-booking" -Domain "malgn.booking.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "meeting-room-booking",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "malgn.booking.com"
)

Write-Host "Cloudflare Pages 커스텀 도메인 설정 중..." -ForegroundColor Cyan

# 1. 프로젝트 정보 가져오기
Write-Host "프로젝트 정보 조회 중..." -ForegroundColor Yellow
$projectUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName"
$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

try {
    $projectResponse = Invoke-RestMethod -Uri $projectUrl -Method Get -Headers $headers
    Write-Host "프로젝트를 찾았습니다: $($projectResponse.result.name)" -ForegroundColor Green
    
    # 2. 커스텀 도메인 추가
    Write-Host "커스텀 도메인 추가 중: $Domain" -ForegroundColor Yellow
    $domainUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName/domains"
    $body = @{
        domain = $Domain
    } | ConvertTo-Json
    
    $domainResponse = Invoke-RestMethod -Uri $domainUrl -Method Post -Headers $headers -Body $body
    Write-Host "커스텀 도메인이 성공적으로 추가되었습니다!" -ForegroundColor Green
    Write-Host "도메인: $Domain" -ForegroundColor White
    
} catch {
    Write-Host "오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "응답: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "" -ForegroundColor Green
Write-Host "설정 완료! DNS 전파까지 최대 24시간이 소요될 수 있습니다." -ForegroundColor Cyan

