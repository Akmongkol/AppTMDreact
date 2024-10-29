import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 15000,
     // สามารถใช้การตั้งค่าเพิ่มเติมได้ เช่น การตั้งค่า output format
     rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {  
            return 'vendor'; // แยก vendor ไปเป็น chunk อื่น
          }
        },
      },
    },
  },
})
