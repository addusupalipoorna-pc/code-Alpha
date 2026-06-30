import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      '/translate': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/languages': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/transcribe': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/subscribe': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // exact package path checks to avoid circular chunk references
          if (/node_modules\/(three|three\/)/.test(id) || /node_modules\\three\\/.test(id)) return 'three';
          if (/node_modules\/(jspdf|jspdf\/)/.test(id) || /node_modules\\jspdf\\/.test(id)) return 'jspdf';
          if (/node_modules\/(html2canvas|html2canvas\/)/.test(id) || /node_modules\\html2canvas\\/.test(id)) return 'html2canvas';
          if (/node_modules\/(gsap|gsap\/)/.test(id) || /node_modules\\gsap\\/.test(id)) return 'gsap';
          // avoid special-casing React and Framer here to prevent circular chunk references
          if (/node_modules\/(react-icons)(\/|$)/.test(id) || /node_modules\\react-icons\\/.test(id)) return 'icons';

          return 'vendor';
        },
      },
    },
  },
});
