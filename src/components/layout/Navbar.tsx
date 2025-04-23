import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Usuario } from '../../types/database';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresa:empresas (
            id,
            razao_social,
            cnpj,
            logo_url
          )
        `)
        .eq('auth_id', user!.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/profile') return 'Meu Perfil';
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return null;
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="bg-black rounded-2xl p-4 flex items-center justify-between z-10">
      <h1 className="text-white text-xl font-semibold">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <Bell size={20} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <Settings size={20} />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors duration-200"
          >
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.nome}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="bg-gray-700 rounded-full p-1">
                <User size={20} />
              </div>
            )}
            
            <div className="text-left hidden md:block">
              <div className="font-medium">{userProfile?.nome || 'Usuário'}</div>
              <div className="text-sm text-gray-400">{userProfile?.email}</div>
            </div>

            {userProfile?.empresa && (
              <div className="hidden lg:flex items-center gap-2 border-l border-gray-700 pl-3 ml-3">
                {userProfile.empresa.logo_url ? (
                  <img
                    src={userProfile.empresa.logo_url}
                    alt={userProfile.empresa.razao_social}
                    className="w-6 h-6 rounded object-contain bg-gray-700"
                  />
                ) : (
                  <Building2 size={20} className="text-gray-400" />
                )}
                <div className="text-left">
                  <div className="text-sm font-medium truncate max-w-[150px]">
                    {userProfile.empresa.razao_social}
                  </div>
                  {userProfile.empresa.cnpj && (
                    <div className="text-xs text-gray-400">
                      {formatCNPJ(userProfile.empresa.cnpj)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <User size={16} />
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;