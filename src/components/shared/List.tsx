import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ListProps {
  title: string;
  items: {
    id: string;
    nome: string;
    valor: number;
  }[];
  type: 'moeda' | 'numero' | 'percentual';
  fullWidth?: boolean;
}

export const List: React.FC<ListProps> = ({
  title,
  items,
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
    <div className={`bg-gray-800 rounded-xl p-4 h-full flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
      <h3 className="text-gray-400 font-medium mb-4 truncate">{title}</h3>
      
      <div className="flex-1 space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhum dado disponível</p>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{index + 1}.</span>
                <span className="text-white truncate">{item.nome}</span>
              </div>
              <div className={`flex items-center gap-1 ${
                item.valor >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.valor >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                <span className="font-mono">{formatValue(item.valor)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};