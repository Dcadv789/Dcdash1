import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number;
  variation: number;
  type: 'moeda' | 'numero' | 'percentual';
  fullWidth?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  variation,
  type,
  fullWidth = false,
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
    <div className={`bg-gray-800 rounded-xl p-6 ${fullWidth ? 'col-span-2' : ''}`}>
      <h3 className="text-gray-400 font-medium mb-4">{title}</h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-white mb-2">
            {formatValue(value)}
          </p>
          <div className={`flex items-center gap-1 text-sm ${
            variation >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {variation >= 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>{Math.abs(variation).toFixed(2)}% em relação ao mês anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;