import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardChartProps {
  title: string;
  data: {
    name: string;
    [key: string]: any;
  }[];
  type: 'moeda' | 'numero' | 'percentual';
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  components?: {
    name: string;
    color: string;
  }[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
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

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
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
              <Bar
                key={index}
                dataKey={comp.name}
                fill={comp.color}
                name={comp.name}
              />
            ))}
          </BarChart>
        );

      default:
        return (
          <LineChart data={data}>
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
              <Line
                key={index}
                type="monotone"
                dataKey={comp.name}
                stroke={comp.color}
                strokeWidth={2}
                dot={{ fill: comp.color }}
                name={comp.name}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;