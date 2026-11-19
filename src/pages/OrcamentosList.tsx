import { Link } from 'react-router-dom';
import { useListarOrcamentosQuery } from '../services/api';

export default function OrcamentosList() {
  const { data: orcamentos = [], isLoading, isError, refetch } = useListarOrcamentosQuery();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="page-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          HISTORICO DE ORCAMENTOS E VENDAS
        </h2>
        <Link to="/orcamentos" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Novo Orcamento
        </Link>
      </div>

      {isLoading && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#00656b', fontWeight: 600 }}>
          Carregando orcamentos da API...
        </div>
      )}

      {isError && (
        <div className="login-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Erro ao carregar o historico de orcamentos.</span>
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
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Nenhum orcamento registrado ate o momento.
                  </td>
                </tr>
              ) : (
                orcamentos.map((orc) => (
                  <tr key={orc.id}>
                    <td><strong>#{orc.id}</strong></td>
                    <td>{orc.dataCriacao}</td>
                    <td>{orc.clienteNome}</td>
                    <td>{orc.vendedor}</td>
                    <td>
                      {orc.formaPagamento}
                      {orc.parcelas ? ` (${orc.parcelas}x)` : ''}
                    </td>
                    <td>
                      <span className={orc.status === 'APROVADO' ? 'badge-normal' : 'badge-baixo'}>
                        {orc.status}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {orc.valorTotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </strong>
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
