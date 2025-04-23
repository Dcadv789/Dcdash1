import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Usuario, Empresa } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface UserEditModalProps {
  user: Usuario;
  onClose: () => void;
  onSave: (updatedUser: Usuario) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    telefone: user.telefone || '',
    cargo: user.cargo || '',
    role: user.role,
    avatar_url: user.avatar_url || '',
    empresa_id: user.empresa_id || '',
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razao_social')
        .eq('ativa', true)
        .order('razao_social');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
      setError('Não foi possível carregar a lista de empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, verify if the user still exists
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error('Usuário não encontrado. Ele pode ter sido removido ou você não tem permissão para editá-lo.');
        }
        throw checkError;
      }

      // If we get here, the user exists and we have permission to see it
      const { data, error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          cargo: formData.cargo || null,
          role: formData.role,
          avatar_url: formData.avatar_url || null,
          empresa_id: formData.empresa_id || null
        })
        .eq('id', user.id)
        .select(`
          *,
          empresa:empresas (
            id,
            razao_social
          )
        `)
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          throw new Error('Erro ao atualizar usuário. Verifique se você tem permissão para realizar esta operação.');
        }
        throw updateError;
      }

      if (!data) {
        throw new Error('Não foi possível recuperar os dados do usuário após a atualização.');
      }

      onSave(data as Usuario);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmpresas) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Editar Usuário</h2>
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
          
          <div className="grid grid-cols-2 gap-4">
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
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefone
              </label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Cargo
              </label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                URL do Avatar
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/avatar.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Empresa
              </label>
              <select
                value={formData.empresa_id}
                onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.razao_social}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nível de Acesso
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Usuario['role'] }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cliente">Cliente</option>
                <option value="consultor">Consultor</option>
                <option value="master">Master</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;