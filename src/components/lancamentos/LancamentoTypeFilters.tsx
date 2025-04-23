import React from 'react';
import { Button } from '../shared/Button';

interface LancamentoTypeFiltersProps {
  selectedType: 'todos' | 'receita' | 'despesa';
  onTypeChange: (type: 'todos' | 'receita' | 'despesa') => void;
}

const LancamentoTypeFilters: React.FC<LancamentoTypeFiltersProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="flex gap-2">
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
  );
};

export default LancamentoTypeFilters;