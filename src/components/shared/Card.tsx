import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CardProps {
  title: string;
  value: number;
  variation?: number;
  type?: 'moeda' | 'numero' | 'percentual';
  fullWidth?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  variation = 0,
  type = 'moeda',
  fullWidth = false,
  className = '',
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
    <div className={`bg-gray-800 rounded-xl p-4 h-full flex flex-col justify-between ${fullWidth ? 'col-span-2' : ''} ${className}`}>
      <h3 className="text-gray-400 font-medium mb-2 truncate">{title}</h3>
      <div>
        <p className="text-2xl font-semibold text-white mb-1">
          {formatValue(value)}
        </p>
        {variation !== undefined && (
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
        )}
      </div>
    </div>
  );
};