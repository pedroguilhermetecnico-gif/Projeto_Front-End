import { useEffect, useState, type FormEvent } from 'react';
import type { ClienteDTO } from '../../types';

interface ClienteFormProps {
  mode: 'create' | 'edit';
  initialValues?: ClienteDTO;
  onSubmit: (dados: ClienteDTO) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const VALORES_PADRAO: ClienteDTO = {
  nome: '',
  telefone: '',
  cpfCnpj: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: 'Campina Grande',
  cep: '',
  pontoReferencia: '',
};

export default function ClienteForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: ClienteFormProps) {
  const [form, setForm] = useState<ClienteDTO>(initialValues ?? VALORES_PADRAO);
  const [erroValidacao, setErroValidacao] = useState('');

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
    }
  }, [initialValues]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroValidacao('');

    if (!form.nome.trim() || !form.telefone.trim()) {
      setErroValidacao('Informe o Nome completo e o Telefone / WhatsApp do cliente.');
      return;
    }

    if (!form.rua.trim() || !form.bairro.trim() || !form.cidade.trim()) {
      setErroValidacao('Preencha o endereco completo de entrega (Rua, Bairro e Cidade).');
      return;
    }

    if (!form.pontoReferencia.trim()) {
      setErroValidacao('O Ponto de Referencia e obrigatorio para descarregamento de materiais.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        rua: form.rua.trim(),
        numero: form.numero.trim() || 'S/N',
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        cep: form.cep.trim(),
        pontoReferencia: form.pontoReferencia.trim(),
      });
    } catch {
      setErroValidacao('Nao foi possivel salvar o cliente na API. Verifique a conexao.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {erroValidacao && <div className="login-error">{erroValidacao}</div>}

      <div className="fieldset-box">
        <div className="fieldset-title">Dados Pessoais e Contato</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2, minWidth: '240px' }}>
            <label htmlFor="cli-nome">Nome Completo / Razao Social *</label>
            <input
              id="cli-nome"
              type="text"
              className="input-box"
              placeholder="Ex: Construtora Horizonte Ltda"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
            <label htmlFor="cli-telefone">Telefone / WhatsApp *</label>
            <input
              id="cli-telefone"
              type="text"
              className="input-box"
              placeholder="(83) 99999-0000"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '170px' }}>
            <label htmlFor="cli-doc">CPF / CNPJ (Opcional)</label>
            <input
              id="cli-doc"
              type="text"
              className="input-box"
              placeholder="000.000.000-00"
              value={form.cpfCnpj ?? ''}
              onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="fieldset-box">
        <div className="fieldset-title">Endereco de Entrega no Canteiro de Obras</div>
        <div className="form-row" style={{ marginBottom: '12px' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
            <label htmlFor="cli-cep">CEP</label>
            <input
              id="cli-cep"
              type="text"
              className="input-box"
              placeholder="58400-000"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flex: 3, minWidth: '240px' }}>
            <label htmlFor="cli-rua">Rua / Logradouro *</label>
            <input
              id="cli-rua"
              type="text"
              className="input-box"
              placeholder="Ex: Av. Floriano Peixoto"
              value={form.rua}
              onChange={(e) => setForm({ ...form, rua: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
            <label htmlFor="cli-numero">Numero *</label>
            <input
              id="cli-numero"
              type="text"
              className="input-box"
              placeholder="1100"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '12px' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
            <label htmlFor="cli-bairro">Bairro *</label>
            <input
              id="cli-bairro"
              type="text"
              className="input-box"
              placeholder="Ex: Centro"
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
            <label htmlFor="cli-cidade">Cidade *</label>
            <input
              id="cli-cidade"
              type="text"
              className="input-box"
              placeholder="Ex: Campina Grande"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cli-ref" style={{ color: '#002541', fontWeight: 700 }}>
            Ponto de Referencia (Obrigatorio para Frete / Descarga) *
          </label>
          <input
            id="cli-ref"
            type="text"
            className="input-box"
            style={{ borderColor: '#f8a63e', borderWidth: '2px' }}
            placeholder="Ex: Proximo ao deposito central / Ao lado do posto de saude"
            value={form.pontoReferencia}
            onChange={(e) => setForm({ ...form, pontoReferencia: e.target.value })}
            required
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'SALVANDO...'
            : mode === 'create'
              ? 'SALVAR CLIENTE'
              : 'ATUALIZAR CLIENTE'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
