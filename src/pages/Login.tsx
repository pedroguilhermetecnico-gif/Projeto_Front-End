import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';

export default function Login() {
  const { usuarioLogado, login } = useStore();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  if (usuarioLogado) {
    return <Navigate to="/produtos/novo" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');

    const sucesso = login(usuario, senha);
    if (sucesso) {
      navigate('/produtos/novo');
    } else {
      setErro('Informe um usuário e senha válidos (mínimo de 3 caracteres).');
    }
  }

  return (
    <div className="login-page">
      {/* Painel Institucional (Inspirado em Melnick / VM Construções) */}
      <section className="login-showcase">
        <div className="showcase-badge">Portal Corporativo • PDV & Estoque</div>

        <div className="showcase-content">
          <h2>
            Tudo para <span>construção</span> e reforma em um só sistema.
          </h2>
          <p>
            Plataforma integrada da MR Material de Construção para gestão ágil de balcão,
            controle de inventário em tempo real e emissão instantânea de orçamentos.
          </p>

          <div className="showcase-metrics">
            <div className="metric-item">
              <strong>100% SPA</strong>
              <span>Navegação sem recarregamento</span>
            </div>
            <div className="metric-item">
              <strong>PDV Ágil</strong>
              <span>Orçamento e recibo direto</span>
            </div>
            <div className="metric-item">
              <strong>Estoque</strong>
              <span>Monitoramento automático</span>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          MR - Material de Construção • Rua Floriano Peixoto, 1100 - Centro, Campina Grande - PB
        </div>
      </section>

      {/* Área de Autenticação */}
      <section className="login-form-area">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand-row">
              <div className="brand-mark">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M4 18V7L12 13L20 7V18" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 11L12 5L20 11" stroke="#f8a63e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1>MR CONSTRUÇÃO</h1>
                <p>Um jeito fácil de construir barato</p>
              </div>
            </div>
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="usuario-input">Usuário ou Matrícula</label>
              <input
                id="usuario-input"
                type="text"
                className="input-box"
                placeholder="Ex: Rafaela"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha-input">Senha de Acesso</label>
              <input
                id="senha-input"
                type="password"
                className="input-box"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '11px' }}>
              ENTRAR NO PAINEL
            </button>
          </form>

          <div className="login-hint">
            Acesso de demonstração: informe qualquer usuário e senha com 3 ou mais caracteres.
          </div>
        </div>
        <small className="login-author">Desenvolvido por Pedro Guiherme Lima Freire</small>
      </section>
    </div>
  );
}
