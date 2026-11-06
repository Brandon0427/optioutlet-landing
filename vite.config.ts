import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { consultaApiDevPlugin } from './server/dev/viteChatPlugin.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), consultaApiDevPlugin()],
});
