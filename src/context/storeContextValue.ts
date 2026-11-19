import { createContext } from 'react';

export interface StoreContextType {
  usuarioLogado: string | null;
  login: (usuario: string, senha: string) => boolean;
  logout: () => void;
  buscaGlobal: string;
  setBuscaGlobal: (termo: string) => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);