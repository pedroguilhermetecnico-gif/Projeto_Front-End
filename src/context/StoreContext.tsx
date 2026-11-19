import { useState, type ReactNode } from 'react';
import { ensureDemoSession, clearDemoSession } from '../services/demoSession';
import { StoreContext } from './storeContextValue';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(() => {
    const usuario = localStorage.getItem('mr_usuario_logado');
    if (usuario) ensureDemoSession();
    return usuario;
  });
  const [buscaGlobal, setBuscaGlobal] = useState('');

  function login(usuario: string, senha: string): boolean {
    if (usuario.trim().length >= 3 && senha.trim().length >= 3) {
      const nomeFormatado = usuario.trim();
      ensureDemoSession();
      setUsuarioLogado(nomeFormatado);
      localStorage.setItem('mr_usuario_logado', nomeFormatado);
      return true;
    }
    return false;
  }

  function logout() {
    clearDemoSession();
    setUsuarioLogado(null);
    localStorage.removeItem('mr_usuario_logado');
  }

  return (
    <StoreContext.Provider value={{ usuarioLogado, login, logout, buscaGlobal, setBuscaGlobal }}>
      {children}
    </StoreContext.Provider>
  );
}