import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // For Capacitor and relative asset paths
  server: {
    port: 3000,
    host: true
  }
});
