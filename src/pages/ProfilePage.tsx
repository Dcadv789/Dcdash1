import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Usuario } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { Button } from '../components/shared/Button';
import ProfileHeader from '../components/profile/ProfileHeader';
import { Pencil } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    telefone: '',
  });

  const { data: profile, loading, error, refetch } = useSupabaseQuery<Usuario>({
    query: () => supabase
      .from('usuarios')
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
      .eq('auth_id', user?.id)
      .single(),
    dependencies: [user?.id],
  });

  // Atualiza o formulário quando o perfil é carregado
  React.useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome,
        cargo: profile.cargo || '',
        telefone: profile.telefone || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          cargo: formData.cargo || null,
          telefone: formData.telefone.replace(/\D/g, '') || null,
        })
        .eq('id', profile!.id);

      if (error) throw error;

      await refetch();
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Não foi possível atualizar o perfil');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Não foi possível carregar os dados do perfil" />;
  }

  if (!profile) {
    return <ErrorAlert message="Perfil não encontrado" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ProfileHeader profile={profile} />
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Informações Pessoais</h3>
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cargo</label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Nome</label>
                <p className="text-white">{profile.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <p className="text-white">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Cargo</label>
                <p className="text-white">{profile.cargo || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Telefone</label>
                <p className="text-white">
                  {profile.telefone ? profile.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : 'Não informado'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Informações do Sistema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Nível de Acesso</label>
              <p className="text-white capitalize">{profile.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.ativo 
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {profile.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Data de Cadastro</label>
              <p className="text-white">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Empresa Vinculada</label>
              <p className="text-white">{profile.empresa?.razao_social || 'Nenhuma empresa vinculada'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;