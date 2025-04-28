import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface DashboardConfigModalProps {
  empresaId: string;
  onClose: () => void;
  onSave: () => void;
}

const DashboardConfigModal: React.FC<DashboardConfigModalProps> = ({
  empresaId,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    posicao: '',
    titulo: '',
    tipo: 'indicador', // 'indicador' ou 'categoria'
    indicador_id: '',
    categoria_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [indicadoresRes, categoriasRes] = await Promise.all([
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo')
      ]);

      if (indicadoresRes.data) setIndicadores(indicadoresRes.data);
      if (categoriasRes.data) setCategorias(categoriasRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('dashboard_config')
        .insert({
          posicao: parseInt(formData.posicao),
          titulo: formData.titulo,
          indicador_id: formData.tipo === 'indicador' ? formData.indicador_id : null,
          categoria_id: formData.tipo === 'categoria' ? formData.categoria_id : null,
          empresa_id: empresaId,
        });

      if (error) throw error;
      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
      setError('Não foi possível salvar a configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nova Configuração"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Posição (1-7)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.posicao}
            onChange={(e) => setFormData(prev => ({ ...prev, posicao: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Título
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
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
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                tipo: e.target.value as 'indicador' | 'categoria',
                indicador_id: '',
                categoria_id: ''
              }));
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="indicador">Indicador</option>
            <option value="categoria">Categoria</option>
          </select>
        </div>

        {formData.tipo === 'indicador' ? (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Indicador
            </label>
            <select
              value={formData.indicador_id}
              onChange={(e) => setFormData(prev => ({ ...prev, indicador_id: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um indicador</option>
              {indicadores.map(indicador => (
                <option key={indicador.id} value={indicador.id}>
                  {indicador.codigo} - {indicador.nome}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Categoria
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.codigo} - {categoria.nome}
                </option>
              ))}
            </select>
          </div>
        )}

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
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DashboardConfigModal;