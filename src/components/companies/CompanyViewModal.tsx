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

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.razao_social} 
                className="w-12 h-12 object-contain rounded-lg bg-gray-700 p-1"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-gray-500" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-white">{company.razao_social}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome Fantasia</label>
              <p className="text-white">{company.nome_fantasia || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">CNPJ</label>
              <p className="text-white">{formatCNPJ(company.cnpj)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-white flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                {company.email || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
              <p className="text-white flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                {formatPhone(company.telefone)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <p className="text-white flex items-center gap-2">
                {company.ativa ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                {company.ativa ? 'Ativa' : 'Inativa'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data de Início</label>
              <p className="text-white flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {company.data_inicio_contrato
                  ? new Date(company.data_inicio_contrato).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cadastrado em</label>
              <p className="text-white flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
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
              <div className="grid grid-cols-2 gap-4">
                {socios.map((socio) => (
                  <div key={socio.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{socio.nome}</h4>
                        <p className="text-gray-400 text-sm">
                          {socio.percentual ? `${socio.percentual}%` : 'Percentual não informado'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        CPF: {socio.cpf ? socio.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}
                      </p>
                      <p className="text-gray-300">
                        Email: {socio.email || '-'}
                      </p>
                      <p className="text-gray-300">
                        Tel: {socio.telefone ? socio.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-'}
                      </p>
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