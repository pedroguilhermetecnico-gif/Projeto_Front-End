import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { useCriarProdutoMutation } from '../services/api';
import type { ProdutoDTO } from '../types';

export default function ProdutoNovo() {
  const navigate = useNavigate();
  const [criarProduto, { isLoading }] = useCriarProdutoMutation();

  async function handleCriar(dados: ProdutoDTO) {
    await criarProduto(dados).unwrap();
    navigate('/produtos');
  }

  return (
    <div>
      <h2 className="page-title">CADASTRAR NOVO PRODUTO</h2>
      <ProductForm
        mode="create"
        onSubmit={handleCriar}
        isSubmitting={isLoading}
        onCancel={() => navigate('/produtos')}
      />
    </div>
  );
}
