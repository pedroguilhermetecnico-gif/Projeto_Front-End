import { useNavigate, useParams } from 'react-router-dom';
import ClienteForm from '../components/clients/ClienteForm';
import { useAtualizarClienteMutation, useListarClientesQuery } from '../services/api';
import type { ClienteDTO } from '../types';

export default function ClienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: clientes = [], isLoading: isFetching, isError, refetch } = useListarClientesQuery();
  const [atualizarCliente, { isLoading: isUpdating }] = useAtualizarClienteMutation();

  const clienteAtual = clientes.find((c) => String(c.id) === String(id));

  async function handleAtualizar(dados: ClienteDTO) {
    if (!id) return;
    await atualizarCliente({ id, dados }).unwrap();
    navigate('/clientes');
  }

  if (isFetching) {
    return <div style={{ padding: '24px', color: '#00656b', fontWeight: 600 }}>Carregando dados do cliente...</div>;
  }

  if (isError) {
    return (
      <div>
        <h2 className="page-title">NAO FOI POSSIVEL CARREGAR O CLIENTE</h2>
        <p role="alert" style={{ marginBottom: '16px', color: '#64748b' }}>
          Ocorreu um erro ao consultar a API. Isso nao confirma que o cliente nao exista.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary" onClick={() => refetch()}>
            Tentar novamente
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/clientes')}>
            Voltar para Clientes
          </button>
        </div>
      </div>
    );
  }

  if (!clienteAtual) {
    return (
      <div>
        <h2 className="page-title">CLIENTE NAO ENCONTRADO</h2>
        <button type="button" className="btn-secondary" onClick={() => navigate('/clientes')}>
          Voltar para Clientes
        </button>
      </div>
    );
  }

  const valoresIniciais: ClienteDTO = {
    nome: clienteAtual.nome,
    telefone: clienteAtual.telefone,
    cpfCnpj: clienteAtual.cpfCnpj,
    rua: clienteAtual.rua,
    numero: clienteAtual.numero,
    bairro: clienteAtual.bairro,
    cidade: clienteAtual.cidade,
    cep: clienteAtual.cep,
    pontoReferencia: clienteAtual.pontoReferencia,
  };

  return (
    <div>
      <h2 className="page-title">EDITAR CLIENTE: {clienteAtual.nome}</h2>
      <ClienteForm
        mode="edit"
        initialValues={valoresIniciais}
        onSubmit={handleAtualizar}
        isSubmitting={isUpdating}
        onCancel={() => navigate('/clientes')}
      />
    </div>
  );
}
