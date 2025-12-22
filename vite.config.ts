import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 49798,
  },
  base: '/leetcode-208-implement-trie-prefix-tree/',
})
