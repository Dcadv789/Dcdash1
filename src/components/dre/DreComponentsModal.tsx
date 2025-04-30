import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { DreConfiguracao } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface DreComponentsModalProps {
  conta: DreConfiguracao;
  onClose: () => void;
  onSave: () => void;
}

const DreComponentsModal: React.FC<DreComponentsModalProps> = ({
  conta,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [componentes, setComponentes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: componentesData }, { data: categoriasData }, { data: indicadoresData }] = await Promise.all([
        supabase
          .from('dre_conta_componentes')
          .select(`
            *,
            categoria:categorias (
              id,
              nome,
              codigo
            ),
            indicador:indicadores (
              id,
              nome,
              codigo
            )
          `)
          .eq('conta_id', conta.id),
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo')
      ]);

      if (componentesData) setComponentes(componentesData);
      if (categoriasData) setCategorias(categoriasData);
      if (indicadoresData) setIndicadores(indicadoresData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await supabase
        .from('dre_conta_componentes')
        .delete()
        .eq('conta_id', conta.id);

      if (componentes.length > 0) {
        const { error } = await supabase
          .from('dre_conta_componentes')
          .insert(
            componentes.map(comp => ({
              conta_id: conta.id,
              categoria_id: comp.categoria?.id || null,
              indicador_id: comp.indicador?.id || null,
              simbolo: comp.simbolo
            }))
          );

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar componentes:', err);
      setError('Não foi possível salvar os componentes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIndicadores = indicadores.filter(ind => 
    ind.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addComponente = (tipo: 'categoria' | 'indicador', item: any) => {
    setComponentes(prev => [...prev, {
      tipo,
      simbolo: '+',
      [tipo]: item
    }]);
  };

  const removeComponente = (index: number) => {
    setComponentes(prev => prev.filter((_, i) => i !== index));
  };

  const updateSimbolo = (index: number, simbolo: '+' | '-' | '=') => {
    setComponentes(prev => prev.map((comp, i) => 
      i === index ? { ...comp, simbolo } : comp
    ));
  };

  return (
    <Modal
      title="Gerenciar Componentes"
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Categorias */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Categorias Disponíveis</h4>
            <div className="h-48 overflow-y-auto pr-2">
              {filteredCategorias.map(categoria => (
                <button
                  key={categoria.id}
                  onClick={() => addComponente('categoria', categoria)}
                  className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={componentes.some(c => c.categoria?.id === categoria.id)}
                >
                  <span className="text-white">{categoria.nome}</span>
                  <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Indicadores Disponíveis</h4>
            <div className="h-48 overflow-y-auto pr-2">
              {filteredIndicadores.map(indicador => (
                <button
                  key={indicador.id}
                  onClick={() => addComponente('indicador', indicador)}
                  className="w-full text-left p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={componentes.some(c => c.indicador?.id === indicador.id)}
                >
                  <span className="text-white">{indicador.nome}</span>
                  <span className="text-gray-400 text-sm ml-2">({indicador.codigo})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Componentes Selecionados */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Componentes Selecionados</h4>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="max-h-48 overflow-y-auto pr-2">
              {componentes.map((comp, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg">
                  <select
                    value={comp.simbolo}
                    onChange={(e) => updateSimbolo(index, e.target.value as '+' | '-' | '=')}
                    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="=">=</option>
                  </select>
                  <div className="flex-1">
                    {comp.categoria ? (
                      <>
                        <span className="text-white">{comp.categoria.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({comp.categoria.codigo})</span>
                      </>
                    ) : comp.indicador ? (
                      <>
                        <span className="text-white">{comp.indicador.nome}</span>
                        <span className="text-gray-400 text-sm ml-2">({comp.indicador.codigo})</span>
                      </>
                    ) : null}
                  </div>
                  <button
                    onClick={() => removeComponente(index)}
                    className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
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

export default DreComponentsModal;