import { useEffect, useState } from 'react'
import styles from './BoardPage.module.css'
import BoardList from '../components/BoardList'
import BoardDetail from '../components/BoardDetail'
import BoardForm from '../components/BoardForm'
import { useAuth } from '../store/useAuth'
import * as postService from '../service/postService'

// 게시판 컨텐츠 진입점.
// 내부 화면 전환(목록/상세/글쓰기/수정)을 이 컴포넌트가 담당한다 (CLAUDE.md 4.4).
// 하위 컴포넌트는 전환 함수를 props 로 받아 호출만 한다
export default function BoardPage() {
  const { user } = useAuth()

  const [view, setView] = useState('list')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [page, setPage] = useState(1)

  const [listData, setListData] = useState(null)
  const [detail, setDetail] = useState(null)

  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // 저장/삭제 후 목록을 다시 읽게 하는 신호
  const [reloadKey, setReloadKey] = useState(0)

  // 목록 로드
  useEffect(() => {
    if (view !== 'list') return undefined

    let alive = true

    postService
      .getPostPage({ page })
      .then((data) => {
        if (!alive) return
        setListData(data)
        // 글이 지워져 페이지가 사라졌으면 범위 안으로 되돌린다
        setPage(data.page)
      })
      .catch((err) => {
        if (alive) setError(err.message)
      })

    return () => {
      alive = false
    }
  }, [view, page, reloadKey])

  // 상세/수정에서 볼 글 로드
  useEffect(() => {
    if (view !== 'detail' && view !== 'edit') return undefined
    if (!selectedPostId) return undefined

    let alive = true

    postService
      .getPost(selectedPostId)
      .then((post) => {
        if (alive) setDetail(post)
      })
      .catch((err) => {
        if (alive) setError(err.message)
      })

    return () => {
      alive = false
    }
  }, [view, selectedPostId])

  function goList() {
    setView('list')
    setSelectedPostId(null)
    setDetail(null)
    setError('')
    setFormError('')
  }

  function goDetail(id) {
    setSelectedPostId(id)
    setDetail(null)
    setError('')
    setFormError('')
    setView('detail')
  }

  function goWrite() {
    setFormError('')
    setView('write')
  }

  function goEdit(id) {
    setSelectedPostId(id)
    setFormError('')
    setView('edit')
  }

  async function handleCreate({ title, content }) {
    setSubmitting(true)
    setFormError('')

    try {
      const created = await postService.writePost({ title, content, user })
      setPage(1)
      setReloadKey((key) => key + 1)
      goDetail(created.id)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate({ title, content }) {
    setSubmitting(true)
    setFormError('')

    try {
      await postService.editPost({ id: selectedPostId, title, content, user })
      setReloadKey((key) => key + 1)
      goDetail(selectedPostId)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await postService.removePost({ id: selectedPostId, user })
      setReloadKey((key) => key + 1)
      goList()
    } catch (err) {
      setError(err.message)
    }
  }

  function renderContent() {
    if (view === 'write') {
      return (
        <BoardForm
          mode="write"
          submitting={submitting}
          error={formError}
          onSubmit={handleCreate}
          onCancel={goList}
        />
      )
    }

    if (view === 'edit') {
      if (!detail) return <p className={styles.loading}>불러오는 중...</p>

      return (
        <BoardForm
          key={detail.id}
          mode="edit"
          initialTitle={detail.title}
          initialContent={detail.content}
          submitting={submitting}
          error={formError}
          onSubmit={handleUpdate}
          onCancel={() => goDetail(detail.id)}
        />
      )
    }

    if (view === 'detail') {
      if (!detail) return <p className={styles.loading}>불러오는 중...</p>

      return (
        <BoardDetail
          post={detail}
          canEdit={postService.canEditPost(detail, user)}
          onBack={goList}
          onEdit={goEdit}
          onDelete={handleDelete}
        />
      )
    }

    if (!listData) return <p className={styles.loading}>불러오는 중...</p>

    return (
      <BoardList
        posts={listData.posts}
        page={listData.page}
        totalPages={listData.totalPages}
        total={listData.total}
        canWrite={Boolean(user)}
        onSelectPost={goDetail}
        onWrite={goWrite}
        onChangePage={setPage}
      />
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>COMMUNITY</span>
        <h1 className={styles.title}>게시판</h1>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.panel}>{renderContent()}</div>
    </div>
  )
}
