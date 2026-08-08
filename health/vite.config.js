import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 프로젝트 사이트는 /<저장소이름>/ 아래에 놓인다.
// 워크플로가 VITE_BASE 를 넘겨 주고, 로컬에서는 루트('/')를 쓴다
const base = process.env.VITE_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    port: 3000,
    // 같은 공유기에 있는 다른 기기(휴대폰 등)에서도 열 수 있게 한다.
    // 실행하면 Network 주소가 함께 출력된다
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
})
