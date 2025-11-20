# Firebase 자동 설정 스크립트
# 이 스크립트는 Firebase 프로젝트를 자동으로 생성하고 설정합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase 자동 설정 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Firebase CLI 설치 확인
Write-Host "[1/6] Firebase CLI 확인 중..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Firebase CLI가 설치되어 있습니다: $firebaseVersion" -ForegroundColor Green
    } else {
        throw "Firebase CLI가 설치되지 않았습니다"
    }
} catch {
    Write-Host "✗ Firebase CLI가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "  Firebase CLI를 설치하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $install = Read-Host
    if ($install -eq "Y" -or $install -eq "y") {
        Write-Host "  npm을 통해 Firebase CLI 설치 중..." -ForegroundColor Yellow
        npm install -g firebase-tools
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Firebase CLI 설치 실패" -ForegroundColor Red
            Write-Host "  수동 설치: npm install -g firebase-tools" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "  ✓ Firebase CLI 설치 완료" -ForegroundColor Green
    } else {
        Write-Host "  Firebase CLI 설치를 건너뜁니다." -ForegroundColor Yellow
        Write-Host "  수동 설치: npm install -g firebase-tools" -ForegroundColor Yellow
        exit 1
    }
}

# 2. Firebase 로그인 확인
Write-Host ""
Write-Host "[2/6] Firebase 로그인 확인 중..." -ForegroundColor Yellow
try {
    firebase login:list 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Firebase에 로그인되어 있습니다" -ForegroundColor Green
    } else {
        throw "로그인 필요"
    }
} catch {
    Write-Host "✗ Firebase에 로그인되어 있지 않습니다." -ForegroundColor Red
    Write-Host "  브라우저가 열리면 Google 계정으로 로그인해주세요..." -ForegroundColor Yellow
    firebase login --no-localhost
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Firebase 로그인 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Firebase 로그인 완료" -ForegroundColor Green
}

# 3. 프로젝트 디렉토리 확인
Write-Host ""
Write-Host "[3/6] 프로젝트 디렉토리 확인 중..." -ForegroundColor Yellow
$projectPath = Get-Location
Write-Host "  현재 디렉토리: $projectPath" -ForegroundColor Gray

# 4. Firebase 프로젝트 생성 또는 선택
Write-Host ""
Write-Host "[4/6] Firebase 프로젝트 설정 중..." -ForegroundColor Yellow
$projectName = "malgn-booking"

# 기존 프로젝트 확인
$firebaseJson = Join-Path $projectPath ".firebaserc"
if (Test-Path $firebaseJson) {
    Write-Host "  기존 Firebase 프로젝트 설정이 있습니다." -ForegroundColor Yellow
    $useExisting = Read-Host "  기존 프로젝트를 사용하시겠습니까? (Y/N)"
    if ($useExisting -ne "Y" -and $useExisting -ne "y") {
        Remove-Item $firebaseJson -Force
        Remove-Item "firebase.json" -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $firebaseJson)) {
    Write-Host "  Firebase 프로젝트를 생성하거나 선택합니다..." -ForegroundColor Yellow
    Write-Host "  프로젝트 이름: $projectName" -ForegroundColor Gray
    
    # 프로젝트 생성 (대화형)
    Write-Host ""
    Write-Host "  다음 중 선택하세요:" -ForegroundColor Yellow
    Write-Host "  1. 새 프로젝트 생성" -ForegroundColor Cyan
    Write-Host "  2. 기존 프로젝트 사용" -ForegroundColor Cyan
    $choice = Read-Host "  선택 (1 또는 2)"
    
    if ($choice -eq "1") {
        Write-Host "  새 프로젝트 생성 중..." -ForegroundColor Yellow
        firebase projects:create $projectName --display-name "맑은스페이스 회의실 예약"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ 프로젝트 생성 실패. 기존 프로젝트를 사용하거나 수동으로 생성해주세요." -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✓ 프로젝트 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "  사용 가능한 프로젝트 목록:" -ForegroundColor Yellow
        firebase projects:list
        $selectedProject = Read-Host "  사용할 프로젝트 ID를 입력하세요"
        $projectName = $selectedProject
    }
    
    # Firebase 초기화
    Write-Host "  Firebase 초기화 중..." -ForegroundColor Yellow
    firebase use $projectName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Firebase 초기화 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Firebase 초기화 완료" -ForegroundColor Green
} else {
    Write-Host "  ✓ 기존 Firebase 프로젝트 설정 사용" -ForegroundColor Green
}

# 5. Realtime Database 생성 및 규칙 설정
Write-Host ""
Write-Host "[5/6] Realtime Database 설정 중..." -ForegroundColor Yellow

# 데이터베이스 인스턴스 확인 및 생성
Write-Host "  Realtime Database 인스턴스 확인 중..." -ForegroundColor Gray
$dbExists = firebase database:instances:list 2>&1
if ($LASTEXITCODE -ne 0 -or $dbExists -match "No database instances") {
    Write-Host "  Realtime Database 생성 중..." -ForegroundColor Yellow
    Write-Host "  위치: asia-northeast3 (Seoul)" -ForegroundColor Gray
    # Firebase CLI로는 데이터베이스를 직접 생성할 수 없으므로 수동 안내
    Write-Host ""
    Write-Host "  ⚠ Realtime Database는 Firebase 콘솔에서 수동으로 생성해야 합니다:" -ForegroundColor Yellow
    Write-Host "    1. https://console.firebase.google.com/ 접속" -ForegroundColor Cyan
    Write-Host "    2. 프로젝트 '$projectName' 선택" -ForegroundColor Cyan
    Write-Host "    3. Realtime Database > 데이터베이스 만들기" -ForegroundColor Cyan
    Write-Host "    4. 위치: asia-northeast3 (Seoul) 선택" -ForegroundColor Cyan
    Write-Host "    5. 보안 규칙: 테스트 모드로 시작" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "  데이터베이스 생성 완료 후 계속하시겠습니까? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        Write-Host "  설정을 중단합니다." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "  ✓ Realtime Database가 이미 존재합니다" -ForegroundColor Green
}

# 보안 규칙 파일 생성
Write-Host "  보안 규칙 파일 생성 중..." -ForegroundColor Yellow
$rulesContent = @"
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
"@

$databaseDir = Join-Path $projectPath "database"
if (-not (Test-Path $databaseDir)) {
    New-Item -ItemType Directory -Path $databaseDir | Out-Null
}
$rulesFile = Join-Path $databaseDir "rules.json"
$rulesContent | Out-File -FilePath $rulesFile -Encoding UTF8
Write-Host "  ✓ 보안 규칙 파일 생성 완료: $rulesFile" -ForegroundColor Green

# 6. Firebase 구성 정보 가져오기 및 firebase-config.js 업데이트
Write-Host ""
Write-Host "[6/6] Firebase 구성 정보 설정 중..." -ForegroundColor Yellow

# Firebase 프로젝트 정보 가져오기
Write-Host "  Firebase 프로젝트 정보 조회 중..." -ForegroundColor Gray
$projectInfo = firebase projects:list --json | ConvertFrom-Json
$currentProject = $projectInfo | Where-Object { $_.projectId -eq $projectName }

if (-not $currentProject) {
    Write-Host "  ✗ 프로젝트 정보를 찾을 수 없습니다" -ForegroundColor Red
    Write-Host ""
    Write-Host "  수동 설정 방법:" -ForegroundColor Yellow
    Write-Host "  1. https://console.firebase.google.com/ 접속" -ForegroundColor Cyan
    Write-Host "  2. 프로젝트 '$projectName' 선택" -ForegroundColor Cyan
    Write-Host "  3. 프로젝트 설정 > 일반 > 앱 > 웹 앱" -ForegroundColor Cyan
    Write-Host "  4. 구성 정보 복사하여 firebase-config.js에 붙여넣기" -ForegroundColor Cyan
    exit 1
}

# 웹 앱 등록 확인 및 구성 정보 가져오기
Write-Host "  웹 앱 구성 정보를 가져오려면 Firebase 콘솔에서 웹 앱을 등록해야 합니다." -ForegroundColor Yellow
Write-Host ""
Write-Host "  다음 단계를 따라주세요:" -ForegroundColor Yellow
Write-Host "  1. https://console.firebase.google.com/project/$projectName/settings/general" -ForegroundColor Cyan
Write-Host "  2. '앱' 섹션에서 웹 아이콘 (</>) 클릭" -ForegroundColor Cyan
Write-Host "  3. 앱 닉네임: malgn-booking-web 입력" -ForegroundColor Cyan
Write-Host "  4. '앱 등록' 클릭" -ForegroundColor Cyan
Write-Host "  5. 표시되는 구성 정보를 복사" -ForegroundColor Cyan
Write-Host ""
$configProvided = Read-Host "  구성 정보를 복사하셨나요? (Y/N)"

if ($configProvided -eq "Y" -or $configProvided -eq "y") {
    Write-Host ""
    Write-Host "  firebase-config.js 파일을 열어서 구성 정보를 붙여넣어주세요." -ForegroundColor Yellow
    Write-Host "  파일 위치: firebase-config.js" -ForegroundColor Gray
    
    # 파일 열기
    $configFile = Join-Path $projectPath "firebase-config.js"
    if (Test-Path $configFile) {
        notepad $configFile
        Write-Host ""
        $configSaved = Read-Host "  구성 정보를 저장하셨나요? (Y/N)"
        if ($configSaved -ne "Y" -and $configSaved -ne "y") {
            Write-Host "  ⚠ 구성 정보를 저장하지 않으면 Firebase가 작동하지 않습니다." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ⚠ 나중에 firebase-config.js 파일을 수동으로 설정해주세요." -ForegroundColor Yellow
}

# 완료
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase 설정 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. Firebase 콘솔에서 Realtime Database 생성 (위치: asia-northeast3)" -ForegroundColor Cyan
Write-Host "2. firebase-config.js 파일에 구성 정보 입력" -ForegroundColor Cyan
Write-Host "3. 브라우저에서 테스트 (F12 콘솔에서 'Firebase가 성공적으로 초기화되었습니다.' 확인)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Firebase 콘솔: https://console.firebase.google.com/project/$projectName" -ForegroundColor Gray
Write-Host ""


