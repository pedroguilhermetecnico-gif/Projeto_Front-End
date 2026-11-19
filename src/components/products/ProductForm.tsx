import { useEffect, useState, type FormEvent } from 'react';
import type { ProdutoDTO } from '../../types';

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

export default function ProductForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProdutoDTO>(initialValues ?? VALORES_PADRAO);
  const [erroValidacao, setErroValidacao] = useState('');

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
    }
  }, [initialValues]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroValidacao('');

    if (!form.nome.trim() || !form.marca.trim() || !form.codigoBarras.trim()) {
      setErroValidacao('Preencha Nome, Codigo de Barras (EAN-13) e Marca.');
      return;
    }

    if (form.precoVenda <= 0) {
      setErroValidacao('Informe um Preco de Venda maior que zero.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        codigo: form.codigo.trim() || form.codigoBarras.trim(),
        codigoBarras: form.codigoBarras.trim(),
        nome: form.nome.trim(),
        marca: form.marca.trim(),
      });
    } catch {
      setErroValidacao('Nao foi possivel salvar o produto na API. Verifique a conexao.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {erroValidacao && <div className="login-error">{erroValidacao}</div>}

      <div className="form-row">
        <div className="form-group" style={{ flex: 2, minWidth: '240px' }}>
          <label htmlFor="prod-nome">Nome do Produto *</label>
          <input
            id="prod-nome"
            type="text"
            className="input-box"
            placeholder="Ex: Cimento Portland CP II 50kg"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-ean">Codigo de Barras (EAN-13) *</label>
          <input
            id="prod-ean"
            type="text"
            className="input-box"
            placeholder="Ex: 7891234567890"
            value={form.codigoBarras}
            onChange={(e) =>
              setForm({
                ...form,
                codigoBarras: e.target.value,
                codigo: e.target.value,
              })
            }
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-marca">Marca *</label>
          <input
            id="prod-marca"
            type="text"
            className="input-box"
            placeholder="Ex: Votoran, Quartzolit, Tigre"
            value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="prod-familia">Familia / Categoria *</label>
          <select
            id="prod-familia"
            className="input-box"
            value={form.familia}
            onChange={(e) => setForm({ ...form, familia: e.target.value })}
          >
            <option value="Alvenaria">Alvenaria</option>
            <option value="Eletrica">Eletrica</option>
            <option value="Pintura">Pintura</option>
            <option value="Hidraulica">Hidraulica</option>
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
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          >
            <option value="Unidade">Unidade</option>
            <option value="Saco">Saco</option>
            <option value="Metro">Metro</option>
            <option value="Kg">Kg</option>
            <option value="Litro">Litro</option>
            <option value="Caixa">Caixa</option>
            <option value="Galao">Galao</option>
          </select>
        </div>
      </div>

      <div className="fieldset-box">
        <div className="fieldset-title">Precificacao e Controle de Estoque</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label htmlFor="prod-preco">Preco de Venda (R$) *</label>
            <input
              id="prod-preco"
              type="number"
              step="0.01"
              min="0"
              className="input-box"
              value={form.precoVenda}
              onChange={(e) => setForm({ ...form, precoVenda: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label htmlFor="prod-estoque">Estoque Atual *</label>
            <input
              id="prod-estoque"
              type="number"
              min="0"
              className="input-box"
              value={form.estoqueAtual}
              onChange={(e) => setForm({ ...form, estoqueAtual: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label htmlFor="prod-minimo">Estoque Minimo</label>
            <input
              id="prod-minimo"
              type="number"
              min="0"
              className="input-box"
              value={form.minimoEstoque}
              onChange={(e) => setForm({ ...form, minimoEstoque: Number(e.target.value) })}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="prod-validade">Validade (Opcional)</label>
            <input
              id="prod-validade"
              type="text"
              className="input-box"
              placeholder="DD/MM/AAAA"
              value={form.validade ?? ''}
              onChange={(e) => setForm({ ...form, validade: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'PROCESSANDO...'
            : mode === 'create'
              ? 'SALVAR PRODUTO'
              : 'ATUALIZAR PRODUTO'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
