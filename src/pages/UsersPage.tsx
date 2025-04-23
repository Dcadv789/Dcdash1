import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database';
import UserList from '../components/users/UserList';
import UserViewModal from '../components/users/UserViewModal';
import UserEditModal from '../components/users/UserEditModal';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      addLog('Iniciando busca de usuários...');

      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado');
      }

      addLog('Fazendo consulta inicial de teste...');
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('*');

      if (testError) {
        addLog(`Erro no teste inicial: ${testError.message}`);
        throw testError;
      }

      addLog(`Teste inicial retornou ${testData?.length || 0} usuários`);

      addLog('Fazendo consulta completa com dados da empresa...');
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresa:empresas(razao_social)
        `);

      if (error) {
        addLog(`Erro na consulta completa: ${error.message}`);
        throw error;
      }

      const formattedUsers = data?.map(user => ({
        ...user,
        empresa: user.empresa || null
      })) || [];

      addLog(`Consulta completa retornou ${formattedUsers.length} usuários`);
      setUsers(formattedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao buscar usuários: ${errorMessage}`);
      setError(`Erro ao carregar usuários: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user: Usuario) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    addLog(`Visualizando usuário: ${user.nome}`);
  };

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    addLog(`Editando usuário: ${user.nome}`);
  };

  const handleSaveEdit = (updatedUser: Usuario) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    addLog(`Usuário ${updatedUser.nome} atualizado com sucesso`);
  };

  const handleDelete = async (user: Usuario) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      addLog(`Tentando excluir usuário: ${user.nome}`);
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== user.id));
      addLog(`Usuário ${user.nome} excluído com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao excluir usuário: ${errorMessage}`);
      alert('Não foi possível excluir o usuário.');
    }
  };

  const handleToggleActive = async (user: Usuario) => {
    try {
      addLog(`Alterando status do usuário: ${user.nome}`);
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, ativo: !u.ativo } : u
      ));
      addLog(`Status do usuário ${user.nome} atualizado com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao atualizar status: ${errorMessage}`);
      alert('Não foi possível atualizar o status do usuário.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white mb-2">Logs de carregamento:</h3>
          {debugLogs.map((log, index) => (
            <div key={index} className="text-gray-400 text-sm">{log}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Gerenciamento de Usuários</h2>
        <p className="text-gray-400 mt-2">Gerencie usuários e suas permissões de acesso ao sistema</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <UserList
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <div className="bg-gray-800 p-4 rounded-lg mt-4">
        <h3 className="text-white mb-2">Logs de execução:</h3>
        {debugLogs.map((log, index) => (
          <div key={index} className="text-gray-400 text-sm">{log}</div>
        ))}
      </div>

      {selectedUser && isViewModalOpen && (
        <UserViewModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setIsViewModalOpen(false);
          }}
        />
      )}

      {selectedUser && isEditModalOpen && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setIsEditModalOpen(false);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default UsersPage;