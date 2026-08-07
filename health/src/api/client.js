import axios from 'axios'

// 공용 axios 인스턴스. HTTP 요청/응답만 담당한다.
// 조건 분기나 권한 판단은 service 레이어에서 한다.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

export default client
