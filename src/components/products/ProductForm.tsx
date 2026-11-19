import { useState, type FormEvent } from 'react';
import type { ProdutoDTO } from '../../types';
import { mensagemErroApi } from '../../services/apiError';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialValues?: ProdutoDTO;
  onSubmit: (dados: ProdutoDTO) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const VALORES_PADRAO: ProdutoDTO = {
  codigo: '',
  codigoBarras: '',
  nome: '',
  marca: '',
  familia: 'Alvenaria',
  precoVenda: 0,
  estoqueAtual: 0,
  minimoEstoque: 5,
  unidade: 'Unidade',
  validade: '',
};

function validarEan13(valor: string): boolean {
  if (!/^\d{13}$/.test(valor)) return false;

  const digitos = valor.split('').map(Number);
  const soma = digitos.slice(0, 12).reduce((total, digito, indice) => {
    return total + digito * (indice % 2 === 0 ? 1 : 3);
  }, 0);

  const digitoVerificador = (10 - (soma % 10)) % 10;
  return digitoVerificador === digitos[12];
}

function numeroValido(valor: number): boolean {
  return Number.isFinite(valor);
}

function formatarDataBR(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

function formatarDataInicial(valor: string): string {
  const dataIso = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (dataIso) return `${dataIso[3]}/${dataIso[2]}/${dataIso[1]}`;
  return formatarDataBR(valor);
}

function validarDataBR(valor: string): string | null {
  if (!valor) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!match) return 'Informe a validade no formato DD/MM/YYYY.';
  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    return 'Informe uma data de validade existente.';
  }
  return null;
}

export default function ProductForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProdutoDTO>(() => ({
    ...VALORES_PADRAO,
    ...initialValues,
    validade: formatarDataInicial(initialValues?.validade ?? ''),
  }));
  const [erroValidacao, setErroValidacao] = useState('');
  const [erroApi, setErroApi] = useState('');


  function atualizarCampo<K extends keyof ProdutoDTO>(
    campo: K,
    valor: ProdutoDTO[K],
  ) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErroValidacao('');
    setErroApi('');
  }

  function validar(): string | null {
    const nome = form.nome.trim();
    const marca = form.marca.trim();
    const ean = form.codigoBarras.replace(/\D/g, '');

    if (!nome) return 'Informe o nome do produto.';
    if (!marca) return 'Informe a marca do produto.';
    if (!ean) return 'Informe o código de barras EAN-13.';
    if (!validarEan13(ean)) {
      return 'O código de barras deve ter 13 dígitos e um dígito verificador válido (EAN-13).';
    }

    if (!numeroValido(form.precoVenda) || form.precoVenda <= 0) {
      return 'O preço de venda deve ser um número maior que zero.';
    }
    if (!Number.isInteger(form.estoqueAtual) || form.estoqueAtual < 0) {
      return 'O estoque atual deve ser um número inteiro igual ou maior que zero.';
    }
    if (!Number.isInteger(form.minimoEstoque) || form.minimoEstoque < 0) {
      return 'O estoque mínimo deve ser um número inteiro igual ou maior que zero.';
    }
    if (!form.familia.trim()) return 'Selecione a família/categoria do produto.';
    if (!form.unidade.trim()) return 'Selecione a unidade de medida.';
    const erroData = validarDataBR(form.validade?.trim() || '');
    if (erroData) return erroData;

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi('');

    const erro = validar();
    if (erro) {
      setErroValidacao(erro);
      return;
    }

    setErroValidacao('');

    try {
      const codigoBarras = form.codigoBarras.replace(/\D/g, '');
      await onSubmit({
        ...form,
        codigo: form.codigo.trim() || codigoBarras,
        codigoBarras,
        nome: form.nome.trim(),
        marca: form.marca.trim(),
        familia: form.familia.trim(),
        unidade: form.unidade.trim(),
        precoVenda: Number(form.precoVenda),
        estoqueAtual: Number(form.estoqueAtual),
        minimoEstoque: Number(form.minimoEstoque),
        validade: form.validade?.trim() || '',
      });
    } catch (error) {
      setErroApi(mensagemErroApi(error, 'Não foi possível salvar o produto.'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      {(erroValidacao || erroApi) && (
        <div className="login-error" role="alert" aria-live="polite">
          {erroValidacao || erroApi}
        </div>
      )}

      <div className="form-row">
        <div className="form-group" style={{ flex: 2, minWidth: '240px' }}>
          <label htmlFor="prod-nome">Nome do Produto *</label>
          <input
            id="prod-nome"
            type="text"
            className="input-box"
            placeholder="Ex.: Cimento Portland CP II 50kg"
            value={form.nome}
            maxLength={120}
            onChange={(event) => atualizarCampo('nome', event.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-ean">Código de Barras (EAN-13) *</label>
          <input
            id="prod-ean"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={13}
            className="input-box"
            placeholder="13 dígitos"
            value={form.codigoBarras}
            onChange={(event) => {
              const codigoBarras = event.target.value.replace(/\D/g, '').slice(0, 13);
              setForm((atual) => ({
                ...atual,
                codigoBarras,
                codigo: codigoBarras,
              }));
              setErroValidacao('');
              setErroApi('');
            }}
            required
          />
          <small>Digite os 13 números do código EAN-13.</small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-marca">Marca *</label>
          <input
            id="prod-marca"
            type="text"
            className="input-box"
            placeholder="Ex.: Votoran, Quartzolit, Tigre"
            value={form.marca}
            maxLength={80}
            onChange={(event) => atualizarCampo('marca', event.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-familia">Família / Categoria *</label>
          <select
            id="prod-familia"
            className="input-box"
            value={form.familia}
            onChange={(event) => atualizarCampo('familia', event.target.value)}
            required
          >
            <option value="Alvenaria">Alvenaria</option>
            <option value="Eletrica">Elétrica</option>
            <option value="Pintura">Pintura</option>
            <option value="Hidraulica">Hidráulica</option>
            <option value="Acabamento">Acabamento</option>
            <option value="Ferramentas">Ferramentas</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
          <label htmlFor="prod-unidade">Unidade de Medida *</label>
          <select
            id="prod-unidade"
            className="input-box"
            value={form.unidade}
            onChange={(event) => atualizarCampo('unidade', event.target.value)}
            required
          >
            <option value="Unidade">Unidade</option>
            <option value="Saco">Saco</option>
            <option value="Metro">Metro</option>
            <option value="Kg">Kg</option>
            <option value="Litro">Litro</option>
            <option value="Caixa">Caixa</option>
            <option value="Galao">Galão</option>
          </select>
        </div>
      </div>

      <div className="fieldset-box">
        <div className="fieldset-title">Precificação e Controle de Estoque</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label htmlFor="prod-preco">Preço de Venda (R$) *</label>
            <input
              id="prod-preco"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              className="input-box"
              value={form.precoVenda}
              onChange={(event) => atualizarCampo('precoVenda', event.target.value === '' ? 0 : Number(event.target.value))}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label htmlFor="prod-estoque">Estoque Atual *</label>
            <input
              id="prod-estoque"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              className="input-box"
              value={form.estoqueAtual}
              onChange={(event) => atualizarCampo('estoqueAtual', event.target.value === '' ? 0 : Number(event.target.value))}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label htmlFor="prod-minimo">Estoque Mínimo</label>
            <input
              id="prod-minimo"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              className="input-box"
              value={form.minimoEstoque}
              onChange={(event) => atualizarCampo('minimoEstoque', event.target.value === '' ? 0 : Number(event.target.value))}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="prod-validade">Validade (opcional)</label>
            <input
              id="prod-validade"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              className="input-box"
              placeholder="DD/MM/YYYY"
              value={form.validade ?? ''}
              onChange={(event) => atualizarCampo('validade', formatarDataBR(event.target.value))}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'PROCESSANDO...'
            : mode === 'create'
              ? 'SALVAR PRODUTO'
              : 'ATUALIZAR PRODUTO'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
