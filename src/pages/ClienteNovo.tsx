import { useNavigate } from 'react-router-dom';
import ClienteForm from '../components/clients/ClienteForm';
import { useCriarClienteMutation } from '../services/api';
import type { ClienteDTO } from '../types';

export default function ClienteNovo() {
  const navigate = useNavigate();
  const [criarCliente, { isLoading }] = useCriarClienteMutation();

  async function handleCriar(dados: ClienteDTO) {
    await criarCliente(dados).unwrap();
    navigate('/clientes');
  }

  return (
    <div>
      <h2 className="page-title">CADASTRAR NOVO CLIENTE</h2>
      <ClienteForm
        mode="create"
        onSubmit={handleCriar}
        isSubmitting={isLoading}
        onCancel={() => navigate('/clientes')}
      />
    </div>
  );
}
