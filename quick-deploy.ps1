# 빠른 배포 스크립트
$ErrorActionPreference = "Stop"

# 프로젝트 경로 (실제 경로)
$projectPath = "C:\Work Space\플젝_251017"

Write-Host "프로젝트 경로: $projectPath" -ForegroundColor Cyan

# Git 작업
Write-Host "`nGit 작업 시작..." -ForegroundColor Yellow

# 파일 추가
$files = @("app.js", "index.html", "styles.css", "logo.jpg", "logo.svg")
foreach ($file in $files) {
    $filePath = Join-Path $projectPath $file
    if (Test-Path $filePath) {
        Write-Host "파일 확인: $file" -ForegroundColor Green
    }
}

# Git 명령어 실행 (경로 문제 해결을 위해 직접 실행)
$gitCommands = @(
    "git add app.js index.html styles.css logo.jpg logo.svg",
    "git commit -m `"2025년 10월 10일 공휴일 제외 수정`"",
    "git push -u origin main"
)

$originalLocation = Get-Location

try {
    # 프로젝트 디렉토리로 이동 시도
    if (Test-Path $projectPath) {
        Set-Location $projectPath
        Write-Host "현재 디렉토리: $(Get-Location)" -ForegroundColor Green
        
        # Git 상태 확인
        Write-Host "`nGit 상태 확인..." -ForegroundColor Yellow
        git status --short
        
        # 파일 추가
        Write-Host "`n파일 추가 중..." -ForegroundColor Yellow
        git add app.js index.html styles.css
        if (Test-Path "logo.jpg") { git add logo.jpg }
        if (Test-Path "logo.svg") { git add logo.svg }
        
        # 커밋
        Write-Host "커밋 중..." -ForegroundColor Yellow
        git commit -m "2025년 10월 10일 공휴일 제외 수정"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "커밋 완료!" -ForegroundColor Green
            
            # 푸시
            Write-Host "`n원격 저장소에 푸시 중..." -ForegroundColor Yellow
            git push -u origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "푸시 완료!" -ForegroundColor Green
                Write-Host "`n배포 완료! Cloudflare Pages가 Git과 연동되어 있다면 자동으로 배포됩니다." -ForegroundColor Cyan
                Write-Host "배포 상태 확인: https://dash.cloudflare.com" -ForegroundColor Cyan
            } else {
                Write-Host "푸시 실패. 브랜치를 확인합니다..." -ForegroundColor Yellow
                $branch = git branch --show-current
                if (-not $branch) {
                    git checkout -b main
                    git push -u origin main
                }
            }
        } else {
            Write-Host "커밋할 변경사항이 없거나 오류가 발생했습니다." -ForegroundColor Yellow
        }
    } else {
        Write-Host "프로젝트 경로를 찾을 수 없습니다: $projectPath" -ForegroundColor Red
    }
} catch {
    Write-Host "오류 발생: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Set-Location $originalLocation
}

Write-Host "`n작업 완료!" -ForegroundColor Green



