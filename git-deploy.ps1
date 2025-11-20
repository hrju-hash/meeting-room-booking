# Git 커밋 및 푸시를 통한 자동 배포 스크립트

$ErrorActionPreference = "Stop"

# 프로젝트 디렉토리 경로 (작업 공간 경로)
$projectPath = "C:\Work Space\플젝_251017"

Write-Host "프로젝트 디렉토리로 이동 중..." -ForegroundColor Cyan

# 프로젝트 디렉토리로 이동
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "현재 디렉토리: $(Get-Location)" -ForegroundColor Green
} else {
    Write-Host "프로젝트 디렉토리를 찾을 수 없습니다: $projectPath" -ForegroundColor Red
    exit 1
}

# Git 저장소 확인
if (-not (Test-Path ".git")) {
    Write-Host "Git 저장소를 초기화합니다..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/hrju-hash/meeting-room-booking.git
}

# Git 원격 저장소 확인
Write-Host "원격 저장소 확인 중..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "원격 저장소: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "원격 저장소를 추가합니다..." -ForegroundColor Yellow
    git remote add origin https://github.com/hrju-hash/meeting-room-booking.git
}

# 변경된 파일 확인
Write-Host "변경된 파일 확인 중..." -ForegroundColor Yellow
git status --short

# 모든 파일 추가
Write-Host "파일 추가 중..." -ForegroundColor Yellow
git add .

# 커밋
Write-Host "커밋 중..." -ForegroundColor Yellow
$commitMessage = "2025년 10월 10일 공휴일 제외 수정"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "커밋 완료!" -ForegroundColor Green
} else {
    Write-Host "커밋할 변경사항이 없거나 오류가 발생했습니다." -ForegroundColor Yellow
}

# 푸시
Write-Host "원격 저장소에 푸시 중..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "푸시 완료!" -ForegroundColor Green
    Write-Host "Cloudflare Pages가 Git과 연동되어 있다면 자동으로 배포됩니다." -ForegroundColor Cyan
    Write-Host "배포 상태는 Cloudflare 대시보드에서 확인하세요: https://dash.cloudflare.com" -ForegroundColor Cyan
} else {
    Write-Host "푸시 실패. 브랜치 이름을 확인하세요." -ForegroundColor Yellow
    
    # 브랜치 확인 및 생성
    $currentBranch = git branch --show-current
    if (-not $currentBranch) {
        Write-Host "main 브랜치를 생성합니다..." -ForegroundColor Yellow
        git checkout -b main
        git push -u origin main
    } else {
        Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Yellow
        git push -u origin $currentBranch
    }
}

Write-Host "`n작업 완료!" -ForegroundColor Green

