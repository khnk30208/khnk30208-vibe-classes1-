---
name: run-health
description: health 앱(Vite + React 건강관리 대시보드)을 실행하고 브라우저로 조작·스크린샷한다. health 실행, 화면 확인, 스크린샷, 로그인 플로우 확인을 요청받으면 사용한다.
---

Vite + React 웹앱이라 dev 모드로 바로 띄울 수 있다(별도 빌드 불필요).

스크린샷은 두 가지 경로가 있다.

1. **Browser 패널**(`preview_start` + `computer`) — 대화형 확인에 편하지만,
   **패널이 화면에 표시되어 있지 않으면 스크린샷이 실패한다**
   (`Screenshot timed out: the Browser pane is not displayed`).
   페이지 읽기(`read_page`)·콘솔(`read_console_messages`)은 패널이 가려져 있어도 동작한다.
2. **이 스킬의 Playwright 드라이버** — 헤드리스라 **패널과 무관하게 항상 PNG 를 남긴다.**
   스크린샷이 목적이면 이쪽을 쓴다.

아래 경로는 모두 `health/` 기준이다.

## 사전 준비

앱 의존성:

```bash
npm install
```

드라이버 의존성은 앱의 `package.json` 과 분리되어 있다. 최초 1회만:

```bash
cd .claude/skills/run-health
npm install
npx playwright install chromium
cd ../../..
```

크로미움은 `C:\Users\<사용자>\AppData\Local\ms-playwright\` 에 설치된다.
`npx playwright install chromium` 은 성공해도 출력이 없을 수 있다.
확인하려면 `npx playwright install chromium --dry-run` 으로 설치 경로를 본다.

## 개발 서버 실행

`.claude/launch.json` 에 `health` 항목이 있다. **포트는 3002 고정**이다:

```json
{ "name": "health", "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", "health", "run", "dev", "--", "--port", "3002", "--strictPort"],
  "port": 3002 }
```

`preview_start` 에 `{ name: "health" }` 로 띄운다. Bash 로 dev 서버를 띄우지 않는다.

- `vite.config.js` 자체는 `port: 3000` 이지만 **이 개발 머신은 3000 이 거의 항상 점유**되어
  있다(다른 프로젝트의 dev 서버). Vite 는 조용히 3001+ 로 폴백하므로 포트를 가정하지 않는다.
  launch.json 이 `--port 3002 --strictPort` 로 못박는 이유다
- `server.open: true` 라서 **실제 GUI 브라우저 창이 하나 열린다.** 드라이버가 조작하는
  헤드리스 크로미움과는 별개의 창이다

## 스크린샷 찍기 (드라이버)

stdin 으로 스크립트를 파이프한다:

```bash
node .claude/skills/run-health/driver.mjs <<EOF
nav http://localhost:3002
wait-for text=오늘의 건강 상태를
settle
screenshot 01-dashboard --full
click header button:has-text("로그인")
wait-for input[type="password"]
fill input[type="text"] 김훈기
fill input[type="password"] test1234
click form button[type="submit"]
wait-for text=김훈기
screenshot 02-logged-in
click header [aria-haspopup="menu"]
wait-for text=logout
screenshot 03-dropdown
console --errors
quit
EOF
```

건강 분석 결과 화면까지 찍으려면:

```bash
node .claude/skills/run-health/driver.mjs <<EOF
nav http://localhost:3002
click button:has-text("건강정보 입력하기")
wait-for text=건강정보 입력
fill input[name="age"] 38
fill input[name="heightCm"] 175
fill input[name="weightKg"] 82
fill input[name="targetWeightKg"] 72
fill input[name="bodyFatPercent"] 27
fill input[name="blood_fastingGlucose"] 110
click button:has-text("분석하기")
wait-for text=BMI 구간
settle 1500
screenshot 04-result --full
quit
EOF
```

입력 필드는 전부 `name` 속성이 있다 (`age`, `heightCm`, `weightKg`,
`targetWeightKg`, `dailyDeficitKcal`, `bodyFatPercent`, 혈액검사는
`blood_<항목키>`). 라벨 텍스트로 셀렉터를 만들지 말고 `name` 을 쓴다.

다크 모드는 테마 버튼을 눌러서 확인한다:

```bash
click button[aria-label*="어두운"]
```

결과는 `.claude/skills/run-health/sessions/default/screenshots/` 에 저장된다
(최신본은 같은 폴더의 `screenshot.png` 로도 복사).
`console --errors` 가 `[]` 를 출력하면 콘솔이 깨끗하다는 뜻이다.

찍은 PNG 는 `SendUserFile` 로 사용자에게 보낸다.

### 드라이버 명령

| 명령 | 동작 |
|---|---|
| `nav <url>` | 이동 |
| `wait-for text=<부분문자열>` | 텍스트가 나타날 때까지 대기 (`text=` 없이 주면 CSS 셀렉터) |
| `screenshot [이름] [--full]` | PNG 저장. `--full` 은 페이지 전체 |
| `click <selector>` | 클릭 (Playwright 셀렉터 문법, 예: `button:has-text("검색")`) |
| `hover <selector>` | 마우스 올리기 (호버로만 열리는 툴팁 확인용) |
| `fill <selector> <value>` | 입력 |
| `select <selector> <value>` | `<select>` 옵션 선택 |
| `press <key>` | 키 입력 (`Enter`, `Escape`) |
| `viewport <w> <h>` | 화면 크기 변경 (`viewport 375 812` 로 모바일 확인) |
| `settle [ms]` | 애니메이션이 끝날 때까지 대기 (기본 1200ms) |
| `media reduce` | `prefers-reduced-motion: reduce` 흉내 (모션 꺼진 상태 확인) |
| `geo <lat> <lng>` | 위치 권한 허용 + 좌표 고정 (`geo 37.5665 126.9780` 서울시청) |
| `console [--errors]` | 수집된 콘솔 로그를 JSON 으로 출력 |
| `eval <js>` | `page.evaluate` |
| `quit` | 브라우저 종료 |

## 검사

테스트 스위트는 없다. `npm run lint`(oxlint) 가 유일한 검사다:

```bash
npm run lint
```

---

## 주의사항

- **`fill`/`select` 의 셀렉터에 공백이 있으면 `"큰따옴표"` 로 감싼다.**
  이 드라이버는 따옴표를 먼저 처리한 뒤, 없으면 첫 공백으로 자른다.
  `fill "input[placeholder=\"이름 입력\"]" 값` 처럼 쓴다.
  (`run-weather` 드라이버는 이 처리가 없어 공백 셀렉터에서 CSS 파싱 에러가 났다)
- **HMR 중 발생한 옛 오류가 콘솔 버퍼에 남는다.** 파일을 여러 개 순차로 쓰는 동안
  Vite 가 중간 상태를 리로드하면서 에러를 뱉는데, 작업이 끝난 뒤에도 버퍼에 남아
  현재 오류처럼 보인다. **판단은 새 탭(또는 드라이버 새 실행)의 콘솔로 한다**
- 로그인은 목(mock)이다. 아무 아이디/비밀번호나 넣으면 통과하고 localStorage
  (`health:currentUser`, `health:token`)에 저장된다. 로그인 상태를 초기화하려면
  해당 키를 지우거나 `logout` 을 누른다
- 대시보드 카드 5장 중 4장은 **의도적으로 "준비 중"** 이다. 분석 엔진이 아직 없다
  (`work.md` 단계 5~6). 버그가 아니다
- **`screenshot` 전에 `settle` 을 넣는다.** 숫자 카운트업과 막대 성장이 진행 중일 때
  찍으면 BMI 가 26.8 대신 9.4 처럼 중간값으로 박제된다. 값이 이상해 보이면
  계산 버그를 의심하기 전에 `settle` 부터 확인한다
- **`--full` 스크린샷에는 sticky 헤더가 페이지 중간에 한 번 더 찍힌다.**
  Playwright 가 전체 페이지를 이어 붙일 때 생기는 알려진 현상이고 실제 화면 버그가
  아니다. 헤더 위치를 확인하려면 `--full` 없이 찍는다
- **헬스장 검색은 `geo` 없이는 항상 실패한다.** 헤드리스 기본값이 위치 권한 '거부' 라
  "위치 권한이 거부되었습니다" 만 보인다. 앱 버그가 아니다
- **카카오 SDK 는 로딩에 최대 10초를 기다린다.** `settle 4000` 정도로 짧게 보면
  아직 로딩 중이라 결과가 0건처럼 보인다. 카카오 경로를 볼 때는 `settle 14000`

## 카카오맵이 안 될 때 원인 가르기

브라우저에서는 `status 0` 으로만 보여 원인을 알 수 없다. 서버에서 직접 때려 본다
(키가 로그에 남지 않게 `.env` 에서 읽고 출력에서 가린다):

```bash
KEY=$(grep '^VITE_KAKAO_MAP_KEY=' .env | cut -d= -f2 | tr -d '\r\n')
curl -s -H "Referer: http://localhost:3002/" \
  "https://dapi.kakao.com/v2/maps/sdk.js?appkey=$KEY&libraries=services&autoload=false" \
  | sed "s/$KEY/<가림>/g" | head -c 300
```

| 응답 | 뜻 | 조치 |
|---|---|---|
| `200` (JS 코드) | 정상 | — |
| `401 AccessDeniedError · domain mismatched` | 그 주소가 등록 안 됨 | 앱 설정 > 플랫폼 > Web 에 해당 origin 추가 |
| `403 NotAuthorizedError · disabled OPEN_MAP_AND_LOCAL` | 앱은 맞지만 **카카오맵 서비스가 꺼져 있음** | 제품 설정 > 카카오맵 > 활성화 ON |
| `401 · invalid appkey` | REST API 키를 넣었음 | JavaScript 키로 교체 |

- 카카오가 실패해도 `gymService` 가 Overpass 로 되돌아가므로 결과는 나온다.
  화면에 되돌아온 이유가 표시되니 그 문구를 먼저 읽는다
