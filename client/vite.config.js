import { defineConfig } from "vite";
import { fileURLToPath } from 'url'
import react from "@vitejs/plugin-react";
import path from 'path';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/components/Pages'),
      '@content': path.resolve(__dirname, './src/components/Content'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@imgs' : path.resolve(__dirname, './src/imgs')
    },
  },
});