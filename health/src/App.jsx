import MainLayout from './layouts/MainLayout'
import AuthProvider from './store/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'

// App 은 감싸기만 한다. 화면 로직을 넣지 않는다
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
