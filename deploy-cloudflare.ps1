# Cloudflare Pages 배포 스크립트
# 사용법: .\deploy-cloudflare.ps1 -ApiToken "YOUR_API_TOKEN" -AccountId "YOUR_ACCOUNT_ID" -ProjectName "malgn-booking"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "malgn-booking"
)

Write-Host "Cloudflare Pages 배포 시작..." -ForegroundColor Cyan

# 현재 디렉토리 확인
$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

Write-Host "프로젝트 경로: $projectPath" -ForegroundColor Yellow

# 배포할 파일 목록
$filesToDeploy = @(
    "index.html",
    "app.js",
    "styles.css"
)

# 파일 존재 확인
$missingFiles = @()
foreach ($file in $filesToDeploy) {
    $filePath = Join-Path $projectPath $file
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "다음 파일들을 찾을 수 없습니다:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

# 임시 디렉토리 생성
$tempDir = Join-Path $env:TEMP "cloudflare-pages-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Write-Host "임시 디렉토리 생성: $tempDir" -ForegroundColor Yellow

try {
    # 배포할 파일 복사
    foreach ($file in $filesToDeploy) {
        $sourcePath = Join-Path $projectPath $file
        $destPath = Join-Path $tempDir $file
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "파일 복사: $file" -ForegroundColor Green
    }
    
    # 로고 파일도 복사 (있는 경우)
    $logoFiles = @("logo.jpg", "logo.svg")
    foreach ($logoFile in $logoFiles) {
        $logoPath = Join-Path $projectPath $logoFile
        if (Test-Path $logoPath) {
            $destLogoPath = Join-Path $tempDir $logoFile
            Copy-Item -Path $logoPath -Destination $destLogoPath -Force
            Write-Host "로고 파일 복사: $logoFile" -ForegroundColor Green
        }
    }
    
    # ZIP 파일 생성
    $zipPath = Join-Path $env:TEMP "cloudflare-pages-deploy.zip"
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    Write-Host "ZIP 파일 생성 중..." -ForegroundColor Yellow
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
    Write-Host "ZIP 파일 생성 완료: $zipPath" -ForegroundColor Green
    
    # Cloudflare Pages API로 배포
    Write-Host "Cloudflare Pages에 배포 중..." -ForegroundColor Yellow
    
    # 1. 배포 생성 (파일 업로드)
    $deployUrl = "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName/deployments"
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $headers = @{
        "Authorization" = "Bearer $ApiToken"
    }
    
    # 멀티파트 폼 데이터 생성
    $fileBytes = [System.IO.File]::ReadAllBytes($zipPath)
    $fileContent = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"deploy.zip`"",
        "Content-Type: application/zip",
        "",
        $fileContent,
        "--$boundary--"
    )
    $body = $bodyLines -join "`r`n"
    
    try {
        $response = Invoke-RestMethod -Uri $deployUrl -Method Post -Headers $headers -Body ([System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body)) -ContentType "multipart/form-data; boundary=$boundary"
        
        Write-Host "배포 성공!" -ForegroundColor Green
        Write-Host "배포 URL: $($response.result.url)" -ForegroundColor Cyan
        Write-Host "배포 ID: $($response.result.id)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "배포 실패: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "응답: $responseBody" -ForegroundColor Red
        }
        
        # 대안: 간단한 방법 안내
        Write-Host "`n대안: Cloudflare 대시보드에서 수동 배포" -ForegroundColor Yellow
        Write-Host "1. https://dash.cloudflare.com 접속" -ForegroundColor White
        Write-Host "2. Pages > $ProjectName 프로젝트 선택" -ForegroundColor White
        Write-Host "3. Deployments 탭 > Upload assets 클릭" -ForegroundColor White
        Write-Host "4. 다음 파일들을 업로드:" -ForegroundColor White
        $filesToDeploy | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
        Write-Host "5. ZIP 파일 위치: $zipPath" -ForegroundColor White
        
        exit 1
    }
    
} finally {
    # 임시 디렉토리 정리
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}

Write-Host "`n배포 완료!" -ForegroundColor Green

