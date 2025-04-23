import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Empresa } from '../types/database';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyViewModal from '../components/companies/CompanyViewModal';
import CompanyEditModal from '../components/companies/CompanyEditModal';
import CompanyCreateModal from '../components/companies/CompanyCreateModal';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      addLog('Iniciando busca de empresas...');

      const { data, error } = await supabase
        .from('empresas')
        .select('*');

      if (error) {
        addLog(`Erro na consulta: ${error.message}`);
        throw error;
      }

      addLog(`Consulta retornou ${data?.length || 0} empresas`);
      setCompanies(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao buscar empresas: ${errorMessage}`);
      setError(`Erro ao carregar empresas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (company: Empresa) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
    addLog(`Visualizando empresa: ${company.razao_social}`);
  };

  const handleEdit = (company: Empresa) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
    addLog(`Editando empresa: ${company.razao_social}`);
  };

  const handleSaveEdit = (updatedCompany: Empresa) => {
    setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    addLog(`Empresa ${updatedCompany.razao_social} atualizada com sucesso`);
  };

  const handleCreate = (newCompany: Empresa) => {
    setCompanies([...companies, newCompany]);
    addLog(`Empresa ${newCompany.razao_social} criada com sucesso`);
  };

  const handleDelete = async (company: Empresa) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      addLog(`Tentando excluir empresa: ${company.razao_social}`);
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', company.id);

      if (error) throw error;
      
      setCompanies(companies.filter(c => c.id !== company.id));
      addLog(`Empresa ${company.razao_social} excluída com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao excluir empresa: ${errorMessage}`);
      alert('Não foi possível excluir a empresa.');
    }
  };

  const handleToggleActive = async (company: Empresa) => {
    try {
      addLog(`Alterando status da empresa: ${company.razao_social}`);
      const { error } = await supabase
        .from('empresas')
        .update({ ativa: !company.ativa })
        .eq('id', company.id);

      if (error) throw error;
      
      setCompanies(companies.map(c => 
        c.id === company.id ? { ...c, ativa: !c.ativa } : c
      ));
      addLog(`Status da empresa ${company.razao_social} atualizado com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(`Erro ao atualizar status: ${errorMessage}`);
      alert('Não foi possível atualizar o status da empresa.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white mb-2">Logs de carregamento:</h3>
          {debugLogs.map((log, index) => (
            <div key={index} className="text-gray-400 text-sm">{log}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Empresas</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <Plus size={20} />
          Adicionar Empresa
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
          {error}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300">
          Nenhuma empresa encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg mt-4">
        <h3 className="text-white mb-2">Logs de execução:</h3>
        {debugLogs.map((log, index) => (
          <div key={index} className="text-gray-400 text-sm">{log}</div>
        ))}
      </div>

      {selectedCompany && isViewModalOpen && (
        <CompanyViewModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            setIsViewModalOpen(false);
          }}
        />
      )}

      {selectedCompany && isEditModalOpen && (
        <CompanyEditModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            setIsEditModalOpen(false);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {isCreateModalOpen && (
        <CompanyCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
};

export default CompaniesPage;