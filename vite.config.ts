import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Ignore unused exports warnings
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore unused external imports
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        // Ignore never read warnings and errors
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.message.includes('never read')) return;
        if (warning.message.includes('is defined but never used')) return;
        if (warning.message.includes('is assigned a value but never used')) return;
        warn(warning);
      }
    },
    // Suppress chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Suppress source map warnings
    sourcemap: false
  }
})
