import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
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
  const [cardValues, setCardValues] = useState<{ [key: string]: number }>({});
  const [chartData, setChartData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.length > 0) {
      fetchDashboardData();
    }
  }, [data, selectedMonth, selectedYear]);

  const getMesesRange = () => {
    const meses = [];
    let currentDate = new Date(selectedYear, selectedMonth - 1);
    
    // Voltar 12 meses
    currentDate.setMonth(currentDate.getMonth() - 12);
    
    // Gerar array com 13 meses (mês atual + 12 meses anteriores)
    for (let i = 0; i < 13; i++) {
      meses.push({
        mes: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return meses;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const meses = getMesesRange();
    const newCardValues: { [key: string]: number } = {};
    const newChartData: { [key: string]: any[] } = {};

    try {
      // Buscar todos os lançamentos do período
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('empresa_id', data[0].empresa_id)
        .in('mes', meses.map(m => m.mes))
        .in('ano', [...new Set(meses.map(m => m.ano))]);

      // Processar cada configuração
      for (const config of data) {
        if (config.tipo_visualizacao === 'card') {
          // Processar card
          let valor = 0;
          if (config.categoria) {
            valor = lancamentos
              ?.filter(l => 
                l.categoria_id === config.categoria.id && 
                l.mes === selectedMonth && 
                l.ano === selectedYear
              )
              .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
          } else if (config.indicador) {
            valor = lancamentos
              ?.filter(l => 
                l.indicador_id === config.indicador.id && 
                l.mes === selectedMonth && 
                l.ano === selectedYear
              )
              .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
          }
          newCardValues[config.id] = valor;
        } else if (config.tipo_visualizacao === 'chart') {
          // Processar gráfico
          const chartValues = meses.map(({ mes, ano }) => {
            const monthData: { [key: string]: any } = { 
              name: `${mes}/${ano}`
            };
            
            if (config.chart_components) {
              config.chart_components.forEach(comp => {
                let componentValue = 0;
                if (comp.categoria) {
                  componentValue = lancamentos
                    ?.filter(l => 
                      l.categoria_id === comp.categoria.id && 
                      l.mes === mes && 
                      l.ano === ano
                    )
                    .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
                } else if (comp.indicador) {
                  componentValue = lancamentos
                    ?.filter(l => 
                      l.indicador_id === comp.indicador.id && 
                      l.mes === mes && 
                      l.ano === ano
                    )
                    .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
                }
                
                const componentName = comp.categoria?.nome || comp.indicador?.nome || 'Valor';
                monthData[componentName] = componentValue;
              });
            }
            
            return monthData;
          });

          newChartData[config.id] = chartValues;
        }
      }

      setCardValues(newCardValues);
      setChartData(newChartData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular variação em relação ao mês anterior
  const calcularVariacao = (configId: string) => {
    const valorAtual = cardValues[configId] || 0;
    const mesAnterior = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const anoAnterior = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    // Buscar valor do mês anterior nos lançamentos
    const config = data.find(c => c.id === configId);
    if (!config) return 0;

    const valorAnterior = chartData[configId]?.find(d => {
      const [mes, ano] = d.name.split('/');
      return parseInt(mes) === mesAnterior && parseInt(ano) === anoAnterior;
    })?.value || 0;

    if (valorAnterior === 0) return 0;
    return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  // Organizar os cards por posição
  const topCards = data.filter(item => item.posicao >= 1 && item.posicao <= 4);
  const middleCard = data.find(item => item.posicao === 5);
  const bottomCards = data.filter(item => item.posicao >= 6 && item.posicao <= 7);

  // Helper function para determinar o tipo de dado
  const getDataType = (item: any) => {
    if (item?.indicador) {
      return item.indicador.tipo_dado;
    }
    if (item?.categoria) {
      return 'moeda';
    }
    return 'moeda';
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      {/* Top row - 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {topCards.map(card => (
          <DashboardCard
            key={card.id}
            title={card.titulo}
            value={cardValues[card.id] || 0}
            variation={calcularVariacao(card.id)}
            type={getDataType(card)}
          />
        ))}
      </div>

      {/* Middle row - 1 chart */}
      {middleCard && (
        <div className="flex-1 min-h-0 bg-gray-800 rounded-xl p-4">
          <h3 className="text-gray-400 font-medium mb-2">{middleCard.titulo}</h3>
          <div className="h-[calc(100%-2rem)]">
            <DashboardChart
              title={middleCard.titulo}
              data={chartData[middleCard.id] || []}
              type={getDataType(middleCard)}
              chartType={middleCard.tipo_grafico}
              components={middleCard.chart_components?.map(comp => ({
                name: comp.categoria?.nome || comp.indicador?.nome || 'Valor',
                color: comp.cor
              }))}
            />
          </div>
        </div>
      )}

      {/* Bottom row - 2 cards */}
      <div className="grid grid-cols-2 gap-4 h-64">
        {bottomCards.map(card => (
          <div key={card.id} className="h-full">
            <DashboardCard
              title={card.titulo}
              value={cardValues[card.id] || 0}
              variation={calcularVariacao(card.id)}
              type={getDataType(card)}
              fullWidth
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;