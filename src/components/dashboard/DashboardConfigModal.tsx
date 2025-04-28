import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface DashboardConfigModalProps {
  empresaId: string;
  config?: any;
  onClose: () => void;
  onSave: () => void;
}

const DashboardConfigModal: React.FC<DashboardConfigModalProps> = ({
  empresaId,
  config,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    posicao: config?.posicao.toString() || '',
    titulo: config?.titulo || '',
    tipo_visualizacao: config?.tipo_visualizacao || 'card',
    tipo_grafico: config?.tipo_grafico || 'line',
    componentes: [] as { tipo: 'categoria' | 'indicador' | 'cliente'; id: string }[],
  });

  useEffect(() => {
    fetchData();
    if (config) {
      // Carregar componentes existentes
      const componentes = [];
      if (config.indicador) {
        componentes.push({ tipo: 'indicador' as const, id: config.indicador.id });
      }
      if (config.categoria) {
        componentes.push({ tipo: 'categoria' as const, id: config.categoria.id });
      }
      if (config.chart_components) {
        config.chart_components.forEach((comp: any) => {
          if (comp.indicador) {
            componentes.push({ tipo: 'indicador' as const, id: comp.indicador.id });
          }
          if (comp.categoria) {
            componentes.push({ tipo: 'categoria' as const, id: comp.categoria.id });
          }
        });
      }
      setFormData(prev => ({
        ...prev,
        componentes
      }));
    }
  }, [config]);

  const fetchData = async () => {
    try {
      const [indicadoresRes, categoriasRes, clientesRes] = await Promise.all([
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('clientes')
          .select('*')
          .eq('ativo', true)
          .eq('empresa_id', empresaId)
          .order('razao_social')
      ]);

      if (indicadoresRes.data) setIndicadores(indicadoresRes.data);
      if (categoriasRes.data) setCategorias(categoriasRes.data);
      if (clientesRes.data) setClientes(clientesRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const validateForm = () => {
    if (formData.tipo_visualizacao === 'chart' && formData.componentes.length !== 2) {
      setError('Selecione exatamente 2 componentes para o gráfico');
      return false;
    }
    if (formData.tipo_visualizacao === 'card' && formData.componentes.length !== 1) {
      setError('Selecione exatamente 1 componente para o card');
      return false;
    }
    if (formData.tipo_visualizacao === 'list' && formData.componentes.length === 0) {
      setError('Selecione pelo menos um componente para a lista');
      return false;
    }
    // Validar se todos os componentes da lista são do mesmo tipo
    if (formData.tipo_visualizacao === 'list' && formData.componentes.length > 0) {
      const firstType = formData.componentes[0].tipo;
      if (!formData.componentes.every(comp => comp.tipo === firstType)) {
        setError('Todos os componentes da lista devem ser do mesmo tipo');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para salvar
      const saveData = {
        posicao: parseInt(formData.posicao),
        titulo: formData.titulo,
        tipo_visualizacao: formData.tipo_visualizacao,
        tipo_grafico: formData.tipo_visualizacao === 'chart' ? formData.tipo_grafico : null,
        empresa_id: empresaId,
      };

      let configId = config?.id;

      if (config) {
        const { error: updateError } = await supabase
          .from('dashboard_config')
          .update(saveData)
          .eq('id', config.id);

        if (updateError) throw updateError;
      } else {
        const { data: configData, error: createError } = await supabase
          .from('dashboard_config')
          .insert(saveData)
          .select()
          .single();

        if (createError) throw createError;
        if (configData) configId = configData.id;
      }

      // Remover componentes existentes
      if (configId) {
        await Promise.all([
          supabase
            .from('dashboard_chart_components')
            .delete()
            .eq('dashboard_id', configId),
          supabase
            .from('dashboard_list_components')
            .delete()
            .eq('dashboard_id', configId)
        ]);

        // Adicionar novos componentes
        if (formData.tipo_visualizacao === 'chart') {
          const componentesData = formData.componentes.map((comp, index) => ({
            dashboard_id: configId,
            ordem: index,
            cor: '#3B82F6',
            ...(comp.tipo === 'indicador' 
              ? { indicador_id: comp.id, categoria_id: null }
              : { categoria_id: comp.id, indicador_id: null }
            )
          }));

          await supabase
            .from('dashboard_chart_components')
            .insert(componentesData);
        } else if (formData.tipo_visualizacao === 'list') {
          const componentesData = formData.componentes.map((comp, index) => ({
            dashboard_id: configId,
            ordem: index,
            categoria_id: comp.tipo === 'categoria' ? comp.id : null,
            indicador_id: comp.tipo === 'indicador' ? comp.id : null,
            cliente_id: comp.tipo === 'cliente' ? comp.id : null
          }));

          await supabase
            .from('dashboard_list_components')
            .insert(componentesData);
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

  const handleAddComponente = (tipo: 'indicador' | 'categoria' | 'cliente', id: string) => {
    if (!id) return;
    
    setFormData(prev => {
      // Para card, substituir o componente existente
      if (prev.tipo_visualizacao === 'card') {
        return { ...prev, componentes: [{ tipo, id }] };
      }

      // Para gráfico, adicionar até 2 componentes
      if (prev.tipo_visualizacao === 'chart') {
        if (prev.componentes.length < 2 && !prev.componentes.some(c => c.id === id)) {
          return { ...prev, componentes: [...prev.componentes, { tipo, id }] };
        }
      }

      // Para lista, adicionar sem limite desde que seja do mesmo tipo
      if (prev.tipo_visualizacao === 'list') {
        if (prev.componentes.length === 0 || prev.componentes[0].tipo === tipo) {
          if (!prev.componentes.some(c => c.id === id)) {
            return { ...prev, componentes: [...prev.componentes, { tipo, id }] };
          }
        }
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

  return (
    <Modal
      title={config ? 'Editar Configuração' : 'Nova Configuração'}
      onClose={onClose}
      maxWidth="4xl"
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
                tipo_visualizacao: e.target.value as 'card' | 'chart' | 'list',
                componentes: [] // Limpar componentes ao mudar o tipo
              }));
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="card">Card</option>
            <option value="chart">Gráfico</option>
            <option value="list">Lista</option>
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
                : formData.tipo_visualizacao === 'chart'
                ? 'Selecione dois componentes (indicadores e/ou categorias)'
                : 'Selecione os componentes (todos devem ser do mesmo tipo)'}
            </label>

            {/* Componentes selecionados */}
            {formData.componentes.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.componentes.map((comp, index) => {
                  let label = '';
                  if (comp.tipo === 'indicador') {
                    const ind = indicadores.find(i => i.id === comp.id);
                    label = ind ? `${ind.codigo} - ${ind.nome}` : '';
                  } else if (comp.tipo === 'categoria') {
                    const cat = categorias.find(c => c.id === comp.id);
                    label = cat ? `${cat.codigo} - ${cat.nome}` : '';
                  } else {
                    const cli = clientes.find(c => c.id === comp.id);
                    label = cli ? cli.razao_social : '';
                  }

                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                      <span className="text-white">{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponente(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
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
            <div className="mb-4">
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

            {/* Seleção de clientes */}
            {formData.tipo_visualizacao === 'list' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Cliente
                </label>
                <select
                  value=""
                  onChange={(e) => handleAddComponente('cliente', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes
                    .filter(cli => !formData.componentes.some(c => c.id === cli.id))
                    .map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.razao_social}
                      </option>
                    ))}
                </select>
              </div>
            )}
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