import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartProps {
  data: any[];
  type: 'moeda' | 'numero' | 'percentual';
  chartType?: 'line' | 'bar';
  components?: {
    name: string;
    color: string;
  }[];
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  chartType = 'line',
  components = [{ name: 'value', color: '#3B82F6' }]
}) => {
  const formatValue = (value: number) => {
    switch (type) {
      case 'moeda':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentual':
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const formatDate = (dateStr: string) => {
    const [month, year] = dateStr.split('/');
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  };

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
  const DataComponent = chartType === 'bar' ? Bar : Line;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="name" 
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={formatDate}
        />
        <YAxis 
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={formatValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#F9FAFB'
          }}
          formatter={(value: number) => [formatValue(value), 'Valor']}
          labelFormatter={formatDate}
        />
        <Legend />
        {components.map((comp, index) => (
          <DataComponent
            key={index}
            type="monotone"
            dataKey={comp.name}
            stroke={comp.color}
            fill={chartType === 'bar' ? comp.color : undefined}
            strokeWidth={2}
            dot={chartType === 'line' ? { fill: comp.color } : undefined}
            name={comp.name}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
};