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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as empresas</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razao_social}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant={selectedType === 'todos' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('todos')}
          >
            Todos
          </Button>
          <Button
            variant={selectedType === 'receita' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('receita')}
          >
            Receitas
          </Button>
          <Button
            variant={selectedType === 'despesa' ? 'primary' : 'secondary'}
            onClick={() => onTypeChange('despesa')}
          >
            Despesas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;