// 게시글 저장소. localStorage 를 읽고 쓰는 것만 담당한다.
// 권한 판정·유효성 검사를 여기에 넣지 않는다 (CLAUDE.md 3.1)
//
// 백엔드가 생기면 이 파일의 함수 본문만 axios 호출로 바꾸면 된다.
// 호출부는 전부 await 로 쓰고 있어 시그니처가 바뀌지 않는다

const STORAGE_KEY = 'health:posts'

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // 저장값이 깨졌으면 버리고 빈 목록으로 시작한다
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function writeAll(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

// crypto.randomUUID 는 보안 컨텍스트(localhost 포함)에서만 있다. 없으면 대체값을 쓴다
function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `p-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function fetchPosts() {
  return readAll()
}

export async function fetchPost(id) {
  return readAll().find((post) => post.id === id) ?? null
}

export async function createPost({ title, content, authorId, authorName }) {
  const now = new Date().toISOString()

  const post = {
    id: createId(),
    title,
    content,
    authorId,
    authorName,
    createdAt: now,
    updatedAt: now,
  }

  writeAll([post, ...readAll()])

  return post
}

export async function updatePost(id, { title, content }) {
  const posts = readAll()
  const index = posts.findIndex((post) => post.id === id)

  if (index === -1) return null

  const updated = {
    ...posts[index],
    title,
    content,
    updatedAt: new Date().toISOString(),
  }

  posts[index] = updated
  writeAll(posts)

  return updated
}

export async function deletePost(id) {
  const posts = readAll()
  const next = posts.filter((post) => post.id !== id)

  writeAll(next)

  return posts.length !== next.length
}
