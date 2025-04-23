import React from 'react';
import { User, Building2 } from 'lucide-react';
import { Usuario } from '../../types/database';

interface ProfileHeaderProps {
  profile: Usuario;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return 'Não informado';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.nome}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="bg-gray-700 rounded-full p-4">
              <User size={32} className="text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">{profile.nome}</h2>
              <p className="text-gray-400">{profile.email}</p>
            </div>
            
            {profile.empresa && (
              <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
                {profile.empresa.logo_url ? (
                  <img
                    src={profile.empresa.logo_url}
                    alt={profile.empresa.razao_social}
                    className="w-10 h-10 rounded-lg object-contain bg-gray-600 p-1"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                    <Building2 size={24} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{profile.empresa.razao_social}</p>
                  <p className="text-xs text-gray-400">
                    CNPJ: {formatCNPJ(profile.empresa.cnpj)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;