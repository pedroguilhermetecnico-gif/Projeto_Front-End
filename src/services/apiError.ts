interface ApiErrorLike {
  status?: string | number;
  data?: unknown;
}

export function mensagemErroApi(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) return fallback;
  const apiError = error as ApiErrorLike;
  if (apiError.status === 'FETCH_ERROR' || apiError.status === 'TIMEOUT_ERROR') {
    return 'Não foi possível conectar à API temporária. Confirme se ela está disponível e tente novamente.';
  }
  if (typeof apiError.data === 'object' && apiError.data !== null && 'message' in apiError.data) {
    const message = (apiError.data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof apiError.status === 'number') return `A API respondeu com erro HTTP ${apiError.status}.`;
  return fallback;
}