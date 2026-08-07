import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 모션은 JS 가 살아 있을 때만 건다. 이 클래스가 없으면 모든 요소가 정적으로 다 보인다
// (doc/design-system.md 5.1)
document.body.classList.add('js-motion')

createRoot(document.getElementById('root')).render(<App />)
