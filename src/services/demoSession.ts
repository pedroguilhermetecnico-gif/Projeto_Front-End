export const DEMO_SESSION_KEY = 'mr_demo_session';
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export function ensureDemoSession(): string {
  const current = sessionStorage.getItem(DEMO_SESSION_KEY);
  if (current) return current;
  const id = crypto.randomUUID();
  sessionStorage.setItem(DEMO_SESSION_KEY, id);
  return id;
}

export function clearDemoSession(): void {
  const id = sessionStorage.getItem(DEMO_SESSION_KEY);
  if (id) {
    void fetch(`${API_BASE_URL}/session`, {
      method: 'DELETE',
      headers: { 'X-Demo-Session': id },
    }).catch(() => undefined);
  }
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}