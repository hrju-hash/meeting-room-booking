# 배포 스크립트
$ErrorActionPreference = "Continue"

# 실제 경로 찾기
$projectPath = (Get-ChildItem -Path "C:\Work*" -Recurse -Filter "app.js" -ErrorAction SilentlyContinue | Select-Object -First 1).DirectoryName

if (-not $projectPath) {
    Write-Host "프로젝트 경로를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "프로젝트 경로: $projectPath" -ForegroundColor Cyan

# 경로로 이동
Set-Location $projectPath

# Git 상태 확인
Write-Host "`nGit 상태 확인..." -ForegroundColor Yellow
git status --short

# 파일 추가
Write-Host "`n파일 추가 중..." -ForegroundColor Yellow
git add app.js styles.css

# 커밋
Write-Host "커밋 중..." -ForegroundColor Yellow
git commit -m "2025년 10월 8일 대체휴무 추가 및 공휴일 표시 위치 변경"

if ($LASTEXITCODE -eq 0) {
    Write-Host "커밋 완료!" -ForegroundColor Green
    
    # 푸시
    Write-Host "`n원격 저장소에 푸시 중..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "푸시 완료!" -ForegroundColor Green
        Write-Host "`n배포 완료! Cloudflare Pages가 Git과 연동되어 있다면 자동으로 배포됩니다." -ForegroundColor Cyan
    } else {
        Write-Host "푸시 실패." -ForegroundColor Red
    }
} else {
    Write-Host "커밋할 변경사항이 없거나 오류가 발생했습니다." -ForegroundColor Yellow
}

Write-Host "`n작업 완료!" -ForegroundColor Green



