import React from 'react';
import { Building2, Calculator, Pencil, Power, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { DreConfiguracao } from '../../types/database';

interface ContaHierarquica extends DreConfiguracao {
  contas_filhas?: ContaHierarquica[];
  nivel: number;
}

interface DreAccountListProps {
  contas: ContaHierarquica[];
  selectedConta?: DreConfiguracao;
  expandedContas: Set<string>;
  onSelectConta: (conta: DreConfiguracao) => void;
  onToggleExpanded: (contaId: string) => void;
  onManageCompanies: (conta: DreConfiguracao) => void;
  onManageComponents: (conta: DreConfiguracao) => void;
  onEdit: (conta: DreConfiguracao) => void;
  onToggleActive: (conta: DreConfiguracao) => void;
  onDelete: (conta: DreConfiguracao) => void;
}

const DreAccountList: React.FC<DreAccountListProps> = ({
  contas,
  selectedConta,
  expandedContas,
  onSelectConta,
  onToggleExpanded,
  onManageCompanies,
  onManageComponents,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const renderConta = (conta: ContaHierarquica) => {
    const hasChildren = conta.contas_filhas && conta.contas_filhas.length > 0;
    const isExpanded = expandedContas.has(conta.id);

    return (
      <div key={conta.id} className="space-y-2">
        <div
          className={`bg-gray-700 rounded-lg transition-colors ${
            selectedConta?.id === conta.id ? 'ring-2 ring-blue-500' : ''
          } hover:bg-gray-600`}
        >
          <div className="flex items-center p-4" style={{ paddingLeft: `${conta.nivel * 2 + 1}rem` }}>
            <div
              className="flex-1 flex items-center gap-3 cursor-pointer"
              onClick={() => onSelectConta(conta)}
            >
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpanded(conta.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-[26px]" />}
              <span className="text-gray-400 font-mono">{conta.ordem}.</span>
              <span className="text-white font-medium">{conta.nome}</span>
              <span className="text-gray-400 font-mono">{conta.simbolo}</span>
              {!conta.visivel && (
                <span className="text-xs text-gray-400">(Oculto no relatório)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onManageCompanies(conta)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Gerenciar Empresas"
              >
                <Building2 size={18} />
              </button>
              <button
                onClick={() => onManageComponents(conta)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Gerenciar Componentes"
              >
                <Calculator size={18} />
              </button>
              <button
                onClick={() => onEdit(conta)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => onToggleActive(conta)}
                className={`p-2 rounded-lg transition-colors ${
                  conta.ativo
                    ? 'text-green-500 hover:text-green-400'
                    : 'text-red-500 hover:text-red-400'
                } hover:bg-gray-700`}
                title={conta.ativo ? 'Desativar' : 'Ativar'}
              >
                <Power size={18} />
              </button>
              <button
                onClick={() => onDelete(conta)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-2 ml-4">
            {conta.contas_filhas!
              .sort((a, b) => a.ordem - b.ordem)
              .map(contaFilha => renderConta(contaFilha))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {contas.map(conta => renderConta(conta))}
    </div>
  );
};

export default DreAccountList;