import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Indicador, Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import IndicatorModal from '../components/indicators/IndicatorModal';
import IndicatorCompaniesModal from '../components/indicators/IndicatorCompaniesModal';
import IndicatorCompositionModal from '../components/indicators/IndicatorCompositionModal';
import IndicatorFilters from '../components/indicators/IndicatorFilters';
import IndicatorList from '../components/indicators/IndicatorList';

const IndicatorsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'todos' | 'único' | 'composto'>('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicador | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: indicators, loading, error, refetch } = useSupabaseQuery<Indicador>({
    query: () => {
      let query = supabase
        .from('indicadores')
        .select(`
          *,
          empresa:indicadores_empresas(
            empresa:empresas(
              id,
              razao_social
            )
          )
        `)
        .order('codigo');

      if (selectedType !== 'todos') {
        query = query.eq('tipo', selectedType);
      }

      if (selectedEmpresa) {
        query = query.eq('indicadores_empresas.empresa_id', selectedEmpresa);
      }

      return query;
    },
    dependencies: [selectedType, selectedEmpresa],
  });

  const handleToggleActive = async (indicator: Indicador) => {
    try {
      const { error } = await supabase
        .from('indicadores')
        .update({ ativo: !indicator.ativo })
        .eq('id', indicator.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao atualizar indicador:', err);
      alert('Não foi possível atualizar o indicador');
    }
  };

  const handleDelete = async (indicator: Indicador) => {
    if (!window.confirm('Tem certeza que deseja excluir este indicador?')) return;

    try {
      const { error } = await supabase
        .from('indicadores')
        .delete()
        .eq('id', indicator.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao excluir indicador:', err);
      alert('Não foi possível excluir o indicador');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  // Processar os dados dos indicadores para extrair a empresa
  const processedIndicators = indicators.map(indicator => ({
    ...indicator,
    empresa: indicator.empresa?.[0]?.empresa || null
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Indicadores</h2>
          <p className="text-gray-400 mt-1">Gerencie os indicadores financeiros</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
        >
          Novo Indicador
        </Button>
      </div>

      <IndicatorFilters
        selectedType={selectedType}
        selectedEmpresa={selectedEmpresa}
        empresas={empresas}
        onTypeChange={setSelectedType}
        onEmpresaChange={setSelectedEmpresa}
      />

      {processedIndicators.length === 0 ? (
        <EmptyState message="Nenhum indicador encontrado." />
      ) : (
        <IndicatorList
          indicators={processedIndicators}
          onView={(indicator) => {
            setSelectedIndicator(indicator);
            setIsViewModalOpen(true);
          }}
          onEdit={(indicator) => {
            setSelectedIndicator(indicator);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onManageCompanies={(indicator) => {
            setSelectedIndicator(indicator);
            setIsCompaniesModalOpen(true);
          }}
          onManageComposition={(indicator) => {
            setSelectedIndicator(indicator);
            setIsCompositionModalOpen(true);
          }}
        />
      )}

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedIndicator && (
        <Modal
          title="Detalhes do Indicador"
          onClose={() => {
            setSelectedIndicator(undefined);
            setIsViewModalOpen(false);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Código</label>
                <p className="text-lg text-white font-mono">{selectedIndicator.codigo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                <p className="text-lg text-white">{selectedIndicator.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                <p className="text-lg text-white capitalize">{selectedIndicator.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Dado</label>
                <p className="text-lg text-white capitalize">{selectedIndicator.tipo_dado}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <p className="text-lg text-white">{selectedIndicator.ativo ? 'Ativo' : 'Inativo'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Empresa</label>
                <p className="text-lg text-white">{selectedIndicator.empresa?.razao_social || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
              <p className="text-lg text-white">{selectedIndicator.descricao || '-'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Criação/Edição */}
      {(isCreateModalOpen || (isEditModalOpen && selectedIndicator)) && (
        <IndicatorModal
          indicator={isEditModalOpen ? selectedIndicator : undefined}
          onClose={() => {
            setSelectedIndicator(undefined);
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          onSave={refetch}
        />
      )}

      {/* Modal de Gerenciamento de Empresas */}
      {isCompaniesModalOpen && selectedIndicator && (
        <IndicatorCompaniesModal
          indicator={selectedIndicator}
          onClose={() => {
            setSelectedIndicator(undefined);
            setIsCompaniesModalOpen(false);
          }}
          onSave={refetch}
        />
      )}

      {/* Modal de Composição */}
      {isCompositionModalOpen && selectedIndicator && (
        <IndicatorCompositionModal
          indicator={selectedIndicator}
          onClose={() => {
            setSelectedIndicator(undefined);
            setIsCompositionModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default IndicatorsPage;