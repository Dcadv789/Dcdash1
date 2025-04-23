import React from 'react';
import { Eye, Pencil, Trash2, Power } from 'lucide-react';
import { Usuario } from '../../types/database';

interface UserListProps {
  users: Usuario[];
  onView: (user: Usuario) => void;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
  onToggleActive: (user: Usuario) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const getRoleLabel = (role: Usuario['role']) => {
    const labels = {
      master: 'Master',
      consultor: 'Consultor',
      cliente: 'Cliente',
    };
    return labels[role];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left p-4 text-gray-400">Nome</th>
            <th className="text-left p-4 text-gray-400">Email</th>
            <th className="text-left p-4 text-gray-400">Empresa</th>
            <th className="text-left p-4 text-gray-400">Nível de Acesso</th>
            <th className="text-left p-4 text-gray-400">Status</th>
            <th className="text-right p-4 text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
              <td className="p-4 text-white">{user.nome}</td>
              <td className="p-4 text-gray-300">{user.email}</td>
              <td className="p-4 text-gray-300">{user.empresa?.razao_social || '-'}</td>
              <td className="p-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                  {getRoleLabel(user.role)}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.ativo 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(user)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onToggleActive(user)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title={user.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;