import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Indicador, Categoria } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface IndicatorCompositionModalProps {
  indicator: Indicador;
  onClose: () => void;
  onSave: () => void;
}

const IndicatorCompositionModal: React.FC<IndicatorCompositionModalProps> = ({
  indicator,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedIndicadores, setSelectedIndicadores] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar categorias
      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('codigo');

      // Buscar indicadores
      const { data: indicadoresData } = await supabase
        .from('indicadores')
        .select('*')
        .eq('ativo', true)
        .neq('id', indicator.id) // Excluir o próprio indicador
        .order('codigo');

      // Buscar composições existentes
      const { data: composicoesData } = await supabase
        .from('indicador_composicoes')
        .select('*')
        .eq('indicador_id', indicator.id);

      if (categoriasData) {
        setCategorias(categoriasData);
      }

      if (indicadoresData) {
        setIndicadores(indicadoresData);
      }

      if (composicoesData) {
        setSelectedCategorias(composicoesData
          .filter(c => c.componente_categoria_id)
          .map(c => c.componente_categoria_id!)
        );
        setSelectedIndicadores(composicoesData
          .filter(c => c.componente_indicador_id)
          .map(c => c.componente_indicador_id!)
        );
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Remover todas as composições existentes
      await supabase
        .from('indicador_composicoes')
        .delete()
        .eq('indicador_id', indicator.id);

      // Criar novas composições
      const composicoes = [
        ...selectedCategorias.map(categoriaId => ({
          indicador_id: indicator.id,
          componente_categoria_id: categoriaId,
          componente_indicador_id: null
        })),
        ...selectedIndicadores.map(indicadorId => ({
          indicador_id: indicator.id,
          componente_categoria_id: null,
          componente_indicador_id: indicadorId
        }))
      ];

      if (composicoes.length > 0) {
        const { error } = await supabase
          .from('indicador_composicoes')
          .insert(composicoes);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar composições:', err);
      alert('Não foi possível salvar as composições');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Composição do Indicador"
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Categorias */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Categorias</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Categorias Disponíveis</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {categorias
                  .filter(categoria => !selectedCategorias.includes(categoria.id))
                  .map(categoria => (
                    <label key={categoria.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setSelectedCategorias(prev => [...prev, categoria.id])}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <div>
                        <span className="text-white">{categoria.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Categorias Selecionadas</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {categorias
                  .filter(categoria => selectedCategorias.includes(categoria.id))
                  .map(categoria => (
                    <label key={categoria.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setSelectedCategorias(prev => prev.filter(id => id !== categoria.id))}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <span className="text-white">{categoria.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Indicadores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Indicadores Disponíveis</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {indicadores
                  .filter(ind => !selectedIndicadores.includes(ind.id))
                  .map(ind => (
                    <label key={ind.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setSelectedIndicadores(prev => [...prev, ind.id])}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <div>
                        <span className="text-white">{ind.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({ind.codigo})</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Indicadores Selecionados</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {indicadores
                  .filter(ind => selectedIndicadores.includes(ind.id))
                  .map(ind => (
                    <label key={ind.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setSelectedIndicadores(prev => prev.filter(id => id !== ind.id))}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <span className="text-white">{ind.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({ind.codigo})</span>
                      </div>
                    </label>
                  ))}
              </div>
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
            onClick={handleSave}
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IndicatorCompositionModal;