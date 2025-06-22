import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {crx} from '@crxjs/vite-plugin'
import manifest from './manifest.config.js'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

// vite.config.ts
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        crx({manifest})
    ]
})