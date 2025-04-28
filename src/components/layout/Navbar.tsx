import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, ChevronDown, Users, Building2, Database, ChevronRight, BarChart, Cog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Usuario } from '../../types/database';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
        setIsDatabaseOpen(false);
        setIsConfigOpen(false);
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

  useEffect(() => {
    if (!location.pathname.includes('/categories') && 
        !location.pathname.includes('/indicators') && 
        !location.pathname.includes('/dreconfig') &&
        !location.pathname.includes('/configdashboard') &&
        !location.pathname.includes('/configvendas') &&
        !location.pathname.includes('/configanalysis')) {
      setIsSettingsOpen(false);
      setIsDatabaseOpen(false);
      setIsConfigOpen(false);
    }
  }, [location]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', user!.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.nome?.split(' ')[0] || 'Usuário';

    if (hour >= 0 && hour < 6) return `Boa madrugada, ${name}`;
    if (hour >= 6 && hour < 12) return `Bom dia, ${name}`;
    if (hour >= 12 && hour < 18) return `Boa tarde, ${name}`;
    return `Boa noite, ${name}`;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!path.includes('/categories') && 
        !path.includes('/indicators') && 
        !path.includes('/dreconfig') &&
        !path.includes('/configdashboard') &&
        !path.includes('/configvendas') &&
        !path.includes('/configanalysis')) {
      setIsSettingsOpen(false);
      setIsDatabaseOpen(false);
      setIsConfigOpen(false);
    }
  };

  return (
    <div className="bg-black rounded-2xl p-4 flex items-center justify-between z-10">
      <h1 className="text-white text-xl font-semibold">{getGreeting()}</h1>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <Bell size={20} />
        </button>
        
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-800 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings size={20} />
              <span className="text-sm">Configurações</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 bg-gray-800 rounded-xl shadow-lg py-1 min-w-[200px] border border-gray-700">
              <button
                onClick={() => handleNavigation('/users')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Users size={16} />
                Usuários
              </button>
              <button
                onClick={() => handleNavigation('/companies')}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Building2 size={16} />
                Empresas
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsDatabaseOpen(!isDatabaseOpen)}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Database size={16} />
                    Base de dados
                  </div>
                  <ChevronRight size={16} className={`transition-transform duration-200 ${isDatabaseOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isDatabaseOpen && (
                  <div className="absolute left-full top-0 ml-0.5 bg-gray-800 rounded-xl shadow-lg py-1 min-w-[200px] border border-gray-700">
                    <button
                      onClick={() => handleNavigation('/categories')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Categorias
                    </button>
                    <button
                      onClick={() => handleNavigation('/indicators')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Indicadores
                    </button>
                    <button
                      onClick={() => handleNavigation('/dreconfig')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Config. DRE
                    </button>
                    <button
                      onClick={() => handleNavigation('/lancamentos')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Lançamentos
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Cog size={16} />
                    Config das Pgs.
                  </div>
                  <ChevronRight size={16} className={`transition-transform duration-200 ${isConfigOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isConfigOpen && (
                  <div className="absolute left-full top-0 ml-0.5 bg-gray-800 rounded-xl shadow-lg py-1 min-w-[200px] border border-gray-700">
                    <button
                      onClick={() => handleNavigation('/configdashboard')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNavigation('/configvendas')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Vendas
                    </button>
                    <button
                      onClick={() => handleNavigation('/configanalysis')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      Análise
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
            
            <div className="text-left">
              <div className="font-medium">{userProfile?.nome || 'Usuário'}</div>
              <div className="text-sm text-gray-400">{userProfile?.email}</div>
            </div>

            <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-1 z-50 border border-gray-700">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 rounded-lg"
              >
                <User size={16} />
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 rounded-lg"
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