import React from 'react';
import { Search } from 'lucide-react';
import { Empresa } from '../../types/database';
import { Button } from '../shared/Button';

interface CategoryFiltersProps {
  selectedType: 'todos' | 'receita' | 'despesa';
  selectedEmpresa: string;
  empresas: Empresa[];
  onTypeChange: (type: 'todos' | 'receita' | 'despesa') => void;
  onEmpresaChange: (empresaId: string) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedType,
  selectedEmpresa,
  empresas,
  onTypeChange,
  onEmpresaChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <select
            value={selectedEmpresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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

export default CategoryFilters;