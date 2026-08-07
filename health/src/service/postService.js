// 게시판 비지니스 로직. React 를 import 하지 않는다 (CLAUDE.md 3.1)
// 유효성 검사·권한 판정·정렬·페이징이 전부 여기 모인다

import * as postApi from '../api/postApi'

export const PAGE_SIZE = 10

const TITLE_MAX = 100
const CONTENT_MAX = 2000

export function validatePostInput({ title, content }) {
  const trimmedTitle = (title ?? '').trim()
  const trimmedContent = (content ?? '').trim()

  if (!trimmedTitle) return '제목을 입력해 주세요.'
  if (trimmedTitle.length > TITLE_MAX) return `제목은 ${TITLE_MAX}자까지 입력할 수 있습니다.`
  if (!trimmedContent) return '내용을 입력해 주세요.'
  if (trimmedContent.length > CONTENT_MAX) return `내용은 ${CONTENT_MAX}자까지 입력할 수 있습니다.`

  return null
}

// 화면은 이 결과(boolean)만 받아 버튼 노출을 결정한다
export function canEditPost(post, user) {
  if (!post || !user) return false

  return post.authorId === user.id
}

export function getTotalPages(total, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize))
}

export async function getPostPage({ page = 1, pageSize = PAGE_SIZE } = {}) {
  const all = await postApi.fetchPosts()

  // 최신순 정렬
  const sorted = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalPages = getTotalPages(sorted.length, pageSize)
  // 글이 지워져 페이지가 사라진 경우를 대비해 범위를 맞춘다
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    posts: sorted.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: sorted.length,
  }
}

export async function getPost(id) {
  return postApi.fetchPost(id)
}

export async function writePost({ title, content, user }) {
  if (!user) throw new Error('로그인이 필요합니다.')

  const message = validatePostInput({ title, content })
  if (message) throw new Error(message)

  return postApi.createPost({
    title: title.trim(),
    content: content.trim(),
    authorId: user.id,
    authorName: user.nickname,
  })
}

export async function editPost({ id, title, content, user }) {
  const post = await postApi.fetchPost(id)
  if (!post) throw new Error('글을 찾을 수 없습니다.')
  if (!canEditPost(post, user)) throw new Error('수정 권한이 없습니다.')

  const message = validatePostInput({ title, content })
  if (message) throw new Error(message)

  return postApi.updatePost(id, {
    title: title.trim(),
    content: content.trim(),
  })
}

export async function removePost({ id, user }) {
  const post = await postApi.fetchPost(id)
  if (!post) throw new Error('글을 찾을 수 없습니다.')
  if (!canEditPost(post, user)) throw new Error('삭제 권한이 없습니다.')

  return postApi.deletePost(id)
}
