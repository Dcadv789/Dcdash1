import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { DreConfiguracao, Categoria, Indicador } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface DreComponentsModalProps {
  conta: DreConfiguracao;
  onClose: () => void;
  onSave: () => void;
}

interface Componente {
  id?: string;
  tipo: 'categoria' | 'indicador' | 'conta';
  referencia_id: string;
  simbolo: '+' | '-' | '=';
  nome: string;
  codigo?: string;
}

const DreComponentsModal: React.FC<DreComponentsModalProps> = ({
  conta,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<'categoria' | 'indicador' | 'conta'>('categoria');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [contas, setContas] = useState<DreConfiguracao[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar dados
      const [categoriasRes, indicadoresRes, contasRes, componentesRes] = await Promise.all([
        supabase.from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase.from('indicadores')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase.from('dre_configuracao')
          .select('*')
          .eq('ativo', true)
          .neq('id', conta.id)
          .order('ordem'),
        supabase.from('dre_conta_componentes')
          .select(`
            id,
            categoria:categorias (id, nome, codigo),
            indicador:indicadores (id, nome, codigo),
            conta_componente:dre_configuracao (id, nome),
            simbolo
          `)
          .eq('conta_id', conta.id)
      ]);

      if (categoriasRes.data) setCategorias(categoriasRes.data);
      if (indicadoresRes.data) setIndicadores(indicadoresRes.data);
      if (contasRes.data) setContas(contasRes.data);

      // Processar componentes existentes
      if (componentesRes.data) {
        const comps = componentesRes.data.map(comp => {
          if (comp.categoria) {
            return {
              id: comp.id,
              tipo: 'categoria' as const,
              referencia_id: comp.categoria.id,
              simbolo: comp.simbolo as '+' | '-' | '=',
              nome: comp.categoria.nome,
              codigo: comp.categoria.codigo
            };
          }
          if (comp.indicador) {
            return {
              id: comp.id,
              tipo: 'indicador' as const,
              referencia_id: comp.indicador.id,
              simbolo: comp.simbolo as '+' | '-' | '=',
              nome: comp.indicador.nome,
              codigo: comp.indicador.codigo
            };
          }
          return {
            id: comp.id,
            tipo: 'conta' as const,
            referencia_id: comp.conta_componente.id,
            simbolo: comp.simbolo as '+' | '-' | '=',
            nome: comp.conta_componente.nome
          };
        });
        setComponentes(comps);
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
      // Remover componentes existentes
      await supabase
        .from('dre_conta_componentes')
        .delete()
        .eq('conta_id', conta.id);

      // Criar novos componentes
      if (componentes.length > 0) {
        const { error } = await supabase
          .from('dre_conta_componentes')
          .insert(
            componentes.map(comp => ({
              conta_id: conta.id,
              categoria_id: comp.tipo === 'categoria' ? comp.referencia_id : null,
              indicador_id: comp.tipo === 'indicador' ? comp.referencia_id : null,
              conta_componente_id: comp.tipo === 'conta' ? comp.referencia_id : null,
              simbolo: comp.simbolo
            }))
          );

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar componentes:', err);
      alert('Não foi possível salvar os componentes');
    } finally {
      setLoading(false);
    }
  };

  const addComponente = (tipo: 'categoria' | 'indicador' | 'conta', item: any) => {
    setComponentes(prev => [...prev, {
      tipo,
      referencia_id: item.id,
      simbolo: '+',
      nome: item.nome,
      codigo: item.codigo
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

  const filteredItems = () => {
    const term = searchTerm.toLowerCase();
    
    switch (selectedTipo) {
      case 'categoria':
        return categorias.filter(cat => 
          !componentes.some(comp => comp.tipo === 'categoria' && comp.referencia_id === cat.id) &&
          (cat.codigo?.toLowerCase().includes(term) || cat.nome.toLowerCase().includes(term))
        );
      
      case 'indicador':
        return indicadores.filter(ind => 
          !componentes.some(comp => comp.tipo === 'indicador' && comp.referencia_id === ind.id) &&
          (ind.codigo?.toLowerCase().includes(term) || ind.nome.toLowerCase().includes(term))
        );
      
      case 'conta':
        return contas.filter(c => 
          !componentes.some(comp => comp.tipo === 'conta' && comp.referencia_id === c.id) &&
          c.nome.toLowerCase().includes(term)
        );
      
      default:
        return [];
    }
  };

  return (
    <Modal
      title="Gerenciar Componentes"
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Seleção de Tipo e Busca */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedTipo === 'categoria' ? 'primary' : 'secondary'}
              onClick={() => setSelectedTipo('categoria')}
            >
              Categorias
            </Button>
            <Button
              variant={selectedTipo === 'indicador' ? 'primary' : 'secondary'}
              onClick={() => setSelectedTipo('indicador')}
            >
              Indicadores
            </Button>
            <Button
              variant={selectedTipo === 'conta' ? 'primary' : 'secondary'}
              onClick={() => setSelectedTipo('conta')}
            >
              Contas
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar por ${selectedTipo === 'conta' ? 'nome' : 'código ou nome'}...`}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de Itens Disponíveis */}
        <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {filteredItems().map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg">
                <button
                  type="button"
                  onClick={() => addComponente(selectedTipo, item)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                >
                  <ArrowRight size={16} />
                </button>
                <div className="flex-1">
                  <span className="text-white">{item.nome}</span>
                  {'codigo' in item && item.codigo && (
                    <span className="ml-2 text-gray-400 text-sm">({item.codigo})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Componentes Selecionados */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Componentes Selecionados</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-2">
              {componentes.map((comp, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg">
                  <button
                    type="button"
                    onClick={() => removeComponente(index)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                  >
                    <ArrowLeft size={16} />
                  </button>
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
                    <span className="text-white">{comp.nome}</span>
                    {comp.codigo && (
                      <span className="ml-2 text-gray-400 text-sm">({comp.codigo})</span>
                    )}
                  </div>
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