import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { useAtualizarProdutoMutation, useListarProdutosQuery } from '../services/api';
import type { ProdutoDTO } from '../types';

export default function ProdutoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: produtos = [], isLoading: isFetching } = useListarProdutosQuery();
  const [atualizarProduto, { isLoading: isUpdating }] = useAtualizarProdutoMutation();

  const produtoAtual = produtos.find((p) => String(p.id) === String(id));

  async function handleAtualizar(dados: ProdutoDTO) {
    if (!id) return;
    await atualizarProduto({ id, dados }).unwrap();
    navigate('/produtos');
  }

  if (isFetching) {
    return <div style={{ padding: '24px', color: '#00656b', fontWeight: 600 }}>Carregando dados do produto...</div>;
  }

  if (!produtoAtual) {
    return (
      <div>
        <h2 className="page-title">PRODUTO NAO ENCONTRADO</h2>
        <p style={{ marginBottom: '16px', color: '#64748b' }}>Nao localizamos o produto solicitado na base de dados.</p>
        <button type="button" className="btn-secondary" onClick={() => navigate('/produtos')}>
          Voltar ao Estoque
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
