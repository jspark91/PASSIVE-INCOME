# Desktop Calendar

바탕화면 전체를 달력 보드처럼 쓰기 위한 로컬 우선 캘린더입니다.

## Start

정적 앱이라 설치 없이 바로 실행할 수 있습니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-desktop-calendar.ps1
```

또는 `index.html`을 브라우저에서 직접 열 수 있습니다.

## Windows Desktop Mode

Desktop Calendar처럼 바탕화면에 붙여서 쓰는 Windows 호스트도 포함되어 있습니다.

개발 실행:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-desktop-calendar-host.ps1
```

설치 파일용 publish:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-desktop-calendar-installer.ps1
```

다운로드 배포용 zip 패키지 생성:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\package-desktop-calendar-release.ps1 -Version 0.1.22 -Runtimes win-x64
```

로컬 설치:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-desktop-calendar.ps1
```

설치 스크립트는 앱을 `%LOCALAPPDATA%\Programs\DesktopCalendar`에 복사하고, 바탕화면 바로가기와 Windows 시작 시 실행 설정을 만듭니다. 배포용 zip 안에는 `Install-DesktopCalendar.ps1`과 `Uninstall-DesktopCalendar.ps1`이 함께 들어갑니다.

## Download Builds

GitHub Actions workflow `.github/workflows/desktop-calendar-release.yml`가 배포 zip을 만듭니다.

- 일반 push: Actions artifact로 `DesktopCalendar-<version>-win-x64.zip`, `DesktopCalendar-<version>-win-arm64.zip` 생성
- 수동 실행: GitHub Actions에서 `Desktop Calendar Release` workflow를 실행하고 version 입력
- 릴리스 생성: `desktop-calendar-v0.1.22` 같은 tag를 push하면 GitHub Release에 zip과 `SHA256SUMS.txt`가 첨부됨

사용자 설치 순서:

1. GitHub Actions artifact 또는 GitHub Release에서 Windows용 zip 다운로드
2. 압축 풀기
3. `Install-DesktopCalendar.ps1`을 PowerShell로 실행
4. 설치 후 바탕화면 바로가기 또는 자동 실행으로 사용

현재 패키지는 unsigned입니다. 코드 서명 전에는 Windows SmartScreen 경고가 나올 수 있습니다.

## Current MVP

- 전체 화면 월간 달력
- 날짜별 일정 작성, 수정, 삭제
- 일정 카테고리 색상 구분
- 오늘/선택 날짜 강조
- 일정 드래그 이동
- 오늘 일정, 다음 7일 일정, 검색 결과 패널
- 반복 일정: 매일, 매주, 매월, 매년. 월말/윤년 일정은 해당 달의 마지막 날짜로 보정
- 알림: 정시, 10분 전, 30분 전, 1시간 전, 하루 전
- 로컬 저장: 브라우저 `localStorage`
- WPF/WebView2 Windows 호스트
- Desktop Calendar 방식의 바탕화면 오버레이 고정
- 트레이 아이콘: 바탕화면 고정, 일반 창, 숨기기, 시작프로그램, 종료
- 해상도 기반 자동 창 크기
- 트레이 크기 설정: Auto, Compact, Normal, Large, Full desktop, Custom
- 앱 상단 `설정` 패널에서 편집 잠금, 투명도, 글자 크기, 색상 테마 조절
- 편집 잠금 상태에서는 WebView2 자식 창까지 클릭 통과 처리해서 바탕화면 아이콘 클릭이 캘린더보다 우선됨
- 편집 잠금 해제 상태에서는 앱 빈 공간 드래그로 창 이동, 테두리 드래그로 크기 조절
- 투명도 설정은 달력 칸뿐 아니라 상단바, 패널, 입력칸, 일정 칩에 일괄 적용
- Explorer 재시작, DPI 변경, 디스플레이 변경 시 바탕화면 레이어 재부착
- 투명 배경 모드: 달력 뒤로 바탕화면이 보이도록 WebView2/WPF 배경 투명 처리
- 앱 우상단 창 버튼: 최소화, 최대화/복원, 종료
- GitHub Actions 자동 패키징: push artifact와 tag 기반 GitHub Release 생성

## Common Calendar Features To Consider

사람들이 자주 쓰는 달력 기능은 보통 아래 순서로 가치가 큽니다.

1. 월간/주간/일간 보기 전환
2. 반복 일정
3. 일정 알림
4. 색상 카테고리
5. 날짜가 있는 할 일과 완료 체크
6. 일정 검색
7. 일정 안의 메모, 주소, 전화번호
8. 공휴일, 대체공휴일, 음력
9. 백업과 내보내기
10. Google Calendar, Outlook 같은 외부 캘린더 연동

## Notes

현재 버전은 인터넷 연결이나 계정 없이 동작합니다. 데이터는 이 앱을 연 브라우저의 로컬 저장소에 남습니다.
