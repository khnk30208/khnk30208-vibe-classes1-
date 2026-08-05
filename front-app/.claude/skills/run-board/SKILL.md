---
name: run-board
description: front-app 게시판 예제를 실행하고 브라우저로 확인한다. 개발 서버 띄우기, 화면 스크린샷, 로그인→글쓰기 시나리오 확인, 콘솔 에러 확인 요청에 사용.
---

Vite + React 앱이라 별도 빌드 없이 dev 모드로 바로 뜬다.
아래 경로는 모두 저장소 루트(`D:\Git-test\vibe-classes1`) 기준이다.

## 0. 최초 1회 준비

```bash
npm --prefix front-app install
```

`react-router-dom` 이 아직 없으면 같이 설치한다.

```bash
npm --prefix front-app install react-router-dom
```

`.env` 는 `.env.example` 을 복사해 만든다. 목 API 로 동작하므로
`VITE_API_BASE_URL` 은 비워두거나 `/api` 로 둬도 된다.

## 1. 실행

`.claude/launch.json` 에 `front-app` 설정이 있으므로 preview 도구로 띄운다.

- `preview_start` → `{ "name": "front-app" }`
- 브라우저 창이 열리면 `navigate` 로 원하는 경로 이동
  (`http://localhost:3000/posts` 등)

로그를 직접 봐야 하면 `preview_logs` 를 쓴다.

### 포트 3000 이 막혀 있을 때 (자주 발생)

`preview_start` 는 3000 이 다른 프로세스에 잡혀 있으면 그냥 거절한다.
`vite.config.js` 에 `port: 3000` 이 하드코딩돼 있어 autoPort 로도 안 풀린다.
이럴 때는 포트를 지정해 직접 띄우고, `preview_start` 에 URL 을 넘긴다.

```bash
npm --prefix front-app run dev -- --port 3100 --strictPort
```

그 다음 `preview_start` → `{ "url": "http://localhost:3100/posts" }`

`--strictPort` 를 빼면 Vite 가 조용히 3101, 3102... 로 넘어가므로
**포트를 넘겨짚지 말고 로그에 찍힌 값을 읽을 것.**

## 2. 화면 확인

- 구조·텍스트 검증: `read_page` / `get_page_text` (스크린샷보다 정확하고 싸다)
- 눈으로 봐야 하는 레이아웃/스타일 확인: `computer` → `screenshot`.
  단 Browser 패널이 화면에 떠 있지 않으면 프레임을 그리지 않아 타임아웃난다.
  패널을 못 띄우는 상황이면 텍스트 기반 확인으로 대체할 것
- 확인창(`window.confirm`)이 뜨는 동작(삭제 등)은 클릭 전에
  `javascript_tool` 로 `window.confirm = () => true` 를 심어둔다.
  안 그러면 자동으로 취소 처리돼 아무 일도 안 일어난다
- 콘솔 에러: `read_console_messages` → `onlyErrors: true`
- 목 API 요청이 제대로 나가는지: `read_network_requests`

## 3. 기본 확인 시나리오

게시판 기능을 손댄 뒤에는 최소 이 흐름을 확인한다.

1. `/posts` 진입 → 목록 테이블과 페이지네이션이 보이는지
2. 비로그인 상태에서 `/posts/new` 진입 → `/login` 으로 튕기는지
3. 시드 계정으로 로그인 → 헤더에 닉네임이 뜨는지
4. 글쓰기 → 저장 후 상세로 이동하고 목록 최상단에 뜨는지
5. 본인 글 상세에 `수정`/`삭제` 버튼이 보이고, 다른 사람 글에는 안 보이는지
6. 새로고침 후에도 로그인이 유지되는지
7. `read_console_messages` 로 에러 0건 확인

## 4. 정리

```bash
npm --prefix front-app run lint
```

서버 종료는 `preview_stop` (또는 PowerShell 로 띄웠으면 해당 프로세스 종료).

---

## Gotchas

- **`vite.config.js` 의 `server.open: true` 는 진짜 GUI 브라우저 창을 띄운다.**
  preview 도구로 띄워도 별개의 Chrome/Edge 창이 하나 더 열린다.
  그 창은 무시하고 닫아도 되며, 도구가 제어하는 창이 아니다.
- **포트 3000 은 이 PC에서 이미 점유돼 있는 경우가 잦다.** 하드코딩 금지.
- **localStorage 가 상태를 들고 있다.** 시드/로그인 관련 버그를 재현할 때는
  `javascript_tool` 로 `localStorage.clear()` 후 새로고침해서 초기 상태부터 확인한다.
- **`npm --prefix` 없이 실행하면 저장소 루트에서 돌아 실패한다.**
  루트에는 `package.json` 이 없다.

## Troubleshooting

- **흰 화면 + 콘솔에 라우터 관련 에러**: `react-router-dom` 미설치이거나
  `main.jsx` 에 `BrowserRouter` 가 빠진 경우다. 0번 항목부터 확인한다.
- **목록이 항상 비어 있음**: 시드 주입이 안 된 것이다.
  `localStorage` 의 `board:posts` 키를 확인한다. 값이 `[]` 거나 없으면
  시드 로직이 앱 진입 시점에 호출되지 않는 것.
- **로그인은 되는데 새로고침하면 풀림**: `AuthContext` 가 초기 마운트 때
  localStorage 를 복원하지 않는 것이다. 화면 쪽이 아니라 store 를 고친다.
