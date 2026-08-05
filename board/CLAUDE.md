# CLAUDE.md

- 이 문서의 내용을 반드시 지킬 것
- 문서의 내용을 무시하거나 실행하지 않으면 안 됨
- 모든 작업은 한글로 소통하고 작성한다
- 요구사항 명세는 `work.md` 에 있다. 기능 작업 전 반드시 `work.md` 를 먼저 읽는다


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
- `react-router` 사용 (v7부터 `react-router-dom` 이 `react-router` 로 통합됨 —
  `react-router-dom` 을 따로 설치하지 않는다)

## 1.5 서버 통신
- axios 를 이용한 서버 통신
- 이 예제는 **별도 백엔드 서버를 두지 않는다**. `src/api/mockAdapter.js` 가
  localStorage 를 저장소로 쓰는 가짜 서버 역할을 하고, axios 인스턴스의
  adapter 를 교체하는 방식으로 붙인다
- 화면·서비스 코드는 진짜 REST API 를 쓰는 것처럼 작성한다.
  나중에 실제 백엔드가 생기면 `mockAdapter` 연결만 끊으면 동작하도록 한다

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
  styles/       공통 스타일
```

## 2.1 레이어 규칙 (중요)

- **단방향 의존만 허용**: `pages` → `service` → `api`
- `pages` 에서 `api` 를 직접 import 하지 않는다. 반드시 `service` 를 거친다
- `api` 는 HTTP 요청/응답만 다룬다. 조건 분기·권한 판단을 넣지 않는다
- `service` 는 React 를 import 하지 않는다 (훅·JSX 금지, 순수 JS 함수로)
- `utils` 는 어떤 레이어도 import 하지 않는다


# 3. 도메인 규칙

## 3.1 인증
- 로그인 성공 시 `authService` 가 토큰과 사용자 정보를 localStorage 에 저장한다
- 로그인 상태는 `store/AuthContext.jsx` 한 곳에서만 관리한다.
  컴포넌트가 localStorage 를 직접 읽지 않는다
- 비밀번호는 화면·콘솔·localStorage 어디에도 평문으로 남기지 않는다.
  목 서버에서도 해시(간이 해시로 충분)만 저장한다
- 보호가 필요한 라우트는 `components/RequireAuth.jsx` 로 감싼다

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
