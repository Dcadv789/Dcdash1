import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardChartProps {
  title: string;
  data: {
    name: string;
    value: number;
  }[];
  type: 'moeda' | 'numero' | 'percentual';
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  type,
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

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
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
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;