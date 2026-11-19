import { createServer } from 'node:http';
import { createDemoApiHandler } from './demoApi.js';

const port = Number(process.env.PORT ?? 3000);
const handleDemoApi = createDemoApiHandler();

createServer((request, response) => {
  void handleDemoApi(request, response);
}).listen(port, '0.0.0.0', () => {
  console.log(`API temporária iniciada na porta ${port}.`);
});