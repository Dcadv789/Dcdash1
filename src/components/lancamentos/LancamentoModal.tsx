import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Lancamento, Empresa, Categoria, Indicador } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface LancamentoModalProps {
  lancamento?: Lancamento;
  onClose: () => void;
  onSave: () => void;
}

const LancamentoModal: React.FC<LancamentoModalProps> = ({
  lancamento,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [formData, setFormData] = useState({
    valor: lancamento?.valor.toString() || '',
    tipo: lancamento?.tipo || 'receita',
    mes: lancamento?.mes || new Date().getMonth() + 1,
    ano: lancamento?.ano || new Date().getFullYear(),
    categoria_id: lancamento?.categoria_id || '',
    indicador_id: lancamento?.indicador_id || '',
    empresa_id: lancamento?.empresa_id || '',
    descricao: lancamento?.descricao || '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empresasRes, categoriasRes, indicadoresRes] = await Promise.all([
        supabase.from('empresas').select('*').eq('ativa', true).order('razao_social'),
        supabase.from('categorias').select('*').eq('ativo', true).order('codigo'),
        supabase.from('indicadores').select('*').eq('ativo', true).order('codigo'),
      ]);

      if (empresasRes.data) setEmpresas(empresasRes.data);
      if (categoriasRes.data) setCategorias(categoriasRes.data);
      if (indicadoresRes.data) setIndicadores(indicadoresRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        mes: formData.mes,
        ano: formData.ano,
        categoria_id: formData.categoria_id || null,
        indicador_id: formData.indicador_id || null,
        empresa_id: formData.empresa_id,
        descricao: formData.descricao || null,
      };

      if (lancamento) {
        const { error } = await supabase
          .from('lancamentos')
          .update(data)
          .eq('id', lancamento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lancamentos')
          .insert([data]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
      setError('Não foi possível salvar o lançamento');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Modal
      title={lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'receita' | 'despesa' }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Mês
            </label>
            <select
              value={formData.mes}
              onChange={(e) => setFormData(prev => ({ ...prev, mes: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ano
            </label>
            <select
              value={formData.ano}
              onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Empresa
            </label>
            <select
              value={formData.empresa_id}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.razao_social}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Categoria
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categorias
                .filter(cat => cat.tipo === formData.tipo)
                .map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Indicador
            </label>
            <select
              value={formData.indicador_id}
              onChange={(e) => setFormData(prev => ({ ...prev, indicador_id: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um indicador</option>
              {indicadores.map(indicador => (
                <option key={indicador.id} value={indicador.id}>
                  {indicador.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LancamentoModal;