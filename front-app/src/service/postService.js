import {
  fetchPosts,
  fetchPost,
  increaseViewCount,
  createPost,
  updatePost,
  deletePost,
} from '../api/postApi'

export const PAGE_SIZE = 10
export const TITLE_MAX_LENGTH = 100

export const getPostPage = async ({ page = 1, keyword = '' } = {}) => {
  const { data } = await fetchPosts({ page, size: PAGE_SIZE, keyword })
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  // 목록의 '번호'는 전체 글 기준 역순으로 매긴다.
  const firstNumber = data.total - (page - 1) * PAGE_SIZE
  const items = data.items.map((post, index) => ({
    ...post,
    displayNumber: firstNumber - index,
  }))

  return { items, total: data.total, page, totalPages }
}

export const getPost = async (id) => {
  const { data } = await fetchPost(id)
  return data
}

// 상세 진입용. 조회수를 1 올린 뒤의 게시글을 돌려준다.
export const readPost = async (id) => {
  const { data } = await increaseViewCount(id)
  return data
}

export const validatePostForm = ({ title, content }) => {
  const errors = {}

  if (!title?.trim()) {
    errors.title = '제목을 입력하세요.'
  } else if (title.trim().length > TITLE_MAX_LENGTH) {
    errors.title = `제목은 ${TITLE_MAX_LENGTH}자 이내로 입력하세요.`
  }

  if (!content?.trim()) {
    errors.content = '내용을 입력하세요.'
  }

  return errors
}

// id 가 없으면 새 글, 있으면 수정.
export const savePost = async (id, { title, content }) => {
  const body = { title: title.trim(), content }
  const { data } = id ? await updatePost(id, body) : await createPost(body)
  return data
}

export const removePost = async (id) => {
  await deletePost(id)
}

export const canEditPost = (post, user) =>
  Boolean(post && user && post.authorId === user.id)
