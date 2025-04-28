import React from 'react';
import DashboardCard from './DashboardCard';
import DashboardChart from './DashboardChart';

interface DashboardGridProps {
  data: any[];
  selectedMonth: number;
  selectedYear: number;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  data,
  selectedMonth,
  selectedYear,
}) => {
  // Organizar os cards por posição
  const topCards = data.filter(item => item.posicao >= 1 && item.posicao <= 4);
  const chart = data.find(item => item.posicao === 5);
  const bottomCards = data.filter(item => item.posicao >= 6 && item.posicao <= 7);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Top Cards */}
      {topCards.map(card => (
        <DashboardCard
          key={card.id}
          title={card.titulo}
          value={0} // TODO: Implementar cálculo do valor
          variation={0} // TODO: Implementar cálculo da variação
          type={card.indicador.tipo_dado}
        />
      ))}

      {/* Chart */}
      {chart && (
        <DashboardChart
          title={chart.titulo}
          data={[]} // TODO: Implementar dados do gráfico
          type={chart.indicador.tipo_dado}
        />
      )}

      {/* Bottom Cards */}
      {bottomCards.map(card => (
        <DashboardCard
          key={card.id}
          title={card.titulo}
          value={0} // TODO: Implementar cálculo do valor
          variation={0} // TODO: Implementar cálculo da variação
          type={card.indicador.tipo_dado}
          fullWidth
        />
      ))}
    </div>
  );
};

export default DashboardGrid;