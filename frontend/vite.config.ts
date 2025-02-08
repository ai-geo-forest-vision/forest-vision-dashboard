import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      'process.env.VITE_MAPBOX_TOKEN': JSON.stringify(env.VITE_MAPBOX_TOKEN),
    },
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5003',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
