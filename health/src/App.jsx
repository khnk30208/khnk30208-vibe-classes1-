import MainLayout from './layouts/MainLayout'
import AuthProvider from './store/AuthProvider'

// App 은 AuthProvider 와 MainLayout 만 렌더한다. 화면 로직을 넣지 않는다
function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

export default App
