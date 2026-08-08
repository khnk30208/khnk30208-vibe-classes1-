import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 자산 경로를 상대 경로로 뽑는다.
//
// GitHub Pages 프로젝트 사이트는 /<저장소이름>/ 아래에 놓이는데, 저장소 이름을
// 빌드 시점에 박아 넣으면 이름이 바뀌는 순간 전부 깨진다(실제로 한 번 바뀌었다).
// 이 앱은 라우터가 없어 상대 경로로 두면 어느 하위 경로에 올려도 그대로 동작한다.
// 필요하면 VITE_BASE 로 덮어쓸 수 있다
const base = process.env.VITE_BASE || (process.env.NODE_ENV === 'production' ? './' : '/')

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
