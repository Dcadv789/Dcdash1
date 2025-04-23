import React from 'react';
import { Search } from 'lucide-react';
import { Empresa } from '../../types/database';
import { Button } from '../shared/Button';

interface LancamentoFiltersProps {
  selectedType: 'todos' | 'receita' | 'despesa';
  selectedEmpresa: string;
  selectedYear: number;
  selectedMonth: number | null;
  empresas: Empresa[];
  onTypeChange: (type: 'todos' | 'receita' | 'despesa') => void;
  onEmpresaChange: (empresaId: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | null) => void;
}

const LancamentoFilters: React.FC<LancamentoFiltersProps> = ({
  selectedType,
  selectedEmpresa,
  selectedYear,
  selectedMonth,
  empresas,
  onTypeChange,
  onEmpresaChange,
  onYearChange,
  onMonthChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <select
            value={selectedEmpresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="w-64 bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Todas as empresas</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razao_social}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedMonth || ''}
            onChange={(e) => onMonthChange(e.target.value ? Number(e.target.value) : null)}
            className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Todos os meses</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant={selectedType === 'todos' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('todos')}
            className="px-6"
          >
            Todos
          </Button>
          <Button
            variant={selectedType === 'receita' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('receita')}
            className="px-6"
          >
            Receitas
          </Button>
          <Button
            variant={selectedType === 'despesa' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('despesa')}
            className="px-6"
          >
            Despesas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LancamentoFilters;