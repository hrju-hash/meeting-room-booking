# 회의실 예약 시스템 기획안

## 1. 프로젝트 개요
회의실 예약을 효율적으로 관리할 수 있는 웹 애플리케이션

## 2. 주요 기능

### 2.1 핵심 기능
- **회의실 목록 조회**: 사용 가능한 회의실 목록 표시
- **예약하기**: 날짜, 시간, 회의실 선택하여 예약
- **예약 조회**: 내 예약 목록 확인
- **예약 취소**: 예약된 회의실 취소
- **실시간 가용성 확인**: 선택한 날짜/시간에 예약 가능한 회의실 표시

### 2.2 추가 기능 (향후 확장)
- 사용자 인증 시스템
- 예약 알림 (이메일/알림)
- 회의실 정보 (수용 인원, 시설물 등)
- 예약 승인/거부 시스템
- 통계 및 리포트

## 3. 기술 스택

### 프론트엔드
- **React + Vite**: 빠른 개발 환경
- **CSS/Tailwind**: 모던한 UI 디자인
- **LocalStorage**: 초기 데이터 저장 (향후 백엔드 연동)

### 데이터 구조
```javascript
// 회의실 데이터
{
  id: number,
  name: string,
  capacity: number,
  location: string,
  facilities: string[]
}

// 예약 데이터
{
  id: number,
  roomId: number,
  roomName: string,
  date: string,
  startTime: string,
  endTime: string,
  userName: string,
  purpose: string,
  createdAt: string
}
```

## 4. UI/UX 설계

### 메인 페이지
- 헤더: 로고, 네비게이션
- 회의실 목록 카드: 회의실 정보, 예약 버튼
- 예약 모달: 날짜/시간 선택, 목적 입력

### 예약 관리 페이지
- 예약 목록 테이블
- 필터링 (날짜, 회의실별)
- 취소 기능

## 5. 개발 단계

### Phase 1 (기초 버전)
- ✅ 기본 UI 구성
- ✅ 회의실 목록 표시
- ✅ 예약 기능 (로컬 스토리지)
- ✅ 예약 목록 조회
- ✅ 예약 취소

### Phase 2 (향후)
- 사용자 인증
- 백엔드 API 연동
- 실시간 업데이트
- 알림 시스템

## 6. 배포 계획
- GitHub Pages 또는 Vercel을 통한 배포
- GitHub 저장소에 코드 푸시

