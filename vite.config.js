import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',  // Bind to all interfaces for Replit
    hmr: {
      host: '0.0.0.0',  // HMR works with Replit's proxy
      port: 3000
    },
    // KEY FIX: Wildcard for ALL Replit subdomains (safe & works in Vite 6.0.9+)
    allowedHosts: [
      'localhost',
      '.replit.dev',    // Covers your exact host: 4a49e487-...worf.replit.dev
      '.replit.app',    // Fallback for Replit's other domains
      '.repl.co'        // Legacy Replit domains
    ]
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.replit.app',
      '.repl.co'
    ]  // Also for `vite preview` mode
  }
});