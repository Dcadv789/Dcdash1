import React, { useState } from 'react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardGrid from '../components/dashboard/DashboardGrid';

const VendasPage: React.FC = () => {
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
        .from('dashboard_config')
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
          chart_components:dashboard_chart_components (
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

  // Separar os dados em três grupos: cards superiores, cards inferiores e gráfico
  const topCards = dashboardData.filter(item => item.posicao >= 1 && item.posicao <= 4);
  const bottomCards = dashboardData.filter(item => item.posicao >= 5 && item.posicao <= 8);
  const chart = dashboardData.find(item => item.posicao === 9);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Vendas</h2>
          <p className="text-gray-400 mt-1">Acompanhamento de vendas e faturamento</p>
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
        <EmptyState message="Selecione uma empresa para visualizar o dashboard de vendas" />
      ) : dashboardData.length === 0 ? (
        <EmptyState message="Nenhum indicador configurado para esta empresa" />
      ) : (
        <div className="space-y-6 h-full">
          {/* Cards superiores */}
          <div className="grid grid-cols-4 gap-4">
            {topCards.map(card => (
              <DashboardCard
                key={card.id}
                title={card.titulo}
                value={card.valor || 0}
                variation={card.variacao || 0}
                type={card.tipo_dado || 'moeda'}
              />
            ))}
          </div>

          {/* Cards inferiores */}
          <div className="grid grid-cols-4 gap-4">
            {bottomCards.map(card => (
              <DashboardCard
                key={card.id}
                title={card.titulo}
                value={card.valor || 0}
                variation={card.variacao || 0}
                type={card.tipo_dado || 'moeda'}
              />
            ))}
          </div>

          {/* Gráfico */}
          {chart && (
            <div className="flex-1 min-h-0 bg-gray-800 rounded-xl p-4">
              <h3 className="text-gray-400 font-medium mb-2">{chart.titulo}</h3>
              <div className="h-[calc(100%-2rem)]">
                <DashboardChart
                  title={chart.titulo}
                  data={chart.data || []}
                  type={chart.tipo_dado || 'moeda'}
                  chartType={chart.tipo_grafico}
                  components={chart.chart_components?.map(comp => ({
                    name: comp.categoria?.nome || comp.indicador?.nome || 'Valor',
                    color: comp.cor
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendasPage;