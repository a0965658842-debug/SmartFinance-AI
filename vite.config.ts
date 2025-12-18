
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 確保在 GitHub Pages 子路徑下能正確讀取資源
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生產環境移除 console 以維護效能
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'firebase', 'recharts'],
          genai: ['@google/genai']
        }
      }
    }
  }
});
