#!/usr/bin/env node
// Minimal chromium-cli-style REPL driver for the weather app.
// Reads one command per line from stdin, drives a headless Chromium page,
// prints one result line per command. Screenshots land in
// sessions/<name>/screenshots/ (latest copied to screenshot.png).
//
// Commands:
//   nav <url>
//   wait-for text=<substring>      (or a CSS selector)
//   screenshot
//   click <selector>
//   fill <selector> <value>
//   select <selector> <value>       (option value, for <select> elements)
//   press <key>                     (e.g. Enter)
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
let page
const consoleLogs = []
let shotCount = 0

async function ensurePage() {
  if (!page) {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    page = await context.newPage()
    page.on('console', (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }))
    page.on('pageerror', (err) => consoleLogs.push({ type: 'pageerror', text: String(err) }))
  }
  return page
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

async function cmdScreenshot() {
  const p = await ensurePage()
  shotCount += 1
  const file = path.join(screenshotDir, `${String(shotCount).padStart(3, '0')}.png`)
  await p.screenshot({ path: file })
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
  const idx = rest.indexOf(' ')
  const selector = rest.slice(0, idx)
  const value = rest.slice(idx + 1)
  await p.fill(selector, value)
  console.log(`OK fill ${selector}`)
}

async function cmdSelect(rest) {
  const p = await ensurePage()
  const idx = rest.indexOf(' ')
  const selector = rest.slice(0, idx)
  const value = rest.slice(idx + 1)
  await p.selectOption(selector, value)
  console.log(`OK select ${selector} ${value}`)
}

async function cmdPress(key) {
  const p = await ensurePage()
  await p.keyboard.press(key)
  console.log(`OK press ${key}`)
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
      case 'screenshot': return await cmdScreenshot()
      case 'click': return await cmdClick(rest)
      case 'fill': return await cmdFill(rest)
      case 'select': return await cmdSelect(rest)
      case 'press': return await cmdPress(rest)
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
