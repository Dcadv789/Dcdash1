import React, { useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Usuario } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface ProfileFormProps {
  profile: Usuario;
  onUpdate: (updatedProfile: Usuario) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: profile.nome,
    cargo: profile.cargo || '',
    telefone: profile.telefone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          cargo: formData.cargo || null,
          telefone: formData.telefone.replace(/\D/g, '') || null,
        })
        .eq('id', profile.id)
        .select(`
          *,
          empresa:empresas (
            id,
            razao_social,
            nome_fantasia,
            cnpj,
            logo_url
          )
        `)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Não foi possível atualizar o perfil');

      onUpdate(data as Usuario);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Informações do Perfil</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Pencil size={16} />
            Editar
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={16} />
            Cancelar
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Nome
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <p className="text-white">{profile.nome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Cargo
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white">{profile.cargo || 'Não informado'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Telefone
          </label>
          {isEditing ? (
            <InputMask
              mask="(99) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white">
              {profile.telefone ? profile.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : 'Não informado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <p className="text-white">{profile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Nível de Acesso
          </label>
          <p className="text-white capitalize">{profile.role}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Status
          </label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            profile.ativo 
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {profile.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;