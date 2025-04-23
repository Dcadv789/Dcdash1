import React, { useEffect, useState } from 'react';
import { X, Building2, Mail, Phone, Calendar, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Empresa, Socio } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface CompanyViewModalProps {
  company: Empresa;
  onClose: () => void;
}

const CompanyViewModal: React.FC<CompanyViewModalProps> = ({ company, onClose }) => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    const { data } = await supabase
      .from('socios')
      .select('*')
      .eq('empresa_id', company.id);

    setSocios(data || []);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Detalhes da Empresa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.razao_social} 
                className="w-32 h-32 object-contain rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                <Building2 size={64} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Razão Social</label>
              <p className="text-white flex items-center gap-2">
                <Building2 size={18} className="text-gray-400" />
                {company.razao_social}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome Fantasia</label>
              <p className="text-white flex items-center gap-2">
                <Building2 size={18} className="text-gray-400" />
                {company.nome_fantasia || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-white flex items-center gap-2">
                <Mail size={18} className="text-gray-400" />
                {company.email || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
              <p className="text-white flex items-center gap-2">
                <Phone size={18} className="text-gray-400" />
                {company.telefone || '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">CNPJ</label>
              <p className="text-white flex items-center gap-2">
                <Building2 size={18} className="text-gray-400" />
                {company.cnpj || '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <p className="text-white flex items-center gap-2">
                {company.ativa ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
                {company.ativa ? 'Ativa' : 'Inativa'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data de Início do Contrato</label>
              <p className="text-white flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                {company.data_inicio_contrato
                  ? new Date(company.data_inicio_contrato).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data de Cadastro</label>
              <p className="text-white flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                {new Date(company.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Sócios ({socios.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : socios.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum sócio cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {socios.map((socio) => (
                  <div key={socio.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                        <p className="text-white">{socio.nome}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">CPF</label>
                        <p className="text-white">{socio.cpf || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Percentual</label>
                        <p className="text-white">{socio.percentual ? `${socio.percentual}%` : '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyViewModal;