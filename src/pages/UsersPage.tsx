import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { useDebugLogs } from '../hooks/useDebugLogs';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { DebugLogs } from '../components/shared/DebugLogs';
import UserList from '../components/users/UserList';
import UserViewModal from '../components/users/UserViewModal';
import UserEditModal from '../components/users/UserEditModal';

const UsersPage: React.FC = () => {
  // Estado
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Hooks
  const { logs, addLog } = useDebugLogs();
  const { data: users, loading, error, refetch } = useSupabaseQuery<Usuario>({
    query: () => supabase
      .from('usuarios')
      .select(`
        *,
        empresa:empresas(razao_social)
      `),
  });

  // Manipuladores de eventos
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
    refetch();
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
      
      refetch();
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
      
      refetch();
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
        <LoadingSpinner />
        <DebugLogs logs={logs} />
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
        <ErrorAlert message={error} />
      ) : users.length === 0 ? (
        <EmptyState message="Nenhum usuário encontrado." />
      ) : (
        <UserList
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <DebugLogs logs={logs} />

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