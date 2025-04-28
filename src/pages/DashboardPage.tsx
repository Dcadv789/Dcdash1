import React, { useState } from 'react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { useDashboard } from '../hooks/useDashboard';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardGrid from '../components/dashboard/DashboardGrid';

const DashboardPage: React.FC = () => {
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

  const { data: dashboardData, loading, error } = useDashboard({
    table: 'dashboard_config',
    empresaId: selectedEmpresa
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Visualize os principais indicadores</p>
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
        <EmptyState message="Selecione uma empresa para visualizar o dashboard" />
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

export default DashboardPage;