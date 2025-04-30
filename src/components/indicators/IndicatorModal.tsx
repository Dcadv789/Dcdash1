import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Indicador } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';

interface IndicatorModalProps {
  indicator?: Indicador;
  onClose: () => void;
  onSave: () => void;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ indicator, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nome: indicator?.nome || '',
    descricao: indicator?.descricao || '',
    tipo: indicator?.tipo || 'único',
    tipo_dado: indicator?.tipo_dado || 'moeda',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: categoriasData }, { data: indicadoresData }] = await Promise.all([
        supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('indicadores')
          .select('*')
          .eq('ativo', true)
          .eq('tipo', 'único') // Apenas indicadores únicos podem ser usados em compostos
          .order('codigo')
      ]);

      if (categoriasData) setCategorias(categoriasData);
      if (indicadoresData) setIndicadores(indicadoresData);
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
      if (indicator) {
        const { error } = await supabase
          .from('indicadores')
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
            tipo: formData.tipo,
            tipo_dado: formData.tipo_dado,
          })
          .eq('id', indicator.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('indicadores')
          .insert({
            nome: formData.nome,
            descricao: formData.descricao || null,
            tipo: formData.tipo,
            tipo_dado: formData.tipo_dado,
          });

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar indicador:', err);
      setError('Não foi possível salvar o indicador');
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {indicator ? 'Editar Indicador' : 'Novo Indicador'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tipo
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'único' | 'composto' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="único">Único</option>
                <option value="composto">Composto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tipo de Dado
              </label>
              <select
                value={formData.tipo_dado}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_dado: e.target.value as 'moeda' | 'numero' | 'percentual' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="moeda">Moeda</option>
                <option value="numero">Número</option>
                <option value="percentual">Percentual</option>
              </select>
            </div>

            {formData.tipo === 'único' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Categorias
                </label>
                <div className="relative mb-4">
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
                <div className="max-h-48 overflow-y-auto bg-gray-700 rounded-lg p-2">
                  {filteredCategorias.map(categoria => (
                    <div key={categoria.id} className="p-2 hover:bg-gray-600 rounded-lg">
                      <span className="text-white">{categoria.nome}</span>
                      <span className="text-gray-400 text-sm ml-2">({categoria.codigo})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.tipo === 'composto' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Indicadores
                </label>
                <div className="relative mb-4">
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
                <div className="max-h-48 overflow-y-auto bg-gray-700 rounded-lg p-2">
                  {filteredIndicadores.map(indicador => (
                    <div key={indicador.id} className="p-2 hover:bg-gray-600 rounded-lg">
                      <span className="text-white">{indicador.nome}</span>
                      <span className="text-gray-400 text-sm ml-2">({indicador.codigo})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
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
      </div>
    </div>
  );
};

export default IndicatorModal;