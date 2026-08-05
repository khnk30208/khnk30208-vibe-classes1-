---
name: run-weather
description: Build, run, and drive the weather app (Vite + React city-weather dashboard). Use when asked to start weather, run it, take a screenshot of its UI, or search a city's weather end-to-end.
---

This is a Vite + React web app (no separate build step needed to run it
in dev mode). There's no `chromium-cli` or connected browser extension
in this environment, so drive it with the bundled Playwright script at
`.claude/skills/run-weather/driver.mjs` — a small chromium-cli-style
REPL that reads commands from stdin.

All paths below are relative to the repo root (`weather/`).

## Setup

```bash
npm install
```

The app needs `VITE_OPENWEATHER_API_KEY` in `.env` (already present in
this repo, checked out from `.env.example`'s value at
`VITE_OPENWEATHER_API_KEY=<key>`). With it set, weather search works
immediately — there's no in-app API key UI (it was removed; the app
now always uses the `.env` key via `getEffectiveApiKey()` in
`src/service/apiKeyService.js`).

The driver's own dependencies (Playwright) are separate from the app's
`package.json` — install them once:

```bash
cd .claude/skills/run-weather
npm install
npx playwright install chromium
cd ../../..
```

## Run (agent path)

Each numbered step below is written as its own shell invocation —
don't assume shell variables survive between them (they don't, in this
harness: each Bash call is a fresh shell, only the working directory
and the filesystem persist). `$port` is written to `/tmp/weather-port`
in step 1 and re-read from that file in steps 2 and 3.

1. Start the dev server in the background and wait for it to serve
   (Vite's configured port 3000 is often already taken by something
   else on this machine — it auto-falls-back, so read the actual port
   from the log rather than assuming 3000). Vite's log is full of ANSI
   color codes, so strip them before grepping — `"Local:"` as a literal
   substring won't match (there's an escape sequence between `Local`
   and `:`):

```bash
npm run dev > /tmp/weather-dev.log 2>&1 &
for i in $(seq 1 15); do grep -q "localhost" /tmp/weather-dev.log && break; sleep 1; done
sed -E 's/\x1b\[[0-9;]*[a-zA-Z]//g' /tmp/weather-dev.log | grep -oE 'localhost:[0-9]+' | head -1 | cut -d: -f2 > /tmp/weather-port
cat /tmp/weather-port   # → 3001 (or whatever it picked)
```

2. Drive it with the Playwright REPL driver — pipe a script to stdin:

```bash
port=$(cat /tmp/weather-port)
node .claude/skills/run-weather/driver.mjs <<EOF
nav http://localhost:$port
wait-for text=검색
fill input[type="text"] Tokyo
screenshot
click button:has-text("검색")
wait-for text=Tokyo
screenshot
console --errors
quit
EOF
```

Screenshots land in
`.claude/skills/run-weather/sessions/default/screenshots/NNN.png`
(latest copied to `screenshot.png` in the same folder). `console
--errors` prints a JSON array of console errors/exceptions seen so
far — `[]` means clean.

3. Stop the dev server (frees the port for the next run):

```bash
port=$(cat /tmp/weather-port)
pid=$(netstat -ano | grep "LISTENING" | grep ":$port " | awk '{print $NF}' | head -1)
taskkill //F //PID "$pid"
rm -f /tmp/weather-port /tmp/weather-dev.log
```
(`$!` after `npm run dev &` is only the npm wrapper — it doesn't
forward the kill to the actual Vite process, so killing by the port's
listener PID is what actually frees it.)

### Driver commands

| command | what it does |
|---|---|
| `nav <url>` | navigate |
| `wait-for text=<substring>` | wait for text to appear (or pass a CSS selector with no `text=` prefix) |
| `screenshot` | save a PNG, see path above |
| `click <selector>` | click (Playwright selector syntax, e.g. `button:has-text("검색")`) |
| `fill <selector> <value>` | fill a single-token selector (no spaces — see Gotchas) |
| `select <selector> <value>` | choose a `<select>` option by value |
| `press <key>` | keyboard key, e.g. `Enter` |
| `console [--errors]` | dump captured console/page-error logs as JSON |
| `eval <js>` | `page.evaluate` |
| `quit` | close the browser and exit |

## Run (human path)

`npm run dev` — opens `http://localhost:3000` in a real browser window
(`vite.config.js` sets `server.open: true`). Ctrl-C to stop. Same
port-fallback caveat as above.

## Test

No test suite configured — `npm run lint` (oxlint) is the only check:

```bash
npm run lint
```

---

## Gotchas

- **Shell variables don't survive between separate tool calls** in this
  harness — only the working directory and the filesystem do. That's
  why the port is written to `/tmp/weather-port` in step 1 and re-read
  from that file in steps 2/3 instead of just reusing a `$port` shell
  variable across steps.
- **The driver's `fill`/`select` split on the first space** to separate
  selector from value, so a selector containing a space (e.g.
  `input[placeholder="도시명을 직접 입력 (예: Seoul)"]`, which has a
  Korean placeholder with spaces) parses wrong and throws a CSS-parse
  error. Use a space-free selector instead — `input[type="text"]`
  uniquely matches the manual-city field (the only `type="text"`
  input on the page now that the API-key `<input>` is gone).
- **`server.open: true` in `vite.config.js` really opens a GUI browser
  window** on this Windows host (not just a headless flag) — that's
  fine to leave running, but it's a separate real Chrome/Edge window,
  not something the driver script controls.
- **Port 3000 is frequently already occupied** by an unrelated process
  on this dev machine — Vite silently falls back to 3001+. Always read
  the actual port from the dev-server log instead of hardcoding 3000.
- **The API key UI was intentionally removed** (`ApiKeyPanel.jsx` /
  `.module.css` deleted, `WeatherPage.jsx` no longer renders it). Don't
  expect an "API KEY" panel in screenshots — search works immediately
  off the `.env` key. If `.env` is missing the key, search fails with
  "API Key가 설정되지 않았습니다." and no way to fix it from the UI —
  fix `.env`, not the page.

## Troubleshooting

- **`ERR fill: ... Unexpected token "" while parsing css selector`**:
  the selector you passed to `fill`/`select` contains a space. Pick a
  selector without one (attribute selectors like `input[type="text"]`
  work; selectors built from Korean placeholder text with spaces
  don't with this driver's naive parser).
- **`wait-for` times out waiting for the searched city's name**: almost
  always means the preceding `fill` silently targeted the wrong
  element (see above) so the search submitted with an empty city and
  the app is showing the "대륙/도시를 선택하거나..." validation error
  instead of a result — check the screenshot before assuming the app
  itself is broken.
