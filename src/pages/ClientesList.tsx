import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeletarClienteMutation, useListarClientesQuery } from '../services/api';

export default function ClientesList() {
  const { data: clientes = [], isLoading, isError, refetch } = useListarClientesQuery();
  const [deletarCliente, { isLoading: isDeleting }] = useDeletarClienteMutation();

  const [busca, setBusca] = useState('');
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.telefone.toLowerCase().includes(termo) ||
      c.bairro.toLowerCase().includes(termo) ||
      c.cidade.toLowerCase().includes(termo) ||
      c.pontoReferencia.toLowerCase().includes(termo)
    );
  });

  async function handleExcluir(id: string | number, nome: string) {
    const confirmar = window.confirm(`Deseja realmente excluir o cliente "${nome}"?`);
    if (!confirmar) return;

    try {
      await deletarCliente(id).unwrap();
      setMensagemFeedback(`Cliente "${nome}" removido com sucesso.`);
    } catch {
      alert('Erro ao excluir o cliente na API.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="page-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          BASE DE CLIENTES E ENDERECOS
        </h2>
        <Link to="/clientes/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Cadastrar Cliente
        </Link>
      </div>

      {mensagemFeedback && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
          {mensagemFeedback}
        </div>
      )}

      <div className="fieldset-box" style={{ marginBottom: '16px' }}>
        <div className="form-group">
          <label htmlFor="busca-cli">Pesquisar por Nome, Telefone, Bairro, Cidade ou Ponto de Referencia</label>
          <input
            id="busca-cli"
            type="text"
            className="input-box"
            placeholder="Digite para filtrar clientes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#00656b', fontWeight: 600 }}>
          Carregando clientes da API...
        </div>
      )}

      {isError && (
        <div className="login-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Erro ao carregar clientes da API.</span>
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
                <th>Nome do Cliente</th>
                <th>Telefone / WhatsApp</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Ponto de Referencia</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <strong>{cliente.nome}</strong>
                      {cliente.rua && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {cliente.rua}, {cliente.numero}
                        </div>
                      )}
                    </td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.bairro}</td>
                    <td>{cliente.cidade}</td>
                    <td>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {cliente.pontoReferencia}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Link
                          to={`/clientes/${cliente.id}`}
                          style={{ color: '#00656b', fontWeight: 700, textDecoration: 'none' }}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleExcluir(cliente.id, cliente.nome)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
