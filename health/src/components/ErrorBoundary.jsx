import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

// 에러 경계는 아직 클래스 컴포넌트로만 만들 수 있다.
// 이게 없으면 렌더 중 예외 하나에 화면 전체가 빈 흰 화면이 된다
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // 원인을 찾을 수 있게 콘솔에는 남긴다. 화면에는 요약만 보여 준다
    console.error('화면을 그리는 중 오류가 발생했습니다.', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  handleReset = () => {
    // 저장값이 깨져 반복해서 터지는 경우를 위한 탈출구
    try {
      localStorage.removeItem('health:records')
      localStorage.removeItem('health:posts')
    } catch {
      // 저장소를 못 쓰는 환경이면 새로고침만 한다
    }

    window.location.reload()
  }

  render() {
    const { error } = this.state

    if (!error) return this.props.children

    return (
      <div className={styles.wrap} role="alert">
        <h1 className={styles.title}>화면을 표시하지 못했습니다</h1>
        <p className={styles.text}>
          입력하신 건강 정보는 외부로 전송되지 않았습니다. 다시 시도해도 같은 화면이
          나오면 저장된 데이터를 비우고 새로 시작해 보세요.
        </p>

        <p className={styles.detail}>{String(error.message || error)}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={this.handleRetry}>
            다시 시도
          </button>
          <button type="button" className={styles.ghost} onClick={this.handleReset}>
            저장 데이터 비우고 새로고침
          </button>
        </div>
      </div>
    )
  }
}
