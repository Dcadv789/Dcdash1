import React from 'react';
import { X } from 'lucide-react';
import { Empresa } from '../../types/database';

interface CompanyViewModalProps {
  company: Empresa;
  onClose: () => void;
}

const CompanyViewModal: React.FC<CompanyViewModalProps> = ({ company, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Detalhes da Empresa</h2>
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
              <label className="block text-sm font-medium text-gray-400">Razão Social</label>
              <p className="text-white">{company.razao_social}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Nome Fantasia</label>
              <p className="text-white">{company.nome_fantasia || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">CNPJ</label>
              <p className="text-white">{company.cnpj || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <p className="text-white">{company.ativa ? 'Ativa' : 'Inativa'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Data de Início do Contrato</label>
              <p className="text-white">
                {company.data_inicio_contrato
                  ? new Date(company.data_inicio_contrato).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Data de Cadastro</label>
              <p className="text-white">
                {new Date(company.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyViewModal