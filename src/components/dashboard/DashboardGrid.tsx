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

  // Helper function para determinar o tipo de dado baseado no indicador ou categoria
  const getDataType = (item: any) => {
    if (item?.indicador) {
      return item.indicador.tipo_dado;
    }
    if (item?.categoria) {
      return 'moeda'; // Categorias sempre são valores monetários
    }
    return 'moeda'; // Valor padrão
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
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

      {/* Middle row - 1 chart */}
      {middleCard && (
        <div className="bg-gray-800 rounded-xl p-4 h-[400px]">
          <h3 className="text-gray-400 font-medium mb-2">{middleCard.titulo}</h3>
          <div className="h-[calc(100%-2rem)]">
            <DashboardChart
              title={middleCard.titulo}
              data={middleCard.chart_components?.map((comp: any) => ({
                name: `Componente ${comp.ordem + 1}`,
                value: 0 // TODO: Implementar cálculo do valor
              })) || []}
              type={getDataType(middleCard)}
            />
          </div>
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
            fullWidth
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;