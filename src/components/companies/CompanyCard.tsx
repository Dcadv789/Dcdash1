import React from 'react';
import { Eye, Pencil, Trash2, Power, Building2, Calendar, Clock, Users, Mail, Phone } from 'lucide-react';
import { Empresa } from '../../types/database';
import { supabase } from '../../lib/supabase';

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
  const [sociosCount, setSociosCount] = React.useState<number>(0);

  React.useEffect(() => {
    fetchSociosCount();
  }, []);

  const fetchSociosCount = async () => {
    const { count } = await supabase
      .from('socios')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', company.id);
    
    setSociosCount(count || 0);
  };

  const calculateTimeAsClient = () => {
    if (!company.data_inicio_contrato) return null;
    
    const startDate = new Date(company.data_inicio_contrato);
    const today = new Date();
    
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return diffMonths;
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return 'Não informado';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Não informado';
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  const clientTime = calculateTimeAsClient();

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={company.razao_social}
              className="w-12 h-12 rounded-lg object-contain bg-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
              <Building2 className="text-gray-500" size={24} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{company.razao_social}</h3>
            <p className="text-gray-400 text-sm">{company.nome_fantasia || 'Nome Fantasia não informado'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          company.ativa 
            ? 'bg-green-500/20 text-green-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {company.ativa ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Building2 size={16} className="text-gray-400" />
          <span className="text-gray-400">CNPJ:</span>
          <span className="text-white">{formatCNPJ(company.cnpj)}</span>
        </div>

        {company.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-400">Email:</span>
            <span className="text-white">{company.email}</span>
          </div>
        )}

        {company.telefone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-gray-400" />
            <span className="text-gray-400">Telefone:</span>
            <span className="text-white">{formatPhone(company.telefone)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-gray-400">Início do Contrato:</span>
          <span className="text-white">
            {company.data_inicio_contrato 
              ? new Date(company.data_inicio_contrato).toLocaleDateString('pt-BR')
              : 'Não informado'}
          </span>
        </div>

        {clientTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-gray-400" />
            <span className="text-gray-400">Cliente há:</span>
            <span className="text-white">{clientTime} meses</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-gray-400" />
          <span className="text-gray-400">Sócios:</span>
          <span className="text-white">{sociosCount}</span>
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

export default CompanyCard;