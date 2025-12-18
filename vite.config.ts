
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 關鍵：確保在 GitHub Pages 的子目錄（repo 名稱）下資源載入正確
  define: {
    // 注入 API_KEY，請確保 GitHub Secrets 中已設定此變數
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts'],
          genai: ['@google/genai']
        }
      }
    }
  }
});
