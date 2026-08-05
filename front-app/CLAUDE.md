# CLAUDE.md

- 이 문서의 내용을 반드시 지킬 것
- 문서의 내용을 무시하거나 실행하지 않으면 안 됨
- 모든 작업은 한글로 소통하고 작성한다
- 기능 요구사항은 `work.md` 에 있다. 기능 작업 전 반드시 `work.md` 를 먼저 읽는다


# 0. 이 프로젝트

- **로그인 기능이 있는 게시판 예제**
- `work.md` 명세대로 구현이 끝난 상태다 (회원가입/로그인/목록/작성/수정/삭제)
- Vite 기본 템플릿 잔재(`App.css`, 템플릿 이미지들)는 모두 제거했다.
  `public/favicon.svg` 는 `index.html` 이 파비콘으로 쓰므로 남겨둔 것이다


# 1. 기술 스택

- 개발에 필요한 라이브러리는 설치할 것

## 1.1 사용 언어
- React with JavaScript (TypeScript 사용 금지)

## 1.2 빌드 도구
- Vite (`npm run dev`, 포트 3000)

## 1.3 CSS 처리
- 기본적으로 CSS Module 사용 (`*.module.css`)
- Tailwind CSS 최신 버전(v4, `@tailwindcss/vite` 플러그인) 병행 사용

## 1.4 라우팅
- `react-router-dom` 사용

## 1.5 서버 통신
- axios 를 이용한 서버 통신. 인스턴스는 `src/api/client.js` 하나만 쓴다
- 이 예제는 **별도 백엔드 서버를 두지 않는다**. `src/api/mockAdapter.js` 가
  localStorage 를 저장소로 쓰는 가짜 서버 역할을 하고,
  `client.js` 의 axios adapter 를 교체하는 방식으로 붙인다
- 화면·서비스 코드는 진짜 REST API 를 쓰는 것처럼 작성한다.
  나중에 실제 백엔드가 생기면 `mockAdapter` 연결만 끊으면 동작해야 한다
- API base URL 은 `.env` 의 `VITE_API_BASE_URL` 을 쓴다. `.env` 는 gitignore 대상

## 1.6 코드 검사
- oxlint (`npm run lint`)


# 2. 폴더 구조

```
src/
  api/          서버 통신 모듈 (axios 요청/응답만 담당)
  service/      비지니스 로직 (권한 판정, 페이징 계산, 유효성 검사)
  store/        전역 상태 (로그인 사용자 Context)
  pages/        라우트 단위 view 컴포넌트
  components/   재사용 UI 컴포넌트
  utils/        순수 함수 유틸
```

## 2.1 레이어 규칙 (중요)

- **단방향 의존만 허용**: `pages` → `service` → `api`
- `pages` 에서 `api` 를 직접 import 하지 않는다. 반드시 `service` 를 거친다
- `api` 는 HTTP 요청/응답만 다룬다. 조건 분기·권한 판단을 넣지 않는다
- `service` 는 React 를 import 하지 않는다 (훅·JSX 금지, 순수 JS 함수로)
- `utils` 는 다른 레이어를 import 하지 않는다
- `components` 는 `service` 까지만 접근한다

## 2.2 파일 네이밍

- 컴포넌트·페이지: PascalCase (`PostListPage.jsx`)
- 스타일: 컴포넌트와 같은 이름 + `.module.css` (`PostListPage.module.css`)
- service / api / utils: camelCase (`postService.js`, `postApi.js`)


# 3. 도메인 규칙

## 3.1 인증
- 로그인 성공 시 `authService` 가 토큰과 사용자 정보를 localStorage 에 저장한다
- 로그인 상태는 `src/store/AuthProvider.jsx` 한 곳에서만 관리하고,
  화면은 `src/store/useAuth.js` 의 `useAuth()` 로만 접근한다.
  컴포넌트가 localStorage 를 직접 읽지 않는다
  (context 객체는 `src/store/authContext.js` 에 따로 둔다 —
  한 파일에서 컴포넌트와 비컴포넌트를 같이 export 하면 oxlint 가 경고한다)
- 비밀번호는 화면·콘솔·localStorage 어디에도 평문으로 남기지 않는다.
  목 서버에서도 해시(예제이므로 간이 해시로 충분)만 저장한다
- 보호가 필요한 라우트는 `src/components/RequireAuth.jsx` 로 감싼다

## 3.2 게시판
- 게시글 작성은 로그인 사용자만 가능하다
- 수정·삭제는 **작성자 본인만** 가능하다. 이 판정은 `postService` 에서 하고,
  화면에서는 그 결과(boolean)만 받아 버튼 노출을 결정한다
- 목록은 최신순 정렬 + 페이지네이션을 기본으로 한다


# 4. 작업 규칙

- 요청한 내용 외 임의 판단 금지
- 에이전트 임의 판단으로 인한 코드 작성 금지
- 이미 작성된 코드의 수정을 최소화
- 수정이 필요할 경우 반드시 물어볼 것
- 새 파일을 만들기 전에 기존 파일에 넣을 수 있는지 먼저 확인할 것
- 작업 후 `npm run lint` 를 통과시킬 것


# 5. 스킬

`.claude/skills/` 에 이 프로젝트 전용 스킬이 있다.

- `run-board` : 개발 서버 실행 + 브라우저로 화면 확인 / 스크린샷
- `add-feature` : 게시판 기능을 레이어 규칙에 맞게 추가하는 절차
