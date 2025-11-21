import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5000,
    host: '0.0.0.0',           // needed for Replit
    strictPort: true,
    // THIS LINE FIXES THE "Blocked request" ERROR FOREVER
    allowedHosts: ['all']
  }
})