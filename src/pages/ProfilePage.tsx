import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Usuario } from '../types/database';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
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
        .eq('auth_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Não foi possível carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-300">
        Perfil não encontrado
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader profile={profile} />
      <ProfileForm profile={profile} onUpdate={setProfile} />
    </div>
  );
};

export default ProfilePage;