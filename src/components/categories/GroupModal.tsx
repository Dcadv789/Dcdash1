import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GrupoCategoria } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';

interface GroupModalProps {
  group?: GrupoCategoria;
  onClose: () => void;
  onSave: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ group, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: group?.nome || '',
    descricao: group?.descricao || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (group) {
        const { error } = await supabase
          .from('grupo_categorias')
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
          })
          .eq('id', group.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('grupo_categorias')
          .insert({
            nome: formData.nome,
            descricao: formData.descricao || null,
          });

        if (error) throw error;
      }

      // Chamar onSave antes de fechar o modal
      await onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar grupo:', err);
      setError('Não foi possível salvar o grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {group ? 'Editar Grupo' : 'Novo Grupo'}
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

export default GroupModal;