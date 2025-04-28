import React, { useState } from 'react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardGrid from '../components/dashboard/DashboardGrid';

const AnalysePage: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const { data: empresas } = useSupabaseQuery({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: dashboardData, loading, error } = useSupabaseQuery({
    query: () => {
      if (!selectedEmpresa) return Promise.resolve({ data: [] });

      return supabase
        .from('analise_config')
        .select(`
          *,
          indicador:indicadores (
            id,
            nome,
            codigo,
            tipo_dado
          ),
          categoria:categorias (
            id,
            nome,
            codigo
          ),
          chart_components:analise_chart_components (
            id,
            ordem,
            cor,
            categoria:categorias (
              id,
              nome
            ),
            indicador:indicadores (
              id,
              nome,
              tipo_dado
            )
          )
        `)
        .eq('empresa_id', selectedEmpresa)
        .eq('ativo', true)
        .order('posicao');
    },
    dependencies: [selectedEmpresa],
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Análise</h2>
          <p className="text-gray-400 mt-1">Análise detalhada de indicadores e métricas</p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardFilters
            selectedEmpresa={selectedEmpresa}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            empresas={empresas}
            onEmpresaChange={setSelectedEmpresa}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </div>

      {!selectedEmpresa ? (
        <EmptyState message="Selecione uma empresa para visualizar as análises" />
      ) : dashboardData.length === 0 ? (
        <EmptyState message="Nenhum indicador configurado para esta empresa" />
      ) : (
        <DashboardGrid
          data={dashboardData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}
    </div>
  );
};

export default AnalysePage;