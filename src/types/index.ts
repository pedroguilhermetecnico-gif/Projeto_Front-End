export interface Produto {
  id: string | number;
  codigo: string;
  codigoBarras: string;
  nome: string;
  marca: string;
  familia: string;
  precoVenda: number;
  estoqueAtual: number;
  minimoEstoque: number;
  unidade: string;
  validade?: string;
}

export type ProdutoDTO = Omit<Produto, 'id'>;

export interface AtualizarProdutoPayload {
  id: string | number;
  dados: ProdutoDTO;
}

export interface Cliente {
  id: string | number;
  nome: string;
  telefone: string;
  cpfCnpj?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  pontoReferencia: string;
}

export type ClienteDTO = Omit<Cliente, 'id'>;

export interface AtualizarClientePayload {
  id: string | number;
  dados: ClienteDTO;
}

export interface ItemOrcamento {
  produtoId: string | number;
  codigo: string;
  nomeProduto: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export type FormaPagamento = 'À Vista' | 'Parcelado' | 'Com Desconto';

export type StatusOrcamento = 'PENDENTE' | 'APROVADO';

export interface Orcamento {
  id: string | number;
  clienteId: string | number;
  clienteNome: string;
  vendedor: string;
  itens: ItemOrcamento[];
  formaPagamento: FormaPagamento;
  parcelas?: number;
  descontoPercentual?: number;
  subtotalBruto: number;
  valorTotal: number;
  status: StatusOrcamento;
  dataCriacao: string;
}

export type OrcamentoDTO = Omit<Orcamento, 'id' | 'dataCriacao'>;
