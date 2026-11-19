import { createContext, useContext, useState, type ReactNode } from 'react';

interface StoreContextType {
  usuarioLogado: string | null;
  login: (usuario: string, senha: string) => boolean;
  logout: () => void;
  buscaGlobal: string;
  setBuscaGlobal: (termo: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(() => {
    return localStorage.getItem('mr_usuario_logado');
  });
  const [buscaGlobal, setBuscaGlobal] = useState('');

  function login(usuario: string, senha: string): boolean {
    if (usuario.trim().length >= 3 && senha.trim().length >= 3) {
      const nomeFormatado = usuario.trim();
      setUsuarioLogado(nomeFormatado);
      localStorage.setItem('mr_usuario_logado', nomeFormatado);
      return true;
    }
    return false;
  }

  function logout() {
    setUsuarioLogado(null);
    localStorage.removeItem('mr_usuario_logado');
  }

  return (
    <StoreContext.Provider
      value={{
        usuarioLogado,
        login,
        logout,
        buscaGlobal,
        setBuscaGlobal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}
