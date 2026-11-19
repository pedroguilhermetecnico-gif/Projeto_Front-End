import type { IncomingMessage, ServerResponse } from 'node:http';
export function createDemoApiHandler(): (request: IncomingMessage, response: ServerResponse) => Promise<void>;