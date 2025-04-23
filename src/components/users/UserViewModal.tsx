import React from 'react';
import { X } from 'lucide-react';
import { Usuario } from '../../types/database';

interface UserViewModalProps {
  user: Usuario;
  onClose: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Detalhes do Usuário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Nome</label>
              <p className="text-white">{user.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Empresa</label>
              <p className="text-white">{user.empresa?.razao_social || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Cargo</label>
              <p className="text-white">{user.cargo || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Telefone</label>
              <p className="text-white">{user.telefone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Nível de Acesso</label>
              <p className="text-white">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <p className="text-white">{user.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Data de Criação</label>
              <p className="text-white">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal