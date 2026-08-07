#!/usr/bin/env node
// health 앱을 헤드리스 Chromium 으로 구동하는 에이전트 전용 드라이버.
// stdin 에서 한 줄에 한 명령씩 읽어 실행하고, 명령마다 결과 한 줄을 출력한다.
// 스크린샷은 sessions/<name>/screenshots/ 에 저장된다 (최신본은 screenshot.png 로 복사).
//
// 명령:
//   nav <url>
//   wait-for text=<부분문자열>        (또는 CSS 셀렉터)
//   screenshot [이름] [--full]        --full 은 페이지 전체 캡처
//   click <selector>
//   fill <selector> <value>           셀렉터에 공백이 있으면 "따옴표"로 감싼다
//   select <selector> <value>
//   press <key>                       예: Enter, Escape
//   viewport <width> <height>         화면 크기 변경 (반응형 확인)
//   settle [ms]                       애니메이션이 끝날 때까지 기다린다 (기본 1200ms)
//   console [--errors]
//   eval <js expression>
//   quit

import { chromium } from 'playwright'
import readline from 'node:readline'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sessionName = process.env.DRIVER_SESSION || 'default'
const screenshotDir = path.join(__dirname, 'sessions', sessionName, 'screenshots')
fs.mkdirSync(screenshotDir, { recursive: true })

let browser
let context
let page
const consoleLogs = []
let shotCount = 0

async function ensurePage() {
  if (!page) {
    browser = await chromium.launch({ headless: true })
    context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: 'ko-KR',
    })
    page = await context.newPage()
    page.on('console', (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }))
    page.on('pageerror', (err) => consoleLogs.push({ type: 'pageerror', text: String(err) }))
  }
  return page
}

// run-weather 드라이버는 첫 공백으로 잘라서 셀렉터에 공백이 있으면 깨졌다.
// 여기서는 "따옴표로 감싼 셀렉터"를 먼저 처리한다
function splitSelectorAndValue(rest) {
  const trimmed = (rest || '').trim()

  if (trimmed.startsWith('"')) {
    const end = trimmed.indexOf('"', 1)
    if (end !== -1) {
      return [trimmed.slice(1, end), trimmed.slice(end + 1).trim()]
    }
  }

  const idx = trimmed.indexOf(' ')
  if (idx === -1) return [trimmed, '']
  return [trimmed.slice(0, idx), trimmed.slice(idx + 1)]
}

async function cmdNav(url) {
  const p = await ensurePage()
  await p.goto(url, { waitUntil: 'domcontentloaded' })
  console.log(`OK nav ${url}`)
}

async function cmdWaitFor(arg) {
  const p = await ensurePage()
  if (arg.startsWith('text=')) {
    await p.getByText(arg.slice(5)).first().waitFor({ timeout: 15000 })
  } else {
    await p.waitForSelector(arg, { timeout: 15000 })
  }
  console.log(`OK wait-for ${arg}`)
}

async function cmdScreenshot(rest) {
  const p = await ensurePage()
  const args = (rest || '').trim().split(/\s+/).filter(Boolean)
  const fullPage = args.includes('--full')
  const name = args.find((a) => !a.startsWith('--'))

  shotCount += 1
  const base = name || String(shotCount).padStart(3, '0')
  const file = path.join(screenshotDir, `${base}.png`)

  await p.screenshot({ path: file, fullPage })
  fs.copyFileSync(file, path.join(screenshotDir, 'screenshot.png'))
  console.log(`SCREENSHOT ${file}`)
}

async function cmdClick(selector) {
  const p = await ensurePage()
  await p.click(selector)
  console.log(`OK click ${selector}`)
}

async function cmdFill(rest) {
  const p = await ensurePage()
  const [selector, value] = splitSelectorAndValue(rest)
  await p.fill(selector, value)
  console.log(`OK fill ${selector}`)
}

async function cmdSelect(rest) {
  const p = await ensurePage()
  const [selector, value] = splitSelectorAndValue(rest)
  await p.selectOption(selector, value)
  console.log(`OK select ${selector} ${value}`)
}

async function cmdPress(key) {
  const p = await ensurePage()
  await p.keyboard.press(key)
  console.log(`OK press ${key}`)
}

async function cmdViewport(rest) {
  const p = await ensurePage()
  const [width, height] = (rest || '').trim().split(/\s+/).map(Number)

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    console.log('ERR viewport: 너비와 높이를 숫자로 주세요 (예: viewport 375 812)')
    return
  }

  await p.setViewportSize({ width, height })
  console.log(`OK viewport ${width}x${height}`)
}

// 카운트업·막대 성장이 끝나기 전에 스크린샷을 찍으면 값이 중간값으로 남는다
async function cmdSettle(rest) {
  const p = await ensurePage()
  const ms = Number((rest || '').trim()) || 1200

  await p.waitForTimeout(ms)
  console.log(`OK settle ${ms}ms`)
}

// 위치 권한을 허용하고 좌표를 고정한다. 헤드리스는 기본이 '거부' 라 헬스장 검색을 못 본다
async function cmdGeo(rest) {
  await ensurePage()
  const [lat, lng] = (rest || '').trim().split(/\s+/).map(Number)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log('ERR geo: 위도와 경도를 숫자로 주세요 (예: geo 37.5665 126.9780)')
    return
  }

  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: lat, longitude: lng })
  console.log(`OK geo ${lat},${lng}`)
}

// prefers-reduced-motion 을 흉내 낸다. 모션이 꺼져도 값이 다 보이는지 확인용
async function cmdMedia(rest) {
  const p = await ensurePage()
  const value = (rest || '').trim() || 'no-preference'

  await p.emulateMedia({ reducedMotion: value === 'reduce' ? 'reduce' : 'no-preference' })
  console.log(`OK media reduced-motion=${value}`)
}

async function cmdConsole(arg) {
  const onlyErrors = (arg || '').includes('--errors')
  const logs = onlyErrors
    ? consoleLogs.filter((l) => l.type === 'error' || l.type === 'pageerror')
    : consoleLogs
  console.log(JSON.stringify(logs))
}

async function cmdEval(expr) {
  const p = await ensurePage()
  const result = await p.evaluate(expr)
  console.log(`EVAL ${JSON.stringify(result)}`)
}

async function cmdQuit() {
  if (browser) await browser.close()
  process.exit(0)
}

async function handleLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return

  const spaceIdx = trimmed.indexOf(' ')
  const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1)

  try {
    switch (cmd) {
      case 'nav': return await cmdNav(rest)
      case 'wait-for': return await cmdWaitFor(rest)
      case 'screenshot': return await cmdScreenshot(rest)
      case 'click': return await cmdClick(rest)
      case 'fill': return await cmdFill(rest)
      case 'select': return await cmdSelect(rest)
      case 'press': return await cmdPress(rest)
      case 'viewport': return await cmdViewport(rest)
      case 'settle': return await cmdSettle(rest)
      case 'geo': return await cmdGeo(rest)
      case 'media': return await cmdMedia(rest)
      case 'console': return await cmdConsole(rest)
      case 'eval': return await cmdEval(rest)
      case 'quit': return await cmdQuit()
      default: console.log(`ERR unknown command: ${cmd}`)
    }
  } catch (err) {
    console.log(`ERR ${cmd}: ${err.message}`)
  }
}

const rl = readline.createInterface({ input: process.stdin })
let queue = Promise.resolve()

rl.on('line', (line) => {
  queue = queue.then(() => handleLine(line))
})

rl.on('close', async () => {
  await queue
  if (browser) await browser.close()
  process.exit(0)
})
