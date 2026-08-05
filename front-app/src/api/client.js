import axios from 'axios'
import mockAdapter from './mockAdapter'
import { KEYS, readText } from '../utils/storage'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // 백엔드가 없는 예제라 localStorage 기반 목 서버를 붙인다.
  // 실제 서버가 생기면 이 adapter 한 줄만 지우면 된다.
  adapter: mockAdapter,
})

client.interceptors.request.use((config) => {
  const token = readText(KEYS.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
