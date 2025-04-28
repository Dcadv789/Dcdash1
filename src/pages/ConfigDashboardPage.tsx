import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import DashboardConfigList from '../components/dashboard/DashboardConfigList';
import DashboardConfigModal from '../components/dashboard/DashboardConfigModal';

const ConfigDashboardPage: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  const { data: empresas } = useSupabaseQuery({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: configs, loading, error, refetch } = useSupabaseQuery({
    query: () => {
      let query = supabase
        .from('dashboard_config')
        .select(`
          *,
          indicador:indicadores (
            id,
            nome,
            codigo
          ),
          categoria:categorias (
            id,
            nome,
            codigo
          ),
          empresa:empresas (
            id,
            razao_social
          ),
          chart_components:dashboard_chart_components (
            id,
            ordem,
            cor,
            categoria:categorias (
              id,
              nome,
              codigo
            ),
            indicador:indicadores (
              id,
              nome,
              codigo
            )
          )
        `)
        .order('posicao');

      if (selectedEmpresa) {
        query = query.eq('empresa_id', selectedEmpresa);
      }

      return query;
    },
    dependencies: [selectedEmpresa],
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Configuração do Dashboard</h2>
          <p className="text-gray-400 mt-1">Configure os indicadores e categorias que serão exibidos no dashboard</p>
        </div>
        <Button
          onClick={() => {
            setSelectedConfig(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Adicionar Card
        </Button>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="relative w-64">
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Selecione uma empresa</option>
            {empresas?.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razao_social}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {!selectedEmpresa ? (
        <EmptyState message="Selecione uma empresa para configurar o dashboard" />
      ) : configs.length === 0 ? (
        <EmptyState message="Nenhuma configuração encontrada" />
      ) : (
        <DashboardConfigList
          configs={configs}
          onRefetch={refetch}
          onEdit={(config) => {
            setSelectedConfig(config);
            setIsModalOpen(true);
          }}
        />
      )}

      {isModalOpen && (
        <DashboardConfigModal
          empresaId={selectedEmpresa}
          config={selectedConfig}
          onClose={() => {
            setSelectedConfig(null);
            setIsModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default ConfigDashboardPage;