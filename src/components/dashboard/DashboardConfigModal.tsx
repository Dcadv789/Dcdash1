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
    tipo_visualizacao: 'card',
    tipo_grafico: 'line',
    componentes: [] as { tipo: 'indicador' | 'categoria'; id: string }[],
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
      // Validar número de componentes para gráfico
      if (formData.tipo_visualizacao === 'chart' && formData.componentes.length !== 2) {
        throw new Error('Selecione exatamente 2 componentes para o gráfico');
      }

      // Preparar dados para salvar
      const saveData = {
        posicao: parseInt(formData.posicao),
        titulo: formData.titulo,
        tipo_visualizacao: formData.tipo_visualizacao,
        tipo_grafico: formData.tipo_visualizacao === 'chart' ? formData.tipo_grafico : null,
        empresa_id: empresaId,
      };

      // Para card, usar apenas o primeiro componente
      if (formData.tipo_visualizacao === 'card') {
        const componente = formData.componentes[0];
        if (componente.tipo === 'indicador') {
          Object.assign(saveData, { indicador_id: componente.id, categoria_id: null });
        } else {
          Object.assign(saveData, { categoria_id: componente.id, indicador_id: null });
        }
      } else {
        // Para gráfico, salvar primeiro componente e criar componente do gráfico para o segundo
        const [comp1, comp2] = formData.componentes;
        if (comp1.tipo === 'indicador') {
          Object.assign(saveData, { indicador_id: comp1.id, categoria_id: null });
        } else {
          Object.assign(saveData, { categoria_id: comp1.id, indicador_id: null });
        }

        // Salvar configuração principal
        const { data: configData, error: configError } = await supabase
          .from('dashboard_config')
          .insert(saveData)
          .select()
          .single();

        if (configError) throw configError;

        // Salvar segundo componente
        if (configData) {
          const componentData = {
            dashboard_id: configData.id,
            ordem: 1,
            cor: '#3B82F6', // Cor padrão azul
          };

          if (comp2.tipo === 'indicador') {
            Object.assign(componentData, { indicador_id: comp2.id });
          } else {
            Object.assign(componentData, { categoria_id: comp2.id });
          }

          const { error: componentError } = await supabase
            .from('dashboard_chart_components')
            .insert(componentData);

          if (componentError) throw componentError;
        }
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponente = (tipo: 'indicador' | 'categoria', id: string) => {
    if (!id) return;
    
    setFormData(prev => {
      // Para card, substituir o componente existente
      if (prev.tipo_visualizacao === 'card') {
        return { ...prev, componentes: [{ tipo, id }] };
      }

      // Para gráfico, adicionar até 2 componentes
      if (prev.componentes.length < 2 && !prev.componentes.some(c => c.id === id)) {
        return { ...prev, componentes: [...prev.componentes, { tipo, id }] };
      }

      return prev;
    });
  };

  const handleRemoveComponente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      componentes: prev.componentes.filter((_, i) => i !== index)
    }));
  };

  const renderComponenteLabel = (componente: { tipo: 'indicador' | 'categoria'; id: string }) => {
    if (componente.tipo === 'indicador') {
      const ind = indicadores.find(i => i.id === componente.id);
      return ind ? `${ind.codigo} - ${ind.nome}` : '';
    } else {
      const cat = categorias.find(c => c.id === componente.id);
      return cat ? `${cat.codigo} - ${cat.nome}` : '';
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
            Tipo de Visualização
          </label>
          <select
            value={formData.tipo_visualizacao}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                tipo_visualizacao: e.target.value as 'card' | 'chart',
                componentes: [] // Limpar componentes ao mudar o tipo
              }));
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="card">Card</option>
            <option value="chart">Gráfico</option>
          </select>
        </div>

        {formData.tipo_visualizacao === 'chart' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo de Gráfico
            </label>
            <select
              value={formData.tipo_grafico}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo_grafico: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="line">Linha</option>
              <option value="bar">Barras</option>
              <option value="area">Área</option>
              <option value="pie">Pizza</option>
            </select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {formData.tipo_visualizacao === 'card' 
                ? 'Selecione um indicador ou categoria'
                : 'Selecione dois componentes (indicadores e/ou categorias)'}
            </label>

            {/* Componentes selecionados */}
            {formData.componentes.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.componentes.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                    <span className="text-white">
                      {renderComponenteLabel(comp)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponente(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Seleção de indicadores */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Indicador
              </label>
              <select
                value=""
                onChange={(e) => handleAddComponente('indicador', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um indicador</option>
                {indicadores
                  .filter(ind => !formData.componentes.some(c => c.id === ind.id))
                  .map(indicador => (
                    <option key={indicador.id} value={indicador.id}>
                      {indicador.codigo} - {indicador.nome}
                    </option>
                  ))}
              </select>
            </div>

            {/* Seleção de categorias */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Categoria
              </label>
              <select
                value=""
                onChange={(e) => handleAddComponente('categoria', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categorias
                  .filter(cat => !formData.componentes.some(c => c.id === cat.id))
                  .map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.codigo} - {categoria.nome}
                    </option>
                  ))}
              </select>
            </div>
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
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DashboardConfigModal;