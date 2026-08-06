# header-menu.md

> 헤더 메뉴 + 메인 대시보드 작업 프롬프트
> 작성일: 2026-08-06
> 대상 프로젝트: `board/`


# 1. 요청 원문

```
메인페이지는 중앙에 서울과 도쿄의 날짜,시간, 현재 온도를 대시보드 형태로 나오도록 해.

메뉴 만들기)
header에 메뉴를 만든다, 메뉴 배경색은 연두색 그라데이션, 메뉴명은 흰색,
좌측에 Home 로고, 게시판 메뉴를 만든다
하단에는 소개 문의사항 메뉴를 만든다
우측에는 비로그인 시에는 로그인 텍스트 버튼,
로그인 시에는 사용자 이름이 출력되고 드랍다운으로 profile, logout 메뉴를 노출

디자인)
메뉴는 배경색은 회색 그라데이션, 메뉴명은 흰색, 폰트는 20px 고딕체,
로그인 시 사용자 이름 앞에 사람 아이콘 생성, height는 56px 정도.
```


# 2. 해석 및 결정 사항

원문에 명확하지 않은 부분이 있어 아래와 같이 정하고 작업한다.

## 2.1 헤더 배경색 (충돌)

- `메뉴 만들기` 에서는 **연두색 그라데이션**, `디자인` 에서는 **회색 그라데이션** 이라고 되어 있다
- `디자인` 섹션이 뒤에 나오는 디자인 전용 명세이므로 **회색 그라데이션을 채택**한다
- 단, 언제든 바꿀 수 있도록 `Header.module.css` 상단에 CSS 변수로 빼고
  연두색 그라데이션 값을 주석으로 함께 남긴다 (한 줄 교체로 전환)

## 2.2 "하단에는 소개 문의사항 메뉴"

- 헤더 높이가 56px 로 고정이라 2단 메뉴가 들어갈 수 없다
- 따라서 `소개` / `문의사항` 은 **페이지 하단 Footer** 로 해석한다
- Footer 도 헤더와 같은 방식(상태 전환)으로 컨텐츠를 바꾼다

## 2.3 메뉴 구성 최종

| 위치 | 항목 | 동작 |
|---|---|---|
| 헤더 좌측 | `Home` 로고 | `activeMenu = 'home'` (메인 대시보드) |
| 헤더 좌측 | `게시판` | `activeMenu = 'board'` |
| 헤더 우측 | `로그인` (비로그인 시) | `authView = 'login'` |
| 헤더 우측 | `사람아이콘 + 사용자이름 ▾` (로그인 시) | 드롭다운: `profile`, `logout` |
| 푸터 | `소개` | `activeMenu = 'about'` |
| 푸터 | `문의사항` | `activeMenu = 'contact'` |

- 기본 진입 화면은 `home` 이다
  (`CLAUDE.md` 3.3 의 기본값 `'board'` → `'home'` 으로 변경)
- 메뉴를 눌러도 **페이지 이동은 없다.** `MainLayout` 의 컨텐츠 영역만 교체한다
  (`CLAUDE.md` 3. 레이아웃 구조 규칙 그대로)

## 2.4 드롭다운 동작

- 사용자 이름 버튼을 누르면 열리고, 다시 누르면 닫힌다
- 바깥 영역 클릭 / `Esc` 키로 닫힌다
- `profile` → `activeMenu = 'profile'`, `logout` → 로그아웃 후 드롭다운 닫기
- 로그아웃해도 보고 있던 화면은 유지한다 (`work.md` 3.2)

## 2.5 메인 대시보드 (서울 / 도쿄)

- 화면 중앙에 카드 2장을 나란히 배치한다 (좁은 화면에서는 세로 1열)
- 카드 내용: 도시명 / 날짜 / 시간 / 현재 온도
- **날짜·시간**: 각 도시의 현지 시각. `Intl.DateTimeFormat` 의
  `timeZone` (`Asia/Seoul`, `Asia/Tokyo`) 으로 계산한다. 1초마다 갱신
- **현재 온도**: Open-Meteo 현재 날씨 API 사용
  - `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m`
  - **API 키가 필요 없다.** (`weather/` 프로젝트가 쓰는 OpenWeatherMap 은
    키가 있어야 해서 이번엔 쓰지 않는다)
  - 서울 `37.5665, 126.9780` / 도쿄 `35.6895, 139.6917`
  - 로딩 중 / 실패 시 상태를 카드에 표시한다 (실패해도 날짜·시간은 계속 보인다)


# 3. 작업 범위

`board/` 는 아직 코드가 없는 문서만 있는 상태이므로 프로젝트 스캐폴딩부터 한다.

## 3.1 이번에 만드는 것

- Vite + React(JS) 프로젝트 스캐폴딩 (`CLAUDE.md` 1. 기술 스택대로)
- `MainLayout` + `Header` + `Footer`
- `HomePage` (서울 / 도쿄 대시보드)
- 로그인 상태 관리 (헤더 두 가지 모습을 확인하기 위한 최소 구현)

## 3.2 이번에 만들지 않는 것

- `work.md` 3장의 게시판 기능 전체 (목록 / 상세 / 글쓰기 / 수정 / 삭제)
- 회원가입 검증 규칙, 페이지네이션, 시드 데이터
- `게시판`, `소개`, `문의사항`, `profile` 은 **자리만 잡아 두고**
  "준비 중" 안내만 표시한다. 다음 작업에서 채운다


# 4. 파일 계획

```
board/
  doc/
    header-menu.md               이 문서
  src/
    App.jsx                      MainLayout 만 렌더
    layouts/
      MainLayout.jsx             activeMenu / authView 상태, Header+Content+Footer
      MainLayout.module.css
    components/
      Header.jsx                 메뉴 + 로그인 영역 (상태 없음, props 로만 동작)
      Header.module.css
      UserMenu.jsx               사용자 이름 + 드롭다운 (열림 상태만 자체 보유)
      UserMenu.module.css
      Footer.jsx                 소개 / 문의사항
      Footer.module.css
    pages/
      HomePage.jsx               서울 / 도쿄 대시보드
      HomePage.module.css
      BoardPage.jsx              준비 중
      AuthPage.jsx               로그인 (최소 구현)
      AuthPage.module.css
      PlaceholderPage.jsx        소개 / 문의사항 / profile 공통 "준비 중"
    api/
      weatherApi.js              Open-Meteo 호출만
    service/
      weatherService.js          응답 → 화면용 데이터로 가공
      authService.js             로그인 / 로그아웃 / localStorage
    store/
      authContext.js             createContext 만
      AuthProvider.jsx           로그인 상태 보관
      useAuth.js                 useAuth()
    constants/
      menus.js                   MENUS / FOOTER_MENUS
      cities.js                  서울 / 도쿄 좌표·타임존
    utils/
      datetime.js                타임존별 날짜·시간 포맷 (순수 함수)
```

- 레이어 규칙은 `CLAUDE.md` 2.1 그대로: `layouts` → `pages` → `service` → `api`
- `pages` 에서 `api` 를 직접 import 하지 않는다


# 5. 디자인 명세

| 항목 | 값 |
|---|---|
| 헤더 높이 | `56px` |
| 헤더 배경 | 회색 그라데이션 (`#6b7280` → `#374151`) |
| 메뉴 글자색 | 흰색 |
| 폰트 크기 | `20px` |
| 폰트 | 고딕체 (`Malgun Gothic`, `Apple SD Gothic Neo`, sans-serif) |
| 사용자 아이콘 | 사람 모양 인라인 SVG (이름 앞) |
| 활성 메뉴 | 밑줄 + 글자 진하게 |

- 색상은 `Header.module.css` 상단 CSS 변수로 관리한다
- 나머지 화면 톤은 `work.md` 5. UI 를 따른다 (전체 폭 960px 중앙 정렬, 담백한 관리자 톤)


# 6. 완료 조건

- `npm run dev` 로 실행되고 메인에 서울 / 도쿄 카드가 보인다
- 시간이 1초마다 갱신된다
- 온도가 표시된다 (네트워크 실패 시 실패 문구)
- 헤더 메뉴를 눌러도 **주소가 바뀌지 않고** 컨텐츠만 바뀐다
- 비로그인 → `로그인` 버튼, 로그인 → `사람아이콘 + 이름 ▾` + 드롭다운
- `npm run lint` 통과
