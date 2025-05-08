import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Optimize build settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@tanstack/react-query'],
          'data-vendor': ['@supabase/supabase-js', '@emailjs/browser']
        }
      }
    },
    // Improve chunk loading
    chunkSizeWarningLimit: 1000,
    sourcemap: false // Disable sourcemaps in production for smaller bundles
  },
  // Add performance optimizations
  server: {
    hmr: {
      overlay: true,
    },
  }
});