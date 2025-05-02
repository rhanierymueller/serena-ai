import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],
    server: isDevelopment
      ? {
          host: '0.0.0.0', // Permite acesso externo
          proxy: {
            '/api': 'http://localhost:3011', // Proxy só em desenvolvimento
          },
          historyApiFallback: true, // Para React Router funcionar no dev
        }
      : undefined, // Em produção, nada disso é necessário
    build: {
      outDir: 'dist',
    },
  };
});
