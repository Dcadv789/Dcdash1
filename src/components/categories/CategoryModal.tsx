import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Categoria, GrupoCategoria } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';

interface CategoryModalProps {
  category?: Categoria;
  onClose: () => void;
  onSave: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<GrupoCategoria[]>([]);
  const [formData, setFormData] = useState({
    nome: category?.nome || '',
    descricao: category?.descricao || '',
    grupo_id: category?.grupo_id || '',
    tipo: category?.tipo || 'receita',
  });

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    const { data } = await supabase
      .from('grupo_categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    if (data) setGrupos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
            grupo_id: formData.grupo_id || null,
          })
          .eq('id', category.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({
            nome: formData.nome,
            descricao: formData.descricao || null,
            grupo_id: formData.grupo_id || null,
            tipo: formData.tipo,
          });

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      setError('Não foi possível salvar a categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
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
                Grupo
              </label>
              <div className="relative">
                <select
                  value={formData.grupo_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, grupo_id: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                >
                  <option value="">Selecione um grupo</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {!category && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tipo
                </label>
                <div className="relative">
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'receita' | 'despesa' }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                    required
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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

export default CategoryModal;