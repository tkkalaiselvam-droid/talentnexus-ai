import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Forces your browser to safely pass requests to your Python port
        changeOrigin: true,
        secure: false,
      }
    }
  }
});