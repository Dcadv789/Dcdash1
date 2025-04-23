import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database';
import UserList from '../components/users/UserList';

interface UserWithEmpresa extends Usuario {
  empresa: {
    razao_social: string;
  } | null;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresa:empresas(razao_social)
        `)
        .order('nome');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user: UserWithEmpresa) => {
    console.log('Visualizar usuário:', user);
    // Implementar visualização
  };

  const handleEdit = (user: UserWithEmpresa) => {
    console.log('Editar usuário:', user);
    // Implementar edição
  };

  const handleDelete = async (user: UserWithEmpresa) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      alert('Não foi possível excluir o usuário.');
    }
  };

  const handleToggleActive = async (user: UserWithEmpresa) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, ativo: !u.ativo } : u
      ));
    } catch (err) {
      console.error('Erro ao atualizar status do usuário:', err);
      alert('Não foi possível atualizar o status do usuário.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Usuários</h2>
      </div>

      <UserList
        users={users}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
};

export default UsersPage;