import { useState, type FormEvent } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useListarProdutosQuery } from '../services/api';

const NOMES_ROTAS: Record<string, string> = {
  '/produtos': 'Produtos & Estoque > Consultar Inventario',
  '/produtos/novo': 'Produtos & Estoque > Cadastrar Novo Produto',
  '/clientes': 'Clientes > Base de Clientes',
  '/clientes/novo': 'Clientes > Cadastrar Novo Cliente',
  '/orcamentos': 'Orçamentos & PDV > Novo Orçamento',
  '/orcamentos/consultar': 'Orçamentos & PDV > Histórico de Orçamentos',
};

export default function Layout() {
  const { usuarioLogado, logout, setBuscaGlobal } = useStore();
  const { data: produtos = [] } = useListarProdutosQuery(undefined, { skip: !usuarioLogado });
  const navigate = useNavigate();
  const location = useLocation();

  const [menuRecolhido, setMenuRecolhido] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [buscaRapida, setBuscaRapida] = useState('');

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  const itensEstoqueBaixo = produtos.filter((p) => p.estoqueAtual <= p.minimoEstoque).length;

  let trilhaAtual = NOMES_ROTAS[location.pathname];
  if (!trilhaAtual) {
    if (location.pathname.startsWith('/produtos/')) {
      trilhaAtual = 'Produtos & Estoque > Editar Produto';
    } else if (location.pathname.startsWith('/clientes/')) {
      trilhaAtual = 'Clientes > Editar Cliente';
    } else {
      trilhaAtual = 'Painel Operacional';
    }
  }

  function handleSair() {
    logout();
    navigate('/login');
  }

  function handleBuscaGlobal(e: FormEvent) {
    e.preventDefault();
    setBuscaGlobal(buscaRapida.trim());
    navigate('/produtos');
  }

  return (
    <div className="app-shell">
      <div className="utility-bar">
        <div className="utility-left">
          <span><span className="status-dot" />Loja Matriz - Campina Grande, PB</span>
          <span>Atendimento Balcão: (83) 98855-8855</span>
        </div>
        <div className="utility-right">
          <span>Suporte TI: 0800 721 2026</span>
          <span>PDV v2.0</span>
        </div>
      </div>

      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="btn-sidebar-toggle"
            aria-expanded={!menuRecolhido}
            aria-controls="menu-operacional"
            onClick={() => setMenuRecolhido((prev) => !prev)}
            title={menuRecolhido ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="brand-mark" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(248,166,62,0.4)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 18V7L12 13L20 7V18" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 11L12 5L20 11" stroke="#f8a63e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="topbar-brand">
            <h1>MR - MATERIAL DE CONSTRUÇÃO</h1>
            <p>Um jeito fácil de construir barato</p>
          </div>
        </div>

        <form className="topbar-search" onSubmit={handleBuscaGlobal}>
          <input
            type="text"
            placeholder="O que você procura? (Ex.: cimento, rejunte, marca...)"
            value={buscaRapida}
            onChange={(e) => setBuscaRapida(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <div className="topbar-user">
          <div className="user-badge">
            <span className="user-avatar">{usuarioLogado.charAt(0).toUpperCase()}</span>
            <span>Olá, <strong>{usuarioLogado}</strong></span>
          </div>
          <button type="button" className="btn-logout" onClick={handleSair}>
            Sair
          </button>
        </div>
      </header>

      <div className="app-body">
        {!menuRecolhido && (
          <button type="button" className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMenuRecolhido(true)} />
        )}
        <aside id="menu-operacional" aria-label="Menu operacional" className={`sidebar ${menuRecolhido ? 'collapsed' : ''}`}>
          <div>
            <div className="sidebar-top-title">
              <span>{menuRecolhido ? 'MR' : 'Menu Operacional'}</span>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <span>{menuRecolhido ? 'PROD' : 'PRODUTO & ESTOQUE'}</span>
              </div>
              <NavLink to="/produtos/novo" title="Cadastrar Produto" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Cadastrar</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
              <NavLink to="/produtos" end title="Consultar Estoque" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="2" width="8" height="4" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <line x1="9" y1="12" x2="15" y2="12" />
                      <line x1="9" y1="16" x2="15" y2="16" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Consultar</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <span>{menuRecolhido ? 'CLI' : 'CLIENTES'}</span>
              </div>
              <NavLink to="/clientes/novo" title="Cadastrar Cliente" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Cadastrar</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
              <NavLink to="/clientes" end title="Consultar Clientes" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Consultar</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <span>{menuRecolhido ? 'PDV' : 'ORÇAMENTO & PDV'}</span>
              </div>
              <NavLink to="/orcamentos" end title="Novo Orçamento" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Novo Orçamento</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
              <NavLink to="/orcamentos/consultar" title="Consultar Orçamentos" className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}>
                <span className="link-label-wrap">
                  <span className="nav-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  {!menuRecolhido && <span>Consultar</span>}
                </span>
                {!menuRecolhido && <span>&rsaquo;</span>}
              </NavLink>
            </div>
          </div>

          {!menuRecolhido && itensEstoqueBaixo > 0 && (
            <div className="sidebar-alert-box">
              <div className="alert-title-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Atencao no Estoque</span>
              </div>
              <span>{itensEstoqueBaixo} produto(s) no limite minimo.</span>
              <br />
              <Link to="/produtos">Verificar agora &rarr;</Link>
            </div>
          )}
        </aside>

        <div className="main-wrapper">
          <div className="breadcrumb-bar">
            <div className="breadcrumb-path">
              Portal MR &rsaquo; <strong>{trilhaAtual}</strong>
            </div>
            <div className="quick-actions">
              <Link to="/orcamentos" className="quick-pill">+ Novo Orçamento</Link>
              <Link to="/clientes/novo" className="quick-pill">+ Cliente</Link>
              <Link to="/produtos" className="quick-pill">Ver Estoque</Link>
            </div>
          </div>

          <main className="main-content">
            <Outlet />
          </main>

          <footer className="app-footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <strong>MR - MATERIAL DE CONSTRUÇÃO</strong> - Rua Floriano Peixoto, 1100 - Centro, Campina Grande - PB
              </div>
              <div className="footer-channels">
                <span>Central de Vendas: <strong>(83) 98855-8855</strong></span>
                <span>SAC / Ouvidoria: <strong>0800 704 8383</strong></span>
                <span>&copy; 2026 MR Construção</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
