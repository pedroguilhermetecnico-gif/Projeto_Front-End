import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useDeletarProdutoMutation, useListarProdutosQuery } from '../services/api';

export default function ProdutosList() {
  const { buscaGlobal, setBuscaGlobal } = useStore();
  const { data: produtos = [], isLoading, isError, refetch } = useListarProdutosQuery();
  const [deletarProduto, { isLoading: isDeleting }] = useDeletarProdutoMutation();

  const filtroTexto = buscaGlobal;
  const [filtroAlerta, setFiltroAlerta] = useState('TODOS');
  const [mensagemFeedback, setMensagemFeedback] = useState('');


  const produtosFiltrados = produtos.filter((p) => {
    const termo = filtroTexto.toLowerCase();
    const bateTexto =
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      p.codigoBarras.toLowerCase().includes(termo) ||
      p.marca.toLowerCase().includes(termo) ||
      p.familia.toLowerCase().includes(termo);

    const estoqueBaixo = p.estoqueAtual <= p.minimoEstoque;
    const bateAlerta =
      filtroAlerta === 'TODOS' ||
      (filtroAlerta === 'BAIXO' && estoqueBaixo) ||
      (filtroAlerta === 'NORMAL' && !estoqueBaixo);

    return bateTexto && bateAlerta;
  });

  async function handleExcluir(id: string | number, nome: string) {
    const confirmar = window.confirm(`Deseja realmente excluir o produto "${nome}"?`);
    if (!confirmar) return;

    try {
      await deletarProduto(id).unwrap();
      setMensagemFeedback(`Produto "${nome}" removido com sucesso.`);
    } catch {
      alert('Erro ao excluir o produto na API. Tente novamente.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="page-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          ESTOQUE / PRODUTOS
        </h2>
        <Link to="/produtos/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Cadastrar Produto
        </Link>
      </div>

      {mensagemFeedback && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
          {mensagemFeedback}
        </div>
      )}

      <div className="fieldset-box" style={{ marginBottom: '16px' }}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2, minWidth: '220px' }}>
            <label htmlFor="busca-prod">Nome / Codigo / EAN-13 / Marca</label>
            <input
              id="busca-prod"
              type="text"
              className="input-box"
              placeholder="Pesquisar produto..."
              value={filtroTexto}
              onChange={(e) => setBuscaGlobal(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="filtro-alerta">Status de Estoque</label>
            <select
              id="filtro-alerta"
              className="input-box"
              value={filtroAlerta}
              onChange={(e) => setFiltroAlerta(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="NORMAL">Normal</option>
              <option value="BAIXO">Estoque Baixo</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#00656b', fontWeight: 600 }}>
          Carregando produtos da API...
        </div>
      )}

      {isError && (
        <div className="login-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Erro ao carregar produtos da API. Verifique sua conexao com o servidor.</span>
          <button type="button" className="btn-secondary" onClick={() => refetch()}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nome do Produto</th>
                <th>Marca</th>
                <th>Preco de Venda</th>
                <th>Estoque Atual</th>
                <th>Unidade</th>
                <th>Alerta</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => {
                  const isBaixo = produto.estoqueAtual <= produto.minimoEstoque;
                  return (
                    <tr key={produto.id}>
                      <td><strong>{produto.codigoBarras || produto.codigo}</strong></td>
                      <td>
                        <div>{produto.nome}</div>
                        <small style={{ color: '#64748b' }}>{produto.familia}</small>
                      </td>
                      <td>{produto.marca}</td>
                      <td>
                        <strong>
                          {produto.precoVenda.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </strong>
                      </td>
                      <td>{produto.estoqueAtual}</td>
                      <td>{produto.unidade}</td>
                      <td>
                        <span className={isBaixo ? 'badge-baixo' : 'badge-normal'}>
                          {isBaixo ? 'BAIXO' : 'NORMAL'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <Link
                            to={`/produtos/${produto.id}`}
                            style={{ color: '#00656b', fontWeight: 700, textDecoration: 'none' }}
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleExcluir(produto.id, produto.nome)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
