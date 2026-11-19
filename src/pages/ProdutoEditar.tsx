import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { useAtualizarProdutoMutation, useListarProdutosQuery } from '../services/api';
import type { ProdutoDTO } from '../types';

export default function ProdutoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: produtos = [],
    isLoading: isFetching,
    isError,
    refetch,
  } = useListarProdutosQuery();

  const [atualizarProduto, { isLoading: isUpdating }] = useAtualizarProdutoMutation();
  const produtoAtual = produtos.find((produto) => String(produto.id) === String(id));

  async function handleAtualizar(dados: ProdutoDTO) {
    if (!id) throw new Error('Identificador do produto não informado.');
    await atualizarProduto({ id, dados }).unwrap();
    navigate('/produtos');
  }

  if (isFetching) {
    return (
      <div style={{ padding: '24px', color: '#00656b', fontWeight: 600 }}>
        Carregando dados do produto...
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h2 className="page-title">NÃO FOI POSSÍVEL CARREGAR O PRODUTO</h2>
        <p style={{ marginBottom: '16px', color: '#64748b' }}>
          Ocorreu um erro ao consultar a API. Isso não significa que o produto não exista.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            Tentar novamente
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/produtos')}>
            Voltar ao estoque
          </button>
        </div>
      </div>
    );
  }

  if (!produtoAtual) {
    return (
      <div>
        <h2 className="page-title">PRODUTO NÃO ENCONTRADO</h2>
        <p style={{ marginBottom: '16px', color: '#64748b' }}>
          Não localizamos o produto solicitado na lista retornada pela API.
        </p>
        <button type="button" className="btn-secondary" onClick={() => navigate('/produtos')}>
          Voltar ao estoque
        </button>
      </div>
    );
  }

  const valoresIniciais: ProdutoDTO = {
    codigo: produtoAtual.codigo,
    codigoBarras: produtoAtual.codigoBarras,
    nome: produtoAtual.nome,
    marca: produtoAtual.marca,
    familia: produtoAtual.familia,
    precoVenda: produtoAtual.precoVenda,
    estoqueAtual: produtoAtual.estoqueAtual,
    minimoEstoque: produtoAtual.minimoEstoque,
    unidade: produtoAtual.unidade,
    validade: produtoAtual.validade,
  };

  return (
    <div>
      <h2 className="page-title">EDITAR PRODUTO #{produtoAtual.codigoBarras || produtoAtual.id}</h2>
      <ProductForm
        mode="edit"
        initialValues={valoresIniciais}
        onSubmit={handleAtualizar}
        isSubmitting={isUpdating}
        onCancel={() => navigate('/produtos')}
      />
    </div>
  );
}
