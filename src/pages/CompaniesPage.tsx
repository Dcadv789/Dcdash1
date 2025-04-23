import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { useDebugLogs } from '../hooks/useDebugLogs';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { DebugLogs } from '../components/shared/DebugLogs';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyViewModal from '../components/companies/CompanyViewModal';
import CompanyEditModal from '../components/companies/CompanyEditModal';
import CompanyCreateModal from '../components/companies/CompanyCreateModal';

const CompaniesPage: React.FC = () => {
  // State
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hooks
  const { logs, addLog } = useDebugLogs();
  const { data: companies, loading, error, refetch } = useSupabaseQuery<Empresa>({
    query: () => supabase.from('empresas').select('*'),
  });

  // Handlers
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
    refetch();
    addLog(`Empresa ${updatedCompany.razao_social} atualizada com sucesso`);
  };

  const handleCreate = (newCompany: Empresa) => {
    refetch();
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
      
      refetch();
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
      
      refetch();
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
        <LoadingSpinner />
        <DebugLogs logs={logs} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Empresas</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
        >
          Adicionar Empresa
        </Button>
      </div>

      {error ? (
        <ErrorAlert message={error} />
      ) : companies.length === 0 ? (
        <EmptyState message="Nenhuma empresa encontrada." />
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

      <DebugLogs logs={logs} />

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