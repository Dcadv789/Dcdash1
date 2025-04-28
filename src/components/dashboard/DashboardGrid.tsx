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
  const middleCard = data.find(item => item.posicao === 5);
  const bottomCards = data.filter(item => item.posicao >= 6 && item.posicao <= 7);

  // Helper function to get the data type safely
  const getDataType = (item: any) => {
    if (item?.indicador?.tipo_dado) {
      return item.indicador.tipo_dado;
    }
    if (item?.categoria?.tipo_dado) {
      return item.categoria.tipo_dado;
    }
    return 'number'; // Default type if neither is available
  };

  return (
    <div className="space-y-6">
      {/* Top row - 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {topCards.map(card => (
          <DashboardCard
            key={card.id}
            title={card.titulo}
            value={0} // TODO: Implementar cálculo do valor
            variation={0} // TODO: Implementar cálculo da variação
            type={getDataType(card)}
          />
        ))}
      </div>

      {/* Middle row - 1 card */}
      {middleCard && (
        <div className="w-1/2">
          <DashboardCard
            title={middleCard.titulo}
            value={0} // TODO: Implementar cálculo do valor
            variation={0} // TODO: Implementar cálculo da variação
            type={getDataType(middleCard)}
          />
        </div>
      )}

      {/* Bottom row - 2 cards */}
      <div className="grid grid-cols-2 gap-4">
        {bottomCards.map(card => (
          <DashboardCard
            key={card.id}
            title={card.titulo}
            value={0} // TODO: Implementar cálculo do valor
            variation={0} // TODO: Implementar cálculo da variação
            type={getDataType(card)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;