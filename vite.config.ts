/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createApiProxyRoute } from './vite-api-proxy.js'

// Normalize base path: must start with /; subpaths must end with /
function normalizeBase(raw: string | undefined): string {
  const v = (raw ?? '').trim()
  if (!v || v === '/') return '/'
  const withLeading = v.startsWith('/') ? v : `/${v}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const useExactEnvFile = process.env.TRIO_EXACT_ENV_FILE === 'true'
  const env = useExactEnvFile ? process.env : loadEnv(mode, process.cwd(), '')
  const base = normalizeBase(env.VITE_BASE_PATH)
  const apiProxyRoute = createApiProxyRoute(
    env.VITE_API_PROXY_TARGET ?? 'https://dev.api.trio.am',
  )

  return {
  ...(useExactEnvFile ? { envDir: false } : {}),
  plugins: [react()],

  base,

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Server configuration
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: apiProxyRoute.target,
        changeOrigin: true,
        secure: true,
        rewrite: apiProxyRoute.rewrite,
      },
    },
  },

  // Build configuration — static export for nginx.
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },

  // Environment variables configuration
  envPrefix: 'VITE_',
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-hook-form',
      'zod',
      'i18next',
      'react-i18next',
      'zustand',
      'leaflet',
      'react-leaflet',
    ],
  },
  }
})
