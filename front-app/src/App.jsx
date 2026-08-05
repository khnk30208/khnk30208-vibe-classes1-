import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import PostEditorPage from './pages/PostEditorPage'

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/posts" element={<PostListPage />} />
        <Route
          path="/posts/new"
          element={
            <RequireAuth>
              <PostEditorPage />
            </RequireAuth>
          }
        />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route
          path="/posts/:id/edit"
          element={
            <RequireAuth>
              <PostEditorPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/posts" replace />} />
      </Routes>
    </>
  )
}

export default App
