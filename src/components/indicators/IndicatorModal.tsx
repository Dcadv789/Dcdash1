import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    nome: indicator?.nome || '',
    descricao: indicator?.descricao || '',
    tipo: indicator?.tipo || 'único',
    tipo_dado: indicator?.tipo_dado || 'moeda',
  });

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