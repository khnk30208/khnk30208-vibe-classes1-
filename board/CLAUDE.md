# CLAUDE.md

- 이 문서의 내용을 반드시 지킬 것
- 문서의 내용을 무시하거나 실행하지 않으면 안 됨
- 모든 작업은 한글로 소통하고 작성한다
- 요구사항 명세는 `work.md` 에 있다. 기능 작업 전 반드시 `work.md` 를 먼저 읽는다
- 개별 작업 프롬프트는 `doc/` 에 있다. 새 작업은 `doc/<작업이름>.md` 를 먼저 쓰고
  그 문서를 보고 구현한다
  - `doc/header-menu.md` : 헤더·푸터 메뉴
  - `doc/mainPage.md` : 대문 페이지 (서울/도쿄 날씨 대시보드)


# 1. 기술 스택

- 개발에 필요한 라이브러리는 설치할 것

## 1.1 사용 언어
- React with JavaScript (TypeScript 사용 금지)

## 1.2 빌드 도구
- Vite

## 1.3 CSS 처리
- 기본적으로 CSS Module 사용 (`*.module.css`)
- Tailwind CSS 최신 버전(v4, `@tailwindcss/vite` 플러그인) 병행 사용

## 1.4 라우팅
- **메뉴 전환에 라우터를 쓰지 않는다.** 화면 전환은 전부 상태(state)로 처리한다.
  자세한 규칙은 `3. 레이아웃 구조` 참고
- 나중에 URL 라우팅이 필요해지면 `react-router` 를 쓴다
  (v7부터 `react-router-dom` 이 `react-router` 로 통합됨 —
  `react-router-dom` 을 따로 설치하지 않는다)

## 1.5 서버 통신
- axios 를 이용한 서버 통신
- 게시판·인증은 **별도 백엔드 서버를 두지 않는다**. `src/api/mockAdapter.js` 가
  localStorage 를 저장소로 쓰는 가짜 서버 역할을 하고, axios 인스턴스의
  adapter 를 교체하는 방식으로 붙인다
- 화면·서비스 코드는 진짜 REST API 를 쓰는 것처럼 작성한다.
  나중에 실제 백엔드가 생기면 `mockAdapter` 연결만 끊으면 동작하도록 한다
- 날씨는 예외로 **외부 API(OpenWeatherMap)를 직접 호출**한다.
  전용 axios 인스턴스를 `src/api/weatherApi.js` 안에 두고 목 adapter 를 붙이지 않는다

## 1.6 환경 변수
- API 키 등은 `.env` 의 `VITE_` 접두사 변수로 읽는다 (`VITE_OPENWEATHER_API_KEY`)
- **`.env` 는 커밋하지 않는다.** 형식만 `.env.example` 로 공유한다
- 키 값은 개발자가 직접 채운다. 에이전트가 키를 만들어 넣지 않는다
- 키가 없을 때 화면이 깨지지 않고 안내 문구가 나오도록 만든다

## 1.7 코드 검사
- oxlint (`npm run lint`)


# 2. 폴더 구조

```
src/
  api/          서버 통신 모듈 (axios 요청/응답만 담당)
  service/      비지니스 로직 (권한 판정, 페이징 계산, 유효성 검사)
  store/        전역 상태 (로그인 사용자 Context)
  layouts/      레이아웃 컴포넌트 (MainLayout)
  pages/        메뉴 하나에 대응하는 컨텐츠 컴포넌트
  components/   재사용 UI 컴포넌트 (Header 등)
  constants/    메뉴 목록 같은 고정값
  utils/        순수 함수 유틸
  styles/       공통 스타일
```

## 2.1 레이어 규칙 (중요)

- **단방향 의존만 허용**: `layouts` → `pages` → `service` → `api`
- `pages` 에서 `api` 를 직접 import 하지 않는다. 반드시 `service` 를 거친다
- `api` 는 HTTP 요청/응답만 다룬다. 조건 분기·권한 판단을 넣지 않는다
- `service` 는 React 를 import 하지 않는다 (훅·JSX 금지, 순수 JS 함수로)
- `utils` 는 어떤 레이어도 import 하지 않는다
- `components` 는 `pages` / `layouts` 를 import 하지 않는다 (위로 거슬러 올라가지 않는다)


# 3. 레이아웃 구조

## 3.1 전체 구성

앱의 모든 화면은 `MainLayout` **하나 안에서** 그려진다.
MainLayout 은 위에 Header, 아래에 컨텐츠 영역을 두는 2단 구조다.

```
App
└─ AuthProvider
   └─ MainLayout
      ├─ Header      상단 메뉴 (Home 로고 / 게시판 / 로그인 영역)
      ├─ Content     선택된 메뉴의 컨텐츠가 그려지는 자리
      └─ Footer      하단 메뉴 (소개 / 문의사항)
```

- `App.jsx` 는 `AuthProvider` 와 `MainLayout` 만 렌더한다. App 에 화면 로직을 넣지 않는다
- Header / Footer 는 항상 화면에 남는다. 메뉴를 바꿔도 다시 그려지지 않는다
- 배경·폭 제한은 각 화면이 스스로 정한다. `MainLayout` 의 컨텐츠 영역은
  폭을 제한하지 않는다 (대문의 연두색 배경이 화면 전체를 덮어야 하기 때문)

## 3.2 메뉴 정의

- 메뉴 목록은 `src/constants/menus.js` 한 곳에서만 관리한다
- 메뉴를 늘릴 때 이 배열에 항목만 추가하면 되도록 만든다

```js
// src/constants/menus.js
export const MENUS = [
  { key: 'home', label: 'Home', isLogo: true },
  { key: 'board', label: '게시판' },
]

export const FOOTER_MENUS = [
  { key: 'about', label: '소개' },
  { key: 'contact', label: '문의사항' },
]

export const PROFILE_MENU_KEY = 'profile'
export const DEFAULT_MENU_KEY = 'home'
```

- `profile` 은 메뉴 배열에 없다. 사용자 드롭다운에서만 진입한다

## 3.3 메뉴 선택 동작 (중요)

- 메뉴를 클릭해도 **페이지 이동을 하지 않는다.**
  URL 은 그대로 두고 MainLayout 의 Content 영역만 교체한다
- 선택된 메뉴 상태(`activeMenu`)는 `MainLayout` 이 `useState` 로 들고 있는다.
  기본값은 `DEFAULT_MENU_KEY`(`'home'`) — 앱을 열면 대문 페이지가 먼저 보인다
- 로그인 / 회원가입은 메뉴가 아니다. `MainLayout` 이 `authView`
  (`null | 'login' | 'signup'`) 를 따로 갖고, 값이 있으면 컨텐츠 영역에
  인증 화면을 대신 그린다. 닫을 때 `authView` 만 `null` 로 되돌리면
  `activeMenu` 는 그대로이므로 보던 화면으로 돌아온다
- `Header` 는 상태를 갖지 않는다. `menus`, `activeMenu`, `onSelectMenu` 를
  props 로 받아 그리기와 클릭 전달만 한다 (상태는 위, 표현은 아래)
- 메뉴 버튼은 `<a href>` 가 아니라 `<button>` 으로 만든다.
  링크를 쓰면 새로고침이 일어나 "페이지 이동 없음" 규칙이 깨진다
- 현재 선택된 메뉴는 Header 에서 활성 스타일로 표시한다

```jsx
// src/layouts/MainLayout.jsx 의 뼈대
const [activeMenu, setActiveMenu] = useState('board')
const [authView, setAuthView] = useState(null)

return (
  <div className={styles.layout}>
    <Header
      menus={MENUS}
      activeMenu={activeMenu}
      onSelectMenu={setActiveMenu}
      onOpenAuth={setAuthView}
    />
    <main className={styles.content}>
      {authView
        ? <AuthPage view={authView} onChangeView={setAuthView} onClose={() => setAuthView(null)} />
        : activeMenu === 'board' && <BoardPage />}
    </main>
  </div>
)
```

- 메뉴가 늘어나면 `MENUS` 항목 하나 + Content 분기 한 줄만 추가한다

## 3.4 컨텐츠 내부 화면 전환

- 게시판 안에서의 `목록 → 상세 → 글쓰기 → 수정` 전환도 페이지 이동이 아니다
- `BoardPage` 가 자기 안에서 화면 상태를 갖고 전환한다
  - `view`: `'list' | 'detail' | 'write' | 'edit'`
  - `selectedPostId`: 상세·수정에서 볼 게시글 id
- 즉 화면 전환 책임은 딱 두 곳이다
  - `MainLayout` : 메뉴 사이 전환
  - `BoardPage` : 게시판 내부 화면 전환
- 목록/상세/글쓰기 각각의 UI 는 `BoardPage` 아래 별도 컴포넌트로 나누고,
  전환 함수(`goList`, `goDetail(id)` 등)를 props 로 내려준다.
  하위 컴포넌트가 스스로 화면을 바꾸지 않는다

## 3.5 파일 배치

```
src/
  App.jsx                        AuthProvider + MainLayout 만 렌더
  layouts/
    MainLayout.jsx               activeMenu / authView 상태 + Header/Content/Footer 배치
    MainLayout.module.css
  components/
    Header.jsx                   상단 메뉴 (상태 없음, props 로만 동작)
    Header.module.css
    UserMenu.jsx                 사용자 이름 + profile/logout 드롭다운
    UserMenu.module.css
    Footer.jsx                   하단 메뉴 (소개 / 문의사항)
    Footer.module.css
  pages/
    HomePage.jsx                 대문 페이지 (서울/도쿄 날씨 대시보드)
    HomePage.module.css
    BoardPage.jsx                게시판 컨텐츠 진입점 (내부 화면 전환 담당)
    AuthPage.jsx                 로그인 / 회원가입 화면 (authView 로 전환)
    AuthPage.module.css
    PlaceholderPage.jsx          아직 안 만든 화면 공통 "준비 중"
    PlaceholderPage.module.css
  constants/
    menus.js                     MENUS / FOOTER_MENUS
    cities.js                    대문에 표시할 도시
```

## 3.6 네이밍

- 레이아웃·페이지·컴포넌트: PascalCase (`MainLayout.jsx`, `BoardPage.jsx`)
- 스타일: 같은 이름 + `.module.css`
- constants / service / api / utils: camelCase (`menus.js`, `postService.js`)


# 4. 도메인 규칙

## 4.1 인증
- 로그인 성공 시 `authService` 가 토큰과 사용자 정보를 localStorage 에 저장한다
- 로그인 상태는 `store/AuthContext.jsx` 한 곳에서만 관리한다.
  컴포넌트가 localStorage 를 직접 읽지 않는다
- 비밀번호는 화면·콘솔·localStorage 어디에도 평문으로 남기지 않는다.
  목 서버에서도 해시(간이 해시로 충분)만 저장한다
- 보호가 필요한 라우트는 `components/RequireAuth.jsx` 로 감싼다

## 4.2 게시판
- 게시글 작성은 로그인 사용자만 가능하다
- 수정·삭제는 **작성자 본인만** 가능하다. 이 판정은 `postService` 에서 하고,
  화면에서는 그 결과(boolean)만 받아 버튼 노출을 결정한다
- 목록은 최신순 정렬 + 페이지네이션을 기본으로 한다


# 5. 작업 규칙

- 요청한 내용 외 임의 판단 금지
- 에이전트 임의 판단으로 인한 코드 작성 금지
- 이미 작성된 코드의 수정을 최소화
- 수정이 필요할 경우 반드시 물어볼 것
- 새 파일을 만들기 전에 기존 파일에 넣을 수 있는지 먼저 확인할 것
- 작업 후 `npm run lint` 를 통과시킬 것


# 6. 스킬

`.claude/skills/` 에 이 프로젝트 전용 스킬이 있다.

- `run-board` : 개발 서버 실행 + 브라우저로 화면 확인 / 스크린샷
- `add-feature` : 게시판 기능을 레이어 규칙에 맞게 추가하는 절차
