# header-menu.md

> 헤더/푸터 메뉴 + 메인 대시보드 작업 프롬프트
> 작성일: 2026-08-07
> 대상 프로젝트: `health/`


# 1. 요청 원문

```
메인페이지는 중앙에 건강, 필요한 영양소, 음식 추천, 생활 습관 팁, 주변 헬스장 을
대시보드 형태로 나오도록 해.

메뉴 만들기)
header에 메뉴를 만든다, 메뉴 좌측에 Home 로고, 게시판 메뉴를 만든다
하단에는 소개 문의사항 메뉴를 만든다
우측에는 비로그인 시에는 로그인 텍스트 버튼,
로그인 시에는 사용자 이름이 출력되고 드랍다운으로 profile, logout 메뉴를 노출

디자인)
메뉴는 배경색은 회색 그라데이션, 메뉴명은 흰색, 폰트온 20px 고딕체,
로그인 시 사용자 이름 앞에 사람 아이콘 생성, height는 56px 정도.
```


# 2. 해석 및 결정 사항

원문에 명확하지 않은 부분이 있어 아래와 같이 정하고 작업한다.

## 2.1 "하단에는 소개 문의사항 메뉴"

- 헤더 높이가 56px 로 고정이라 2단 메뉴가 들어갈 수 없다
- 따라서 `소개` / `문의사항` 은 **페이지 하단 Footer** 로 해석한다
- Footer 도 헤더와 같은 방식(상태 전환)으로 컨텐츠를 바꾼다

## 2.2 기존 메뉴 구성 변경

1단계에서 만든 메뉴(`게시판 / 건강분석 / 헬스장찾기 / 내기록`)를 이번 요청에 맞춰
아래처럼 바꾼다. `건강분석`·`헬스장찾기`·`내기록`은 **메인 대시보드 카드로 흡수**된다.

| 위치 | 항목 | 동작 |
|---|---|---|
| 헤더 좌측 | `Home` 로고 | `activeMenu = 'home'` (메인 대시보드) |
| 헤더 좌측 | `게시판` | `activeMenu = 'board'` |
| 헤더 우측 | `로그인` (비로그인 시) | `authView = 'login'` |
| 헤더 우측 | `사람아이콘 + 사용자이름 ▾` (로그인 시) | 드롭다운: `profile`, `logout` |
| 푸터 | `소개` | `activeMenu = 'about'` |
| 푸터 | `문의사항` | `activeMenu = 'contact'` |

- 기본 진입 화면은 `home` 이다 (`CLAUDE.md` 4.2 기본값 `'board'` → `'home'` 으로 변경)
- 메뉴를 눌러도 **페이지 이동은 없다.** `MainLayout` 의 컨텐츠 영역만 교체한다
  (`CLAUDE.md` 4.3 규칙 그대로)
- `profile` 은 메뉴 배열에 없다. 사용자 드롭다운에서만 진입한다

## 2.3 드롭다운 동작

- 사용자 이름 버튼을 누르면 열리고, 다시 누르면 닫힌다
- 바깥 영역 클릭 / `Esc` 키로 닫힌다
- `profile` → `activeMenu = 'profile'`, `logout` → 로그아웃 후 드롭다운 닫기
- 로그아웃해도 보고 있던 화면은 유지한다

## 2.4 로그인 (범위 주의)

- 이번 작업은 **헤더의 로그인/비로그인 두 모습을 확인하기 위한 최소 구현**이다
- 아이디·비밀번호를 받아 localStorage 에 저장하는 수준까지만 만든다.
  회원가입·검증 규칙·실패 처리는 다음 작업에서 채운다
- 비밀번호는 화면·콘솔·localStorage 어디에도 평문으로 남기지 않는다 (간이 해시만 저장)

## 2.5 메인 대시보드

화면 중앙에 카드 5장을 격자로 배치한다 (좁은 화면에서는 세로 1열).

| 카드 | 이번 작업에서의 상태 |
|---|---|
| 건강 요약 | 건강정보 입력 유도 + "준비 중" (분석 엔진은 `work.md` 단계 3) |
| 필요한 영양소 | "준비 중" (단계 5) |
| 음식 추천 | "준비 중" (단계 5) |
| 생활 습관 팁 | **실제 내용 표시.** 사용자 데이터가 없어도 되는 일반 수칙이라 지금 채운다 |
| 주변 헬스장 | "준비 중" (단계 6, 카카오맵 키 필요) |

- 분석 결과가 없는 상태에서 **건강 수치를 지어내지 않는다.** 빈 상태를 정직하게 보여준다
- 대시보드 하단에 의료 면책 문구를 노출한다 (`CLAUDE.md` 5장)


# 3. 작업 범위

## 3.1 이번에 만드는 것

- `MainLayout` 에 `Header` + `Content` + `Footer` 배치, `authView` 상태 추가
- `Header` / `UserMenu` / `Footer`
- `HomePage` (건강 대시보드 5카드)
- `AuthPage` (로그인 최소 구현)
- 로그인 상태 관리 (`store/` + `service/authService.js`)

## 3.2 이번에 만들지 않는 것

- 게시판 기능 전체 (목록 / 상세 / 글쓰기 / 수정 / 삭제) — `work.md` 단계 2
- 건강 분석 계산·OCR·영양소 판정·헬스장 검색 — `work.md` 단계 3~7
- 회원가입, 비밀번호 찾기, 로그인 실패 상세 처리
- `게시판` / `소개` / `문의사항` / `profile` 은 **자리만 잡고** "준비 중" 표시
- 전체 디자인 확정 — 이번엔 **헤더/푸터 명세만** 적용한다 (`CLAUDE.md` 7장)


# 4. 파일 계획

```
health/
  doc/
    header-menu.md               이 문서
  src/
    App.jsx                      AuthProvider + MainLayout
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
      HomePage.jsx               건강 대시보드 (카드 5장)
      HomePage.module.css
      BoardPage.jsx              준비 중 (기존)
      AuthPage.jsx               로그인 (최소 구현)
      AuthPage.module.css
      PlaceholderPage.jsx        소개 / 문의사항 / profile 공통 "준비 중" (기존)
    service/
      authService.js             로그인 / 로그아웃 / localStorage
    store/
      authContext.js             createContext 만
      AuthProvider.jsx           로그인 상태 보관
      useAuth.js                 useAuth()
    constants/
      menus.js                   MENUS / FOOTER_MENUS / PROFILE_MENU_KEY
```

- 레이어 규칙은 `CLAUDE.md` 3.1 그대로: `layouts` → `pages` → `service` → `api`
- `service` 는 React 를 import 하지 않는다


# 5. 디자인 명세

| 항목 | 값 |
|---|---|
| 헤더 높이 | `56px` |
| 헤더 배경 | 회색 그라데이션 (`#6b7280` → `#374151`) |
| 메뉴 글자색 | 흰색 |
| 폰트 크기 | `20px` |
| 폰트 | 고딕체 (`Malgun Gothic`, `Apple SD Gothic Neo`, sans-serif) |
| 사용자 아이콘 | 사람 모양 인라인 SVG (이름 앞, 22px) |
| 활성 메뉴 | 밑줄 + 글자 진하게 |
| 푸터 | 헤더와 같은 회색 계열, 글자 크기는 작게 |

- 색상·높이는 `Header.module.css` 상단 CSS 변수로 관리한다 (한 줄 교체로 전환 가능)
- 고딕체는 `index.css` 의 `--font-gothic` 전역 변수로 둔다
- **대시보드 카드 등 나머지 화면 디자인은 마지막 단계에서 입힌다.** 지금은 구조만 잡는다


# 6. 완료 조건

- `npm run dev` 로 실행되고 메인에 카드 5장이 보인다
- 헤더가 56px, 회색 그라데이션, 흰색 20px 고딕체로 보인다
- 헤더/푸터 메뉴를 눌러도 **주소가 바뀌지 않고** 컨텐츠만 바뀐다
- 비로그인 → `로그인` 버튼 / 로그인 → `사람아이콘 + 이름 ▾` + 드롭다운
- 드롭다운이 바깥 클릭·`Esc` 로 닫힌다
- `profile` 진입, `logout` 후 보던 화면 유지가 동작한다
- `npm run lint` 통과
