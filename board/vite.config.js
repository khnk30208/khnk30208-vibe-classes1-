import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    // front-app 이 3000 을 쓰므로 board 는 3001 을 쓴다
    port: 3001,
  },
})
