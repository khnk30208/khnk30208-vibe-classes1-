// 순수 유틸. 다른 레이어를 import 하지 않는다 (CLAUDE.md 3.1)

export function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 텍스트를 파일로 내려받는다.
 * 한글이 깨지지 않게 UTF-8 BOM 을 붙인다 (윈도우 메모장 대응)
 */
export function downloadText(filename, text) {
  const blob = new Blob(['﻿', text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
