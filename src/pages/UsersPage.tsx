import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database';
import UserList from '../components/users/UserList';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Verificar se o cliente Supabase está configurado corretamente
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado');
      }

      // Fazer uma consulta simples primeiro
      const { data: testData, error: testError } = await supabase
        .from('usuarios')
        .select('*');

      console.log('Teste inicial:', { testData, testError });

      if (testError) {
        throw testError;
      }

      // Se o teste passar, fazer a consulta completa
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, empresa:empresas(razao_social)');

      console.log('Dados completos:', { data, error });

      if (error) {
        throw error;
      }

      // Garantir que os dados estão no formato correto
      const formattedUsers = data?.map(user => ({
        ...user,
        empresa: user.empresa || null
      })) || [];

      console.log('Usuários formatados:', formattedUsers);
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user: Usuario) => {
    console.log('Visualizar usuário:', user);
  };

  const handleEdit = (user: Usuario) => {
    console.log('Editar usuário:', user);
  };

  const handleDelete = async (user: Usuario) => {
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

  const handleToggleActive = async (user: Usuario) => {
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

  // Adicionar mensagem quando não houver usuários
  if (users.length === 0) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300">
        Nenhum usuário encontrado. Verifique o console para mais detalhes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Usuários ({users.length})</h2>
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