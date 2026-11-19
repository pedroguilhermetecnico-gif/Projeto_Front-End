import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createDemoApiHandler } from './server/demoApi.js';

function temporaryApiPlugin(): Plugin {
  const handleApi = createDemoApiHandler();
  return {
    name: 'temporary-demo-api',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.startsWith('/api/')) {
          void handleApi(request, response).catch(next);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), temporaryApiPlugin()],
});