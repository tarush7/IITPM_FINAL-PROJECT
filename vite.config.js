import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const tunnelUrl = (env.N8N_TUNNEL_URL || '').trim()

  const devProxy = tunnelUrl
    ? {
        '/n8n-webhook': {
          target: tunnelUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n-webhook/, ''),
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
      }
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: devProxy ? { proxy: devProxy } : undefined,
  }
})
