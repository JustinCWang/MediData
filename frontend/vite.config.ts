/**
 * vite.config.ts - Vite Build Configuration
 * 
 * Configuration file for Vite, the build tool and dev server.
 * 
 * Plugins:
 * - @tailwindcss/vite: Enables Tailwind CSS v4 with Vite integration
 * 
 * Note: To add API proxy for development, add a server.proxy configuration
 * pointing to your FastAPI backend (typically http://127.0.0.1:8000)
 */

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind CSS v4 plugin for Vite
  ],
  // TODO: Add server.proxy configuration when connecting to FastAPI backend
  // Example:
  // server: {
  //   port: 5173,
  //   proxy: {
  //     '/api': {
  //       target: 'http://127.0.0.1:8000',
  //       changeOrigin: true,
  //     },
  //   },
  // },
})
