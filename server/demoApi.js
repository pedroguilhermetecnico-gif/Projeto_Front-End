const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_SESSIONS = 500;
const MAX_RECORDS_PER_RESOURCE = 1000;
const MAX_BODY_BYTES = 1024 * 1024;
const sessions = new Map();

function json(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

function cleanExpiredSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions) {
    if (session.updatedAt < cutoff) sessions.delete(id);
  }
}

function getSession(request) {
  const sessionId = request.headers['x-demo-session'];
  if (typeof sessionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    throw error(401, 'Sessão de demonstração ausente. Saia e entre novamente.');
  }
  cleanExpiredSessions();
  let session = sessions.get(sessionId);
  if (!session) {
    if (sessions.size >= MAX_SESSIONS) throw error(503, 'Limite temporário de sessões atingido.');
    session = { produtos: new Map(), clientes: new Map(), orcamentos: new Map(), nextId: 1, updatedAt: Date.now() };
    sessions.set(sessionId, session);
  }
  session.updatedAt = Date.now();
  return { sessionId, session };
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw error(413, 'A solicitação excedeu o limite de 1 MB.');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw error(400, 'O corpo da solicitação não contém JSON válido.');
  }
}

function requiredText(data, key, label) {
  if (typeof data[key] !== 'string' || !data[key].trim()) throw error(422, `${label} é obrigatório.`);
}

function finiteNumber(data, key, label, minimum = 0) {
  const value = Number(data[key]);
  if (!Number.isFinite(value) || value < minimum) throw error(422, `${label} deve ser um número válido.`);
  return value;
}

function isValidDateBR(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function validateProduct(data) {
  requiredText(data, 'nome', 'Nome do produto');
  requiredText(data, 'codigoBarras', 'Código de barras');
  requiredText(data, 'marca', 'Marca');
  requiredText(data, 'familia', 'Família');
  requiredText(data, 'unidade', 'Unidade');
  const produto = {
    ...data,
    codigo: String(data.codigo ?? data.codigoBarras).trim(),
    codigoBarras: String(data.codigoBarras).trim(),
    nome: data.nome.trim(),
    marca: data.marca.trim(),
    familia: data.familia.trim(),
    unidade: data.unidade.trim(),
    precoVenda: finiteNumber(data, 'precoVenda', 'Preço de venda', 0.01),
    estoqueAtual: finiteNumber(data, 'estoqueAtual', 'Estoque atual'),
    minimoEstoque: finiteNumber(data, 'minimoEstoque', 'Estoque mínimo'),
    validade: String(data.validade ?? '').trim(),
  };
  if (!Number.isInteger(produto.estoqueAtual) || !Number.isInteger(produto.minimoEstoque)) {
    throw error(422, 'Os valores de estoque devem ser inteiros.');
  }
  if (produto.validade && !isValidDateBR(produto.validade)) {
    throw error(422, 'A validade deve ser uma data real no formato DD/MM/YYYY.');
  }
  return produto;
}

function validateClient(data) {
  for (const [key, label] of [['nome','Nome'],['telefone','Telefone'],['rua','Rua'],['numero','Número'],['bairro','Bairro'],['cidade','Cidade'],['pontoReferencia','Ponto de referência']]) {
    requiredText(data, key, label);
  }
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
}

function validateQuote(data, session) {
  requiredText(data, 'clienteNome', 'Cliente');
  requiredText(data, 'vendedor', 'Vendedor');
  if (!['À Vista', 'Parcelado', 'Com Desconto'].includes(data.formaPagamento)) throw error(422, 'Forma de pagamento inválida.');
  if (!['PENDENTE', 'APROVADO'].includes(data.status)) throw error(422, 'Status inválido.');
  if (!Array.isArray(data.itens) || data.itens.length === 0) throw error(422, 'O orçamento precisa ter ao menos um item.');
  for (const item of data.itens) {
    const quantidade = Number(item.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) throw error(422, 'Cada item precisa ter quantidade maior que zero.');
    const produto = session.produtos.get(String(item.produtoId));
    if (!produto) throw error(422, `Produto ${item.nomeProduto ?? ''} não existe nesta sessão.`);
    const quantidadeNoOrcamento = data.itens
      .filter((outro) => String(outro.produtoId) === String(item.produtoId))
      .reduce((total, outro) => total + Number(outro.quantidade), 0);
    if (quantidadeNoOrcamento > produto.estoqueAtual) throw error(409, `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoqueAtual}.`);
  }
  const subtotalBruto = finiteNumber(data, 'subtotalBruto', 'Subtotal');
  const valorTotal = finiteNumber(data, 'valorTotal', 'Valor total');
  if (data.formaPagamento === 'Parcelado' && (!Number.isInteger(Number(data.parcelas)) || Number(data.parcelas) < 1 || Number(data.parcelas) > 10)) {
    throw error(422, 'O parcelamento deve conter de 1 a 10 parcelas.');
  }
  if (data.formaPagamento === 'Com Desconto' && (!Number.isFinite(Number(data.descontoPercentual)) || Number(data.descontoPercentual) < 1 || Number(data.descontoPercentual) > 50)) {
    throw error(422, 'O desconto deve estar entre 1% e 50%.');
  }
  return { ...data, subtotalBruto, valorTotal };
}

function applyCors(request, response) {
  const configured = (process.env.DEMO_ALLOWED_ORIGINS ?? '*').split(',').map((item) => item.trim()).filter(Boolean);
  const origin = request.headers.origin;
  if (configured.includes('*')) response.setHeader('Access-Control-Allow-Origin', '*');
  else if (origin && configured.includes(origin)) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Demo-Session');
}

export function createDemoApiHandler() {
  return async function handleDemoApi(request, response) {
    applyCors(request, response);
    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.end();
      return;
    }
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const pathname = url.pathname.replace(/\/$/, '') || '/';
      if (pathname === '/api/health' && request.method === 'GET') {
        return json(response, 200, { status: 'ok', storage: 'memory' });
      }
      if (pathname === '/api/session' && request.method === 'DELETE') {
        const id = request.headers['x-demo-session'];
        if (typeof id === 'string') sessions.delete(id);
        return json(response, 200, { cleared: true });
      }
      const route = /^\/api\/(produtos|clientes|orcamentos)(?:\/([^/]+))?$/.exec(pathname);
      if (!route) return json(response, 404, { message: 'Rota da API não encontrada.' });
      const [, resource, encodedId] = route;
      const { session } = getSession(request);
      const records = session[resource];
      const id = encodedId ? decodeURIComponent(encodedId) : undefined;
      if (request.method === 'GET') {
        return json(response, 200, id ? (records.has(id) ? { data: records.get(id) } : { message: 'Registro não encontrado.' }) : [...records.values()]);
      }
      if (request.method === 'POST' && !id) {
        const body = await readJson(request);
        if (records.size >= MAX_RECORDS_PER_RESOURCE) throw error(503, 'Limite de registros temporários atingido para esta sessão.');
        const value = resource === 'produtos' ? validateProduct(body)
          : resource === 'clientes' ? validateClient(body)
            : validateQuote(body, session);
        if (resource === 'orcamentos' && !session.clientes.has(String(value.clienteId))) {
          throw error(422, 'O cliente selecionado não existe nesta sessão.');
        }
        const record = { ...value, id: session.nextId++ };
        if (resource === 'orcamentos') record.dataCriacao = new Date().toLocaleDateString('pt-BR');
        records.set(String(record.id), record);
        return json(response, 201, { data: record });
      }
      if (request.method === 'PUT' && id && resource !== 'orcamentos') {
        const previous = records.get(id);
        if (!previous) throw error(404, 'Registro não encontrado.');
        const body = await readJson(request);
        const merged = { ...previous, ...body, id: previous.id };
        const value = resource === 'produtos' ? validateProduct(merged) : validateClient(merged);
        const record = { ...value, id: previous.id };
        records.set(id, record);
        return json(response, 200, { data: record });
      }
      if (request.method === 'DELETE' && id && resource !== 'orcamentos') {
        if (!records.has(id)) throw error(404, 'Registro não encontrado.');
        records.delete(id);
        return json(response, 200, { deleted: true });
      }
      return json(response, 405, { message: 'Método não permitido para esta rota.' });
    } catch (cause) {
      const status = Number(cause?.status) || 500;
      return json(response, status, { message: cause instanceof Error ? cause.message : 'Erro inesperado na API temporária.' });
    }
  };
}