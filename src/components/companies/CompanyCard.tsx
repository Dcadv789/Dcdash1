import React from 'react';
import { Eye, Pencil, Trash2, Power } from 'lucide-react';
import { Empresa } from '../../types/database';

interface CompanyCardProps {
  company: Empresa;
  onView: (company: Empresa) => void;
  onEdit: (company: Empresa) => void;
  onDelete: (company: Empresa) => void;
  onToggleActive: (company: Empresa) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{company.razao_social}</h3>
          <p className="text-gray-400 text-sm">{company.nome_fantasia || 'Nome Fantasia não informado'}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          company.ativa 
            ? 'bg-green-500/20 text-green-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {company.ativa ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-gray-400">CNPJ: </span>
            <span className="text-white">{company.cnpj || 'Não informado'}</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-400">Início do Contrato: </span>
            <span className="text-white">
              {company.data_inicio_contrato 
                ? new Date(company.data_inicio_contrato).toLocaleDateString('pt-BR')
                : 'Não informado'}
            </span>
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={() => onView(company)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          title="Visualizar"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onEdit(company)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onToggleActive(company)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          title={company.ativa ? 'Desativar' : 'Ativar'}
        >
          <Power size={18} />
        </button>
        <button
          onClick={() => onDelete(company)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CompanyCard