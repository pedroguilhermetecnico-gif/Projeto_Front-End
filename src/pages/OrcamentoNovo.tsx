import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  useCriarOrcamentoMutation,
  useListarClientesQuery,
  useListarProdutosQuery,
} from '../services/api';
import type { FormaPagamento, ItemOrcamento, Orcamento, StatusOrcamento } from '../types';

export default function OrcamentoNovo() {
  const { usuarioLogado } = useStore();
  const { data: clientes = [], isLoading: loadingClientes } = useListarClientesQuery();
  const { data: produtos = [], isLoading: loadingProdutos } = useListarProdutosQuery();
  const [criarOrcamento, { isLoading: salvandoOrcamento }] = useCriarOrcamentoMutation();

  const [clienteId, setClienteId] = useState<string>('');
  const [vendedor, setVendedor] = useState<string>(usuarioLogado ?? '');
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('À Vista');
  const [parcelas, setParcelas] = useState<number>(2);
  const [descontoPercentual, setDescontoPercentual] = useState<number>(5);
  const [statusInicial, setStatusInicial] = useState<StatusOrcamento>('PENDENTE');

  const [erro, setErro] = useState('');
  const [orcamentoGerado, setOrcamentoGerado] = useState<Orcamento | null>(null);

  const produtoAtual = produtos.find((p) => String(p.id) === produtoSelecionadoId);
  const subtotalPrevio = produtoAtual ? produtoAtual.precoVenda * quantidade : 0;

  const subtotalBruto = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const valorDesconto =
    formaPagamento === 'Com Desconto' ? subtotalBruto * (descontoPercentual / 100) : 0;
  const valorTotal = Math.max(0, subtotalBruto - valorDesconto);

  function handleAdicionarItem() {
    setErro('');
    if (!produtoAtual) {
      setErro('Selecione um produto do estoque antes de adicionar.');
      return;
    }
    if (quantidade <= 0) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    setItens((prev) => {
      const existente = prev.find((i) => String(i.produtoId) === String(produtoAtual.id));
      if (existente) {
        return prev.map((i) => {
          if (String(i.produtoId) === String(produtoAtual.id)) {
            const novaQtd = i.quantidade + quantidade;
            return {
              ...i,
              quantidade: novaQtd,
              subtotal: novaQtd * i.valorUnitario,
            };
          }
          return i;
        });
      }

      return [
        ...prev,
        {
          produtoId: produtoAtual.id,
          codigo: produtoAtual.codigoBarras || produtoAtual.codigo,
          nomeProduto: produtoAtual.nome,
          unidade: produtoAtual.unidade,
          quantidade,
          valorUnitario: produtoAtual.precoVenda,
          subtotal: quantidade * produtoAtual.precoVenda,
        },
      ];
    });

    setProdutoSelecionadoId('');
    setQuantidade(1);
  }

  function handleRemoverItem(produtoId: string | number) {
    setItens((prev) => prev.filter((item) => String(item.produtoId) !== String(produtoId)));
  }

  async function handleFinalizarOrcamento(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (!clienteId) {
      setErro('Selecione o cliente comprador.');
      return;
    }
    if (!vendedor.trim()) {
      setErro('Informe o nome do vendedor responsavel.');
      return;
    }
    if (itens.length === 0) {
      setErro('Adicione pelo menos um produto ao orcamento.');
      return;
    }

    const clienteObj = clientes.find((c) => String(c.id) === clienteId);

    try {
      const criado = await criarOrcamento({
        clienteId,
        clienteNome: clienteObj?.nome ?? 'Cliente',
        vendedor: vendedor.trim(),
        itens,
        formaPagamento,
        parcelas: formaPagamento === 'Parcelado' ? parcelas : undefined,
        descontoPercentual: formaPagamento === 'Com Desconto' ? descontoPercentual : undefined,
        subtotalBruto,
        valorTotal,
        status: statusInicial,
      }).unwrap();

      setOrcamentoGerado({
        ...criado,
        clienteNome: clienteObj?.nome ?? criado.clienteNome,
        vendedor: vendedor.trim(),
        itens,
        formaPagamento,
        parcelas: formaPagamento === 'Parcelado' ? parcelas : undefined,
        descontoPercentual: formaPagamento === 'Com Desconto' ? descontoPercentual : undefined,
        subtotalBruto,
        valorTotal,
        status: statusInicial,
      });

      setItens([]);
    } catch {
      setErro('Erro ao registrar orcamento na API. Verifique a conexao e tente novamente.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="page-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          EMISSAO DE ORCAMENTO &amp; PDV
        </h2>
        <Link to="/orcamentos/consultar" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Historico de Orcamentos
        </Link>
      </div>

      {erro && <div className="login-error">{erro}</div>}

      {/* Espelho do Pedido Gerado */}
      {orcamentoGerado && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderLeft: '5px solid #16a34a',
            borderRadius: '8px',
            padding: '18px 20px',
            marginBottom: '22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <strong style={{ color: '#14532d', fontSize: '1rem' }}>
                ESPELHO DO PEDIDO #{orcamentoGerado.id} GERADO COM SUCESSO
              </strong>
              <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                Cliente: <strong>{orcamentoGerado.clienteNome}</strong> &bull; Vendedor: <strong>{orcamentoGerado.vendedor}</strong>
              </div>
            </div>
            <span
              style={{
                backgroundColor: orcamentoGerado.status === 'APROVADO' ? '#166534' : '#d97706',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '14px',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              STATUS: {orcamentoGerado.status}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '12px' }}>
            Pagamento: <strong>{orcamentoGerado.formaPagamento}</strong>
            {orcamentoGerado.formaPagamento === 'Parcelado' && ` (${orcamentoGerado.parcelas}x)`}
            {orcamentoGerado.formaPagamento === 'Com Desconto' && ` (${orcamentoGerado.descontoPercentual}% OFF)`}
            {' | '}
            Total Fechado:{' '}
            <strong style={{ fontSize: '1rem', color: '#002541' }}>
              {orcamentoGerado.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              Imprimir Comprovante
            </button>
            <button type="button" className="btn-secondary" onClick={() => setOrcamentoGerado(null)}>
              Fechar Espelho
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleFinalizarOrcamento} className="form-grid">
        {/* 1. Cliente e Vendedor */}
        <div className="fieldset-box">
          <div className="fieldset-title">1. Identificacao do Atendimento</div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2, minWidth: '240px' }}>
              <label htmlFor="orc-cliente">Cliente Comprador *</label>
              <select
                id="orc-cliente"
                className="input-box"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                disabled={loadingClientes}
              >
                <option value="">
                  {loadingClientes ? 'Carregando clientes...' : 'Selecione o cliente...'}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nome} — {c.bairro} ({c.cidade})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
              <label htmlFor="orc-vendedor">Vendedor Responsavel *</label>
              <input
                id="orc-vendedor"
                type="text"
                className="input-box"
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
              <label htmlFor="orc-status">Status Inicial</label>
              <select
                id="orc-status"
                className="input-box"
                value={statusInicial}
                onChange={(e) => setStatusInicial(e.target.value as StatusOrcamento)}
              >
                <option value="PENDENTE">PENDENTE</option>
                <option value="APROVADO">APROVADO</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Grade Dinamica de Itens */}
        <div className="fieldset-box">
          <div className="fieldset-title">2. Adicionar Produtos ao Pedido</div>
          <div className="form-row" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 3, minWidth: '240px' }}>
              <label htmlFor="orc-produto">Produto em Estoque</label>
              <select
                id="orc-produto"
                className="input-box"
                value={produtoSelecionadoId}
                onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                disabled={loadingProdutos}
              >
                <option value="">
                  {loadingProdutos ? 'Carregando produtos...' : 'Selecione um material...'}
                </option>
                {produtos.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nome} ({p.marca}) —{' '}
                    {p.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {p.unidade} (Est: {p.estoqueAtual})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ width: '110px' }}>
              <label htmlFor="orc-qtd">Quantidade</label>
              <input
                id="orc-qtd"
                type="number"
                min="1"
                className="input-box"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ minWidth: '140px' }}>
              <label>Subtotal Item</label>
              <div className="input-box" style={{ backgroundColor: '#eef2f6', fontWeight: 700, color: '#002541' }}>
                {subtotalPrevio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={handleAdicionarItem}>
              + Adicionar Item
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Produto</th>
                  <th>Unidade</th>
                  <th>Qtd.</th>
                  <th>Valor Unitario</th>
                  <th>Subtotal</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '18px', color: '#64748b' }}>
                      Nenhum item adicionado ao orcamento ainda.
                    </td>
                  </tr>
                ) : (
                  itens.map((item) => (
                    <tr key={item.produtoId}>
                      <td>{item.codigo}</td>
                      <td><strong>{item.nomeProduto}</strong></td>
                      <td>{item.unidade}</td>
                      <td>{item.quantidade}</td>
                      <td>
                        {item.valorUnitario.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td>
                        <strong>
                          {item.subtotal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(item.produtoId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Pagamento e Calculo Consolidado */}
        <div className="fieldset-box">
          <div className="fieldset-title">3. Condicao de Pagamento e Fechamento</div>
          <div className="form-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ minWidth: '180px' }}>
                <label htmlFor="orc-pgto">Forma de Pagamento</label>
                <select
                  id="orc-pgto"
                  className="input-box"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                >
                  <option value="À Vista">A Vista</option>
                  <option value="Parcelado">Parcelado (1x a 10x)</option>
                  <option value="Com Desconto">Com Desconto</option>
                </select>
              </div>

              {formaPagamento === 'Parcelado' && (
                <div className="form-group" style={{ minWidth: '170px' }}>
                  <label htmlFor="orc-parcelas">Numero de Parcelas</label>
                  <select
                    id="orc-parcelas"
                    className="input-box"
                    value={parcelas}
                    onChange={(e) => setParcelas(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}x de{' '}
                        {(valorTotal / n).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formaPagamento === 'Com Desconto' && (
                <div className="form-group" style={{ width: '140px' }}>
                  <label htmlFor="orc-desc">Desconto (%)</label>
                  <input
                    id="orc-desc"
                    type="number"
                    min="1"
                    max="50"
                    className="input-box"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: '#002541',
                color: '#ffffff',
                padding: '14px 22px',
                borderRadius: '8px',
                borderBottom: '3px solid #f8a63e',
                textAlign: 'right',
                minWidth: '240px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Subtotal: {subtotalBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                {valorDesconto > 0 &&
                  ` | Desconto: -${valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
              </div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>
                Valor Total do Pedido
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8a63e' }}>
                {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button type="submit" className="btn-primary" disabled={salvandoOrcamento} style={{ padding: '12px 32px', fontSize: '0.92rem' }}>
            {salvandoOrcamento ? 'GRAVANDO ORCAMENTO...' : 'FINALIZAR E GRAVAR ORCAMENTO'}
          </button>
        </div>
      </form>
    </div>
  );
}
