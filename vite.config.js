import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "https://script.google.com/macros/s/AKfycbzAixil7oa5xsL0f0b2AZ058QUBFqhypcnJ3Md2TpN8SZ80P5NF8tcjTfSYM2snyx4mJA/exec",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  });

