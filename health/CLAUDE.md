# CLAUDE.md

- 이 문서의 내용을 반드시 지킬 것
- 문서의 내용을 무시하거나 실행하지 않으면 안 됨
- 모든 작업은 한글로 소통하고 작성한다
- 요구사항 명세는 `work.md` 에 있다. 기능 작업 전 반드시 `work.md` 를 먼저 읽는다
- 개별 작업 프롬프트는 `doc/` 에 있다. 새 작업은 `doc/<작업이름>.md` 를 먼저 쓰고
  그 문서를 보고 구현한다
  - `doc/header-menu.md` : 헤더·푸터 메뉴 + 메인 대시보드
  - `doc/board.md` : 게시판 기능
  - `doc/health-analysis.md` : 건강분석 입력·계산
  - `doc/design-system.md` : 디자인 토큰·타이포·모션·그래프
  - `doc/section-nav.md` : 대시보드 섹션 확장 + 우측 아이콘 독
  - `doc/nutrient-radar.md` : 영양소 오각형 레이더 + 순회 재생


# 1. 기술 스택

- 개발에 필요한 라이브러리는 설치할 것

## 1.1 사용 언어
- React with JavaScript (**TypeScript 사용 금지**)

## 1.2 빌드 도구
- Vite

## 1.3 CSS 처리
- 기본적으로 CSS Module 사용 (`*.module.css`)
- Tailwind CSS 최신 버전(v4, `@tailwindcss/vite` 플러그인) 병행 사용
- 역할 분담: 레이아웃·간격·반응형은 Tailwind 유틸리티, 컴포넌트 고유 스타일은 CSS Module
- `tailwind.config.js` 는 v4 에서 필수가 아니므로 만들지 않는다

## 1.4 라우팅
- **메뉴 전환에 라우터를 쓰지 않는다.** 화면 전환은 전부 상태(state)로 처리한다.
  자세한 규칙은 `4. 레이아웃 구조` 참고
- `react-router` 를 설치하지 않는다. 나중에 URL 라우팅이 꼭 필요해지면 그때 물어본다

## 1.5 서버 통신
- axios 를 이용한 서버 통신. 공용 인스턴스는 `src/api/client.js`
- **별도 백엔드 서버를 두지 않는다.** 100% 클라이언트 SPA 로 만든다
- 게시판·건강기록 등 저장이 필요한 데이터는 **localStorage** 를 저장소로 쓴다.
  화면·서비스 코드는 진짜 REST API 를 쓰는 것처럼 작성해, 나중에 실제 백엔드가
  생기면 `api` 레이어만 교체하면 동작하도록 한다

## 1.6 환경 변수
- API 키 등은 `.env` 의 `VITE_` 접두사 변수로 읽는다
- **`.env` 는 커밋하지 않는다.** 형식만 `.env.example` 로 공유한다
- 키 값은 개발자가 직접 채운다. 에이전트가 키를 만들어 넣지 않는다
- 키가 없을 때 화면이 깨지지 않고 안내 문구가 나오도록 만든다

## 1.7 코드 검사
- oxlint (`npm run lint`). 작업 후 반드시 통과시킨다


# 2. 무료 API 정책 (중요)

이 프로젝트는 **전 구간을 무료로 운영한다.** 유료 API·유료 서비스·백엔드 서버를
에이전트 임의 판단으로 추가하지 않는다. 필요하다고 판단되면 먼저 물어본다.

| 용도 | 채택 | 비용 |
|---|---|---|
| 인바디/혈액검사 파일 분석 | Tesseract.js (브라우저 내 OCR) | 무료·무제한 |
| 위치 파악 | 브라우저 Geolocation API → 실패 시 IP 기반 폴백 | 무료 |
| 헬스장 검색·지도 | 카카오맵 JavaScript SDK | 무료 (일 10만건) |
| 영양성분 데이터 | 로컬 JSON 큐레이션 (기본) | 무료 |
| 음식 검색 보강 | 식약처 식품영양성분 DB OpenAPI | 무료 (키 발급) |
| 체중 추이 그래프 | Recharts | 무료 |
| 저장소 | localStorage | 무료 |

- OCR 은 **반드시 브라우저 안에서** 수행한다. 인바디·혈액검사 파일을 외부 서버로
  업로드하지 않는다 (`5. 의료 면책 및 개인정보` 참고)
- 라이브러리는 해당 기능을 구현하는 단계에서 설치한다. 미리 설치해 두지 않는다


# 3. 폴더 구조

```
src/
  api/          서버 통신 모듈 (axios 요청/응답만 담당)
  service/      비지니스 로직 (BMI/BMR 계산, 영양소 판정, 유효성 검사)
  store/        전역 상태 (React Context)
  layouts/      레이아웃 컴포넌트 (MainLayout)
  pages/        메뉴 하나에 대응하는 컨텐츠 컴포넌트
  components/   재사용 UI 컴포넌트 (Header 등)
  constants/    메뉴 목록 같은 고정값
  utils/        순수 함수 유틸
  styles/       공통 스타일
  assets/       정적 데이터(JSON)·이미지
```

## 3.1 레이어 규칙 (중요)

- **단방향 의존만 허용**: `layouts` → `pages` → `service` → `api`
- `pages` 에서 `api` 를 직접 import 하지 않는다. 반드시 `service` 를 거친다
- `api` 는 HTTP 요청/응답만 다룬다. 조건 분기·판정 로직을 넣지 않는다
- `service` 는 React 를 import 하지 않는다 (훅·JSX 금지, 순수 JS 함수로).
  건강 계산식은 전부 여기에 두고 화면에서는 결과만 받아 쓴다
- `utils` 는 어떤 레이어도 import 하지 않는다
- `components` 는 `pages` / `layouts` 를 import 하지 않는다 (위로 거슬러 올라가지 않는다)


# 4. 레이아웃 구조

## 4.1 전체 구성

앱의 모든 화면은 `MainLayout` **하나 안에서** 그려진다.
MainLayout 은 Header / 컨텐츠 / Footer 3단 구조다.

```
App
└─ AuthProvider
   └─ MainLayout
      ├─ Header      상단 메뉴 (Home 로고 / 게시판 / 로그인 영역)
      ├─ Content     선택된 메뉴의 컨텐츠가 그려지는 자리
      └─ Footer      하단 메뉴 (소개 / 문의사항)
```

- `App.jsx` 는 `AuthProvider` 와 `MainLayout` 만 렌더한다. App 에 화면 로직을 넣지 않는다
- Header / Footer 는 항상 화면에 남는다. 메뉴를 바꿔도 언마운트되지 않는다
- 폭 제한은 각 화면이 스스로 정한다. `MainLayout` 의 컨텐츠 영역은 폭을 제한하지 않는다

## 4.2 메뉴 정의

- 메뉴 목록은 `src/constants/menus.js` **한 곳에서만** 관리한다
- 메뉴를 늘릴 때 이 배열에 항목만 추가하면 되도록 만든다

```js
// src/constants/menus.js
export const MENUS = [
  { key: 'home',  label: 'Home', isLogo: true },
  { key: 'board', label: '게시판' },
]

export const FOOTER_MENUS = [
  { key: 'about',   label: '소개' },
  { key: 'contact', label: '문의사항' },
]

export const PROFILE_MENU_KEY = 'profile'
export const DEFAULT_MENU_KEY = 'home'
```

- `Home` 은 로고 겸 메뉴다. `isLogo` 로 표시만 다르게 하고 동작은 일반 메뉴와 같다
- `profile` 은 메뉴 배열에 없다. 사용자 드롭다운에서만 진입한다

## 4.3 메뉴 선택 동작 (중요)

- 메뉴를 클릭해도 **페이지 이동을 하지 않는다.**
  URL 은 그대로 두고 MainLayout 의 Content 영역만 교체한다
- 선택된 메뉴 상태(`activeMenu`)는 `MainLayout` 이 `useState` 로 들고 있는다.
  기본값은 `DEFAULT_MENU_KEY`(`'home'`) — 앱을 열면 메인 대시보드가 먼저 보인다
- 로그인은 메뉴가 아니다. `MainLayout` 이 `authView`(`null | 'login'`)를 따로 갖고,
  값이 있으면 컨텐츠 영역에 인증 화면을 대신 그린다. 닫을 때 `authView` 만 `null` 로
  되돌리면 `activeMenu` 는 그대로이므로 보던 화면으로 돌아온다
- `Header` 는 상태를 갖지 않는다. `menus`, `activeMenu`, `onSelectMenu` 를
  props 로 받아 그리기와 클릭 전달만 한다 (**상태는 위, 표현은 아래**).
  단 `UserMenu` 의 드롭다운 열림 여부는 순수 표현 상태라 `UserMenu` 가 자체 보유한다
- 메뉴 버튼은 `<a href>` 가 아니라 **`<button>`** 으로 만든다.
  링크를 쓰면 새로고침이 일어나 "페이지 이동 없음" 규칙이 깨진다
- 현재 선택된 메뉴는 Header 에서 활성 스타일로 표시한다

```jsx
// src/layouts/MainLayout.jsx 의 뼈대
const [activeMenu, setActiveMenu] = useState(DEFAULT_MENU_KEY)
const [authView, setAuthView] = useState(null)

function renderMenuContent() {
  switch (activeMenu) {
    case 'home':            return <HomePage />
    case 'board':           return <BoardPage />
    case 'about':           return <PlaceholderPage title="소개" />
    case 'contact':         return <PlaceholderPage title="문의사항" />
    case PROFILE_MENU_KEY:  return <PlaceholderPage title="profile" />
    default:                return <HomePage />
  }
}

return (
  <div className={styles.layout}>
    <Header
      menus={MENUS}
      activeMenu={authView ? null : activeMenu}
      onSelectMenu={selectMenu}
      onOpenAuth={setAuthView}
      onSelectProfile={() => selectMenu(PROFILE_MENU_KEY)}
    />
    <main className={styles.content}>
      {authView ? <AuthPage onClose={() => setAuthView(null)} /> : renderMenuContent()}
    </main>
    <Footer menus={FOOTER_MENUS} activeMenu={activeMenu} onSelectMenu={selectMenu} />
  </div>
)
```

- 메뉴가 늘어나면 `MENUS` 항목 하나 + Content 분기 한 줄만 추가한다

## 4.4 컨텐츠 내부 화면 전환

- 컨텐츠 안에서의 화면 전환도 페이지 이동이 아니다. 각 페이지가 자기 상태로 처리한다
  - `BoardPage` : `view` (`'list' | 'detail' | 'write' | 'edit'`) + `selectedPostId`
  - `HomePage` 의 건강분석 카드 : `step` (`'input' | 'result'`)
- 즉 화면 전환 책임은 딱 두 곳이다
  - `MainLayout` : 메뉴 사이 전환
  - 각 페이지 컴포넌트 : 자기 내부 화면 전환
- 목록/상세/글쓰기 각각의 UI 는 페이지 아래 별도 컴포넌트로 나누고,
  전환 함수(`goList`, `goDetail(id)` 등)를 props 로 내려준다.
  **하위 컴포넌트가 스스로 화면을 바꾸지 않는다**

## 4.5 파일 배치

```
src/
  App.jsx                        AuthProvider + MainLayout 만 렌더
  layouts/
    MainLayout.jsx               activeMenu / authView 상태 + Header/Content/Footer 배치
    MainLayout.module.css
  components/
    Header.jsx                   상단 메뉴 + 로그인 영역 (상태 없음, props 로만 동작)
    Header.module.css
    UserMenu.jsx                 사용자 이름 + profile/logout 드롭다운
    UserMenu.module.css
    Footer.jsx                   하단 메뉴 (소개 / 문의사항)
    Footer.module.css
  pages/
    HomePage.jsx                 메인 대시보드 (건강 카드 5장)
    HomePage.module.css
    BoardPage.jsx                게시판 진입점 (내부 화면 전환 담당)
    BoardPage.module.css
    AuthPage.jsx                 로그인 화면 (authView 로 전환)
    AuthPage.module.css
    PlaceholderPage.jsx          아직 안 만든 화면 공통 "준비 중"
    PlaceholderPage.module.css
  service/
    authService.js               로그인 / 로그아웃 / localStorage
  store/
    authContext.js               createContext 만
    AuthProvider.jsx             로그인 상태 보관
    useAuth.js                   useAuth()
  constants/
    menus.js                     MENUS / FOOTER_MENUS / PROFILE_MENU_KEY
  api/
    client.js                    공용 axios 인스턴스
```

## 4.6 네이밍

- 레이아웃·페이지·컴포넌트: PascalCase (`MainLayout.jsx`, `BoardPage.jsx`)
- 스타일: 같은 이름 + `.module.css`
- constants / service / api / utils: camelCase (`menus.js`, `healthService.js`)


# 5. 의료 면책 및 개인정보 규칙 (필수)

이 사이트는 **의료기기도 진단 서비스도 아니다.** 아래를 반드시 지킨다.

- 분석 결과는 **진단이 아니라 일반 참고 정보**다. "진단", "처방", "치료" 같은
  단정적 표현을 쓰지 않는다. "~로 보입니다", "~참고하세요" 로 쓴다
- 건강 분석 결과가 표시되는 **모든 화면에 면책 문구를 노출**한다
  > 본 결과는 일반적인 참고 정보이며 의학적 진단이 아닙니다.
  > 건강 이상이 의심되면 반드시 의료 전문가와 상담하세요.
- 혈액검사·인바디 등 민감 정보는 **브라우저 밖으로 전송하지 않는다.**
  OCR 은 클라이언트에서만 수행하고, 외부 API 로 업로드하지 않는다
- 위치 정보는 헬스장 검색에만 쓰고 저장하지 않는다
- 특정 질병을 단정하거나, 약 복용·중단을 권하는 문구를 만들지 않는다


# 6. 작업 규칙

- 요청한 내용 외 임의 판단 금지
- 에이전트 임의 판단으로 인한 코드 작성 금지
- 이미 작성된 코드의 수정을 최소화
- 수정이 필요할 경우 반드시 물어볼 것
- 새 파일을 만들기 전에 기존 파일에 넣을 수 있는지 먼저 확인할 것
- 작업 후 `npm run lint` 를 통과시킬 것


# 7. 디자인

디자인 시스템은 **적용 완료**되었다. 상세 명세는 `doc/design-system.md` 를 본다.

## 7.1 절대 규칙

- **컴포넌트 CSS 에 리터럴 색을 쓰지 않는다.** 색은 전부 `src/index.css` 의
  토큰(`var(--ink)`, `var(--panel)`, `var(--ok)` …)을 참조한다
- 새 색이 필요하면 토큰을 먼저 추가하고, **라이트·다크 두 값을 함께** 정의한다
- 색만으로 상태를 전달하지 않는다. 문구나 아이콘을 반드시 함께 둔다
- 모션은 정보를 대체하지 않는다. **모션이 꺼져도 모든 수치가 보여야 한다**
- **"준비 중" 은 아직 안 만든 기능에만 쓴다.** 만들어 뒀지만 사용자 입력이 있어야
  채워지는 카드에는 `입력 필요` 를 쓰고 입력 화면으로 가는 버튼을 함께 둔다.
  둘을 같은 문구로 두면 기능이 없는 줄 오해한다 (실제로 그렇게 보고되었다)

## 7.2 기준값

| 항목 | 값 |
|---|---|
| 폰트 | `Pretendard Variable` (`--font-gothic`), 숫자는 `tabular-nums` |
| 헤더 높이 | `56px` (`--header-h`) |
| 헤더 메뉴 | `20px` |
| 본문 | `16px` / `line-height 1.68` |
| 콘텐츠 폭 | `960px` (`--content-max`) |
| 이징 | `--ease` 하나로 통일 |

- 헤더 배경은 `Header.module.css` 상단의 `--header-bg` 한 줄로 바꿀 수 있다.
  회색 그라데이션(`doc/header-menu.md` 원안)으로 되돌리는 값이 주석에 남아 있다

## 7.3 모션

- 스크롤 진입 연출은 `components/Reveal.jsx` 를 쓴다. 직접 IntersectionObserver 를
  만들지 않는다
- 숫자는 `components/CountUp.jsx` 로 세어 올린다
- 화면 전환으로 요소가 **뷰포트 위쪽에 마운트되면** 관찰이 발화하지 않는다.
  `Reveal` 이 마운트 시점 위치를 먼저 확인해 처리하고 있으니 이 로직을 지운다면
  같은 문제가 다시 생긴다는 점을 기억한다
