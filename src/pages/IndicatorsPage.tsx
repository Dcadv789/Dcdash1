import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Power, Eye, Building2, Calculator } from 'lucide-react';
import { Indicador } from '../types/database';
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

const IndicatorsPage: React.FC = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicador | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);

  const { data: indicators, loading, error, refetch } = useSupabaseQuery<Indicador>({
    query: () => supabase
      .from('indicadores')
      .select('*')
      .order('codigo'),
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

      {indicators.length === 0 ? (
        <EmptyState message="Nenhum indicador encontrado." />
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400">Código</th>
                <th className="text-left p-4 text-gray-400">Nome</th>
                <th className="text-left p-4 text-gray-400">Tipo</th>
                <th className="text-left p-4 text-gray-400">Tipo de Dado</th>
                <th className="text-left p-4 text-gray-400">Status</th>
                <th className="text-right p-4 text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((indicator) => (
                <tr key={indicator.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 text-white font-mono">{indicator.codigo}</td>
                  <td className="p-4 text-white">{indicator.nome}</td>
                  <td className="p-4">
                    <span className="capitalize text-white">{indicator.tipo}</span>
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-white">{indicator.tipo_dado}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      indicator.ativo 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {indicator.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedIndicator(indicator);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIndicator(indicator);
                          setIsCompaniesModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title="Gerenciar Empresas"
                      >
                        <Building2 size={18} />
                      </button>
                      {indicator.tipo === 'composto' && (
                        <button
                          onClick={() => {
                            setSelectedIndicator(indicator);
                            setIsCompositionModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                          title="Gerenciar Composição"
                        >
                          <Calculator size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedIndicator(indicator);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(indicator)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title={indicator.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(indicator)}
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