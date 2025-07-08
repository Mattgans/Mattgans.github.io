// 1. Import the React plugin
import react from '@vitejs/plugin-react'; 
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 2. Add the base path for GitHub Pages
      //    REPLACE 'your-repository-name' with your actual repo name
      base: '/Mattgans.github.io/', 

      // 3. Add the plugins array with the React plugin
      plugins: [react()],

      // Your existing configuration is preserved below
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});