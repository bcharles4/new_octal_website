import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      /* 127.0.0.1, not localhost: on Windows `localhost` can resolve to IPv6
         ::1 while the API listens on IPv4 (or the reverse), and the proxy then
         fails with a 500 that looks like a server error. */
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
