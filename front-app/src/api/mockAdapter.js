import { AxiosError } from 'axios'
import { KEYS, readJson, writeJson } from '../utils/storage'
import { hashPassword } from '../utils/hash'

// localStorage 를 저장소로 쓰는 가짜 서버.
// 실제 백엔드가 생기면 client.js 에서 이 adapter 연결만 끊으면 된다.

const LATENCY = 120

const SEED_USERS = [
  { id: 1, username: 'hongkd', password: 'pass1234', nickname: '홍길동' },
  { id: 2, username: 'kimcs', password: 'pass1234', nickname: '김철수' },
]

const SEED_TITLES = [
  '게시판 예제에 오신 것을 환영합니다',
  '공지: 시드 계정 안내',
  'React Router 로 라우팅 나누기',
  'CSS Module 과 Tailwind 같이 쓰기',
  'axios adapter 로 목 서버 만들기',
  'localStorage 를 저장소로 쓸 때 주의할 점',
  '로그인 상태를 Context 로 관리하기',
  '페이지네이션 계산은 어디에 둘까',
  '작성자 본인만 수정하게 만들기',
  '폼 유효성 검사 위치 정하기',
  '조회수는 언제 올려야 할까',
  '에러 메시지를 화면에 전달하는 방법',
  '레이어 규칙을 지키면 좋은 점',
  'oxlint 설정 살펴보기',
  '다음 시간에 다룰 내용',
]

const nowMinusHours = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString()

const buildSeedUsers = () =>
  SEED_USERS.map(({ id, username, password, nickname }) => ({
    id,
    username,
    passwordHash: hashPassword(password),
    nickname,
    createdAt: nowMinusHours(SEED_TITLES.length * 5 + 10),
  }))

const buildSeedPosts = () =>
  SEED_TITLES.map((title, index) => {
    const author = SEED_USERS[index % SEED_USERS.length]
    const createdAt = nowMinusHours((SEED_TITLES.length - index) * 5)
    return {
      id: index + 1,
      title,
      content: `${title}\n\n게시판 예제의 시드 게시글입니다. 목록/상세/수정/삭제 동작을 확인하는 용도로 미리 넣어 두었습니다.`,
      authorId: author.id,
      authorNickname: author.nickname,
      viewCount: (index * 7) % 23,
      createdAt,
      updatedAt: createdAt,
    }
  })

const ensureSeed = () => {
  if (readJson(KEYS.users, null) === null) {
    writeJson(KEYS.users, buildSeedUsers())
  }
  if (readJson(KEYS.posts, null) === null) {
    writeJson(KEYS.posts, buildSeedPosts())
  }
}

const loadUsers = () => readJson(KEYS.users, [])
const saveUsers = (users) => writeJson(KEYS.users, users)
const loadPosts = () => readJson(KEYS.posts, [])
const savePosts = (posts) => writeJson(KEYS.posts, posts)

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1

const toPublicUser = ({ id, username, nickname, createdAt }) => ({
  id,
  username,
  nickname,
  createdAt,
})

const issueToken = (userId) => `mock-token-${userId}`

const parseBody = (config) => {
  if (!config.data) return {}
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data)
    } catch {
      return {}
    }
  }
  return config.data
}

const fail = (config, status, message) => {
  const response = {
    data: { message },
    status,
    statusText: String(status),
    headers: {},
    config,
  }
  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, response)
}

const authHeaderOf = (config) => {
  const headers = config.headers
  if (!headers) return null
  // 인터셉터를 거치면 AxiosHeaders 인스턴스, 아니면 평범한 객체로 들어온다.
  if (typeof headers.get === 'function') return headers.get('Authorization')
  return headers.Authorization ?? headers.authorization ?? null
}

const currentUserOf = (config) => {
  const header = authHeaderOf(config)
  if (!header) return null
  const token = String(header).replace(/^Bearer\s+/i, '')
  const userId = Number(token.replace('mock-token-', ''))
  if (!Number.isInteger(userId)) return null
  return loadUsers().find((user) => user.id === userId) ?? null
}

const requireUser = (config) => {
  const user = currentUserOf(config)
  if (!user) throw fail(config, 401, '로그인이 필요합니다.')
  return user
}

const findPost = (config, id) => {
  const post = loadPosts().find((row) => row.id === id)
  if (!post) throw fail(config, 404, '게시글을 찾을 수 없습니다.')
  return post
}

const requireOwnPost = (config, id) => {
  const user = requireUser(config)
  const post = findPost(config, id)
  if (post.authorId !== user.id) {
    throw fail(config, 403, '본인이 작성한 글만 수정하거나 삭제할 수 있습니다.')
  }
  return { user, post }
}

// --- 핸들러 -----------------------------------------------------------------

const signup = (config) => {
  const { username, password, nickname } = parseBody(config)
  const users = loadUsers()

  if (users.some((user) => user.username === username)) {
    throw fail(config, 409, '이미 사용 중인 아이디입니다.')
  }

  const user = {
    id: nextId(users),
    username,
    passwordHash: hashPassword(password),
    nickname,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])

  return { status: 201, data: { token: issueToken(user.id), user: toPublicUser(user) } }
}

const login = (config) => {
  const { username, password } = parseBody(config)
  const user = loadUsers().find((row) => row.username === username)

  // 아이디가 없는 경우와 비밀번호가 틀린 경우를 구분해서 알려주지 않는다.
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw fail(config, 401, '아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  return { status: 200, data: { token: issueToken(user.id), user: toPublicUser(user) } }
}

const me = (config) => ({ status: 200, data: { user: toPublicUser(requireUser(config)) } })

const listPosts = (config) => {
  const { page = 1, size = 10, keyword = '' } = config.params ?? {}
  const term = String(keyword).trim().toLowerCase()

  const matched = loadPosts()
    .filter((post) =>
      term === ''
        ? true
        : post.title.toLowerCase().includes(term) ||
          post.authorNickname.toLowerCase().includes(term),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const start = (Number(page) - 1) * Number(size)
  const items = matched.slice(start, start + Number(size))

  return {
    status: 200,
    data: { items, total: matched.length, page: Number(page), size: Number(size) },
  }
}

const getPost = (config, id) => ({ status: 200, data: findPost(config, id) })

const increaseView = (config, id) => {
  const posts = loadPosts()
  const index = posts.findIndex((row) => row.id === id)
  if (index === -1) throw fail(config, 404, '게시글을 찾을 수 없습니다.')

  const updated = { ...posts[index], viewCount: posts[index].viewCount + 1 }
  posts[index] = updated
  savePosts(posts)

  return { status: 200, data: updated }
}

const createPost = (config) => {
  const user = requireUser(config)
  const { title, content } = parseBody(config)
  const posts = loadPosts()
  const timestamp = new Date().toISOString()

  const post = {
    id: nextId(posts),
    title,
    content,
    authorId: user.id,
    authorNickname: user.nickname,
    viewCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  savePosts([...posts, post])

  return { status: 201, data: post }
}

const updatePost = (config, id) => {
  requireOwnPost(config, id)
  const { title, content } = parseBody(config)
  const posts = loadPosts()
  const index = posts.findIndex((row) => row.id === id)

  const updated = { ...posts[index], title, content, updatedAt: new Date().toISOString() }
  posts[index] = updated
  savePosts(posts)

  return { status: 200, data: updated }
}

const deletePost = (config, id) => {
  requireOwnPost(config, id)
  savePosts(loadPosts().filter((row) => row.id !== id))
  return { status: 204, data: null }
}

// --- 라우팅 -----------------------------------------------------------------

const ROUTES = [
  { method: 'post', pattern: /^\/auth\/signup$/, handler: signup },
  { method: 'post', pattern: /^\/auth\/login$/, handler: login },
  { method: 'get', pattern: /^\/auth\/me$/, handler: me },
  { method: 'get', pattern: /^\/posts$/, handler: listPosts },
  { method: 'post', pattern: /^\/posts$/, handler: createPost },
  { method: 'post', pattern: /^\/posts\/(\d+)\/view$/, handler: increaseView },
  { method: 'get', pattern: /^\/posts\/(\d+)$/, handler: getPost },
  { method: 'put', pattern: /^\/posts\/(\d+)$/, handler: updatePost },
  { method: 'delete', pattern: /^\/posts\/(\d+)$/, handler: deletePost },
]

const pathOf = (config) => {
  const base = config.baseURL ?? ''
  const url = config.url ?? ''
  return (base && url.startsWith(base) ? url.slice(base.length) : url) || '/'
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const mockAdapter = async (config) => {
  ensureSeed()
  await delay(LATENCY)

  const method = (config.method ?? 'get').toLowerCase()
  const path = pathOf(config)

  for (const route of ROUTES) {
    if (route.method !== method) continue
    const match = route.pattern.exec(path)
    if (!match) continue

    const { status, data } = route.handler(config, match[1] ? Number(match[1]) : undefined)
    return {
      data,
      status,
      statusText: String(status),
      headers: {},
      config,
      request: null,
    }
  }

  throw fail(config, 404, `처리할 수 없는 요청입니다: ${method.toUpperCase()} ${path}`)
}

export default mockAdapter
