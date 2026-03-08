import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// __dirname is not available in ESM; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  envDir: path.resolve(__dirname, 'frontend-env'),
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_ORIGIN || 'https://api.revive-root-essentials.telente.site',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_BACKEND_ORIGIN || 'https://api.revive-root-essentials.telente.site',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_ORIGIN || 'https://api.revive-root-essentials.telente.site',
        changeOrigin: true,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 800,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
