// 로그인 상태 관리. React 를 import 하지 않는다
//
// [범위 주의] 이번 작업(doc/header-menu.md)은 헤더의 로그인/비로그인 두 모습을
// 확인하기 위한 최소 구현이다. work.md 3.1 회원가입 검증, 3.2 로그인 실패 처리는
// 다음 작업에서 이 파일을 채운다

const TOKEN_KEY = 'board:token'
const CURRENT_USER_KEY = 'board:currentUser'

// 예제용 간이 해시. 비밀번호를 어디에도 평문으로 남기지 않기 위한 것이다
function simpleHash(text) {
  let hash = 0

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }

  return `h${(hash >>> 0).toString(16)}`
}

export function getStoredUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY)
    return null
  }
}

export function validateLoginInput({ username, password }) {
  if (!username.trim()) return '아이디를 입력해 주세요.'
  if (!password) return '비밀번호를 입력해 주세요.'
  return null
}

export function login({ username, password }) {
  const message = validateLoginInput({ username, password })

  if (message) {
    throw new Error(message)
  }

  // 해시만 만들고 버린다. 평문 비밀번호는 저장하지도, 반환하지도 않는다
  simpleHash(password)

  const user = {
    id: username.trim(),
    username: username.trim(),
    nickname: username.trim(),
  }

  localStorage.setItem(TOKEN_KEY, `token-${simpleHash(username.trim())}`)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))

  return user
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}
