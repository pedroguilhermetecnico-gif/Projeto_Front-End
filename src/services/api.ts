import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AtualizarClientePayload,
  AtualizarProdutoPayload,
  Cliente,
  ClienteDTO,
  ItemOrcamento,
  Orcamento,
  OrcamentoDTO,
  Produto,
  ProdutoDTO,
} from '../types';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://winnicius.com/tecinfo/labs/api-mr-construcao/api';

type RegistroBruto = Record<string, unknown>;

function extrairLista(resposta: unknown, chaveAlternativa: string): RegistroBruto[] {
  if (Array.isArray(resposta)) {
    return resposta as RegistroBruto[];
  }
  if (resposta && typeof resposta === 'object') {
    const obj = resposta as RegistroBruto;
    if (Array.isArray(obj.data)) return obj.data as RegistroBruto[];
    if (Array.isArray(obj[chaveAlternativa])) return obj[chaveAlternativa] as RegistroBruto[];
  }
  return [];
}

function normalizarProduto(raw: RegistroBruto): Produto {
  const id = (raw.id ?? raw._id ?? raw.codigo ?? Date.now()) as string | number;
  const codigoBarras = String(raw.codigoBarras ?? raw.ean13 ?? raw.codigo ?? id);
  const codigo = String(raw.codigo ?? codigoBarras);

  return {
    id,
    codigo,
    codigoBarras,
    nome: String(raw.nome ?? raw.descricao ?? 'Produto sem nome'),
    marca: String(raw.marca ?? 'Geral'),
    familia: String(raw.familia ?? raw.categoria ?? 'Alvenaria'),
    precoVenda: Number(raw.precoVenda ?? raw.valor ?? raw.preco ?? 0),
    estoqueAtual: Number(raw.estoqueAtual ?? raw.estoque ?? raw.quantidade ?? 0),
    minimoEstoque: Number(raw.minimoEstoque ?? raw.estoqueMinimo ?? 5),
    unidade: String(raw.unidade ?? raw.unidadeMedida ?? 'Unidade'),
    validade: raw.validade ? String(raw.validade) : undefined,
  };
}

function normalizarCliente(raw: RegistroBruto): Cliente {
  const id = (raw.id ?? raw._id ?? Date.now()) as string | number;
  const endereco = (raw.endereco && typeof raw.endereco === 'object' ? raw.endereco : {}) as RegistroBruto;

  return {
    id,
    nome: String(raw.nome ?? 'Cliente'),
    telefone: String(raw.telefone ?? raw.whatsapp ?? ''),
    cpfCnpj: raw.cpfCnpj ? String(raw.cpfCnpj) : undefined,
    rua: String(raw.rua ?? endereco.rua ?? ''),
    numero: String(raw.numero ?? endereco.numero ?? ''),
    bairro: String(raw.bairro ?? endereco.bairro ?? ''),
    cidade: String(raw.cidade ?? endereco.cidade ?? ''),
    cep: String(raw.cep ?? endereco.cep ?? ''),
    pontoReferencia: String(raw.pontoReferencia ?? raw.ponto_referencia ?? endereco.pontoReferencia ?? ''),
  };
}

function normalizarOrcamento(raw: RegistroBruto): Orcamento {
  const id = (raw.id ?? raw._id ?? Date.now()) as string | number;
  const itensBrutos = Array.isArray(raw.itens) ? (raw.itens as RegistroBruto[]) : [];

  const itens: ItemOrcamento[] = itensBrutos.map((item) => {
    const quantidade = Number(item.quantidade ?? 1);
    const valorUnitario = Number(item.valorUnitario ?? item.precoUnitario ?? 0);
    return {
      produtoId: (item.produtoId ?? item.id ?? 0) as string | number,
      codigo: String(item.codigo ?? ''),
      nomeProduto: String(item.nomeProduto ?? item.nome ?? 'Item'),
      unidade: String(item.unidade ?? 'Unidade'),
      quantidade,
      valorUnitario,
      subtotal: Number(item.subtotal ?? quantidade * valorUnitario),
    };
  });

  const valorTotal = Number(raw.valorTotal ?? raw.total ?? 0);

  return {
    id,
    clienteId: (raw.clienteId ?? '') as string | number,
    clienteNome: String(raw.clienteNome ?? raw.cliente ?? 'Cliente Balcao'),
    vendedor: String(raw.vendedor ?? 'Vendedor'),
    itens,
    formaPagamento: (raw.formaPagamento as Orcamento['formaPagamento']) || 'À Vista',
    parcelas: raw.parcelas ? Number(raw.parcelas) : undefined,
    descontoPercentual: raw.descontoPercentual ? Number(raw.descontoPercentual) : undefined,
    subtotalBruto: Number(raw.subtotalBruto ?? valorTotal),
    valorTotal,
    status: raw.status === 'APROVADO' ? 'APROVADO' : 'PENDENTE',
    dataCriacao: String(raw.dataCriacao ?? raw.createdAt ?? new Date().toLocaleDateString('pt-BR')),
  };
}

export const mrConstrucaoApi = createApi({
  reducerPath: 'mrConstrucaoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['Produtos', 'Clientes', 'Orcamentos'],
  endpoints: (builder) => ({
    // ================= MODULO A: PRODUTOS =================
    listarProdutos: builder.query<Produto[], void>({
      query: () => '/produtos',
      transformResponse: (resposta: unknown) =>
        extrairLista(resposta, 'produtos').map(normalizarProduto),
      providesTags: ['Produtos'],
    }),

    criarProduto: builder.mutation<Produto, ProdutoDTO>({
      query: (novoProduto) => ({
        url: '/produtos',
        method: 'POST',
        body: {
          ...novoProduto,
          valor: novoProduto.precoVenda,
          unidadeMedida: novoProduto.unidade,
        },
      }),
      transformResponse: (resposta: unknown) => {
        const obj = (resposta && typeof resposta === 'object' ? resposta : {}) as RegistroBruto;
        return normalizarProduto((obj.data as RegistroBruto) ?? obj);
      },
      invalidatesTags: ['Produtos'],
    }),

    atualizarProduto: builder.mutation<Produto, AtualizarProdutoPayload>({
      query: ({ id, dados }) => ({
        url: `/produtos/${id}`,
        method: 'PUT',
        body: {
          ...dados,
          valor: dados.precoVenda,
          unidadeMedida: dados.unidade,
        },
      }),
      transformResponse: (resposta: unknown) => {
        const obj = (resposta && typeof resposta === 'object' ? resposta : {}) as RegistroBruto;
        return normalizarProduto((obj.data as RegistroBruto) ?? obj);
      },
      invalidatesTags: ['Produtos'],
    }),

    deletarProduto: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/produtos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Produtos'],
    }),

    // ================= MODULO B: CLIENTES =================
    listarClientes: builder.query<Cliente[], void>({
      query: () => '/clientes',
      transformResponse: (resposta: unknown) =>
        extrairLista(resposta, 'clientes').map(normalizarCliente),
      providesTags: ['Clientes'],
    }),

    criarCliente: builder.mutation<Cliente, ClienteDTO>({
      query: (novoCliente) => ({
        url: '/clientes',
        method: 'POST',
        body: novoCliente,
      }),
      transformResponse: (resposta: unknown) => {
        const obj = (resposta && typeof resposta === 'object' ? resposta : {}) as RegistroBruto;
        return normalizarCliente((obj.data as RegistroBruto) ?? obj);
      },
      invalidatesTags: ['Clientes'],
    }),

    atualizarCliente: builder.mutation<Cliente, AtualizarClientePayload>({
      query: ({ id, dados }) => ({
        url: `/clientes/${id}`,
        method: 'PUT',
        body: dados,
      }),
      transformResponse: (resposta: unknown) => {
        const obj = (resposta && typeof resposta === 'object' ? resposta : {}) as RegistroBruto;
        return normalizarCliente((obj.data as RegistroBruto) ?? obj);
      },
      invalidatesTags: ['Clientes'],
    }),

    deletarCliente: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/clientes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clientes'],
    }),

    // ================= MODULO C: ORCAMENTOS =================
    listarOrcamentos: builder.query<Orcamento[], void>({
      query: () => '/orcamentos',
      transformResponse: (resposta: unknown) =>
        extrairLista(resposta, 'orcamentos').map(normalizarOrcamento),
      providesTags: ['Orcamentos'],
    }),

    criarOrcamento: builder.mutation<Orcamento, OrcamentoDTO>({
      query: (novoOrcamento) => ({
        url: '/orcamentos',
        method: 'POST',
        body: novoOrcamento,
      }),
      transformResponse: (resposta: unknown) => {
        const obj = (resposta && typeof resposta === 'object' ? resposta : {}) as RegistroBruto;
        return normalizarOrcamento((obj.data as RegistroBruto) ?? obj);
      },
      invalidatesTags: ['Orcamentos'],
    }),
  }),
});

export const {
  useListarProdutosQuery,
  useCriarProdutoMutation,
  useAtualizarProdutoMutation,
  useDeletarProdutoMutation,
  useListarClientesQuery,
  useCriarClienteMutation,
  useAtualizarClienteMutation,
  useDeletarClienteMutation,
  useListarOrcamentosQuery,
  useCriarOrcamentoMutation,
} = mrConstrucaoApi;
