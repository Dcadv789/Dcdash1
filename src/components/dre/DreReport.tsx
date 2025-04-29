import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DreConfiguracao } from '../../types/database';

interface ContaCalculada extends DreConfiguracao {
  valores: { [key: string]: number };
  total12Meses: number;
  contas_filhas?: ContaCalculada[];
}

interface DreReportProps {
  contas: ContaCalculada[];
  meses: { mes: number; ano: number }[];
}

const DreReport: React.FC<DreReportProps> = ({ contas, meses }) => {
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      signDisplay: 'never',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(Math.abs(value));
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  };

  const toggleExpanded = (contaId: string) => {
    setExpandedContas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contaId)) {
        newSet.delete(contaId);
      } else {
        newSet.add(contaId);
      }
      return newSet;
    });
  };

  const calcularValorConta = (conta: ContaCalculada, periodo: string): number => {
    if (!conta.contas_filhas || conta.contas_filhas.length === 0) {
      return conta.valores[periodo] || 0;
    }

    return conta.contas_filhas.reduce((total, contaFilha) => {
      const valorFilha = calcularValorConta(contaFilha, periodo);
      return total + valorFilha;
    }, 0);
  };

  const calcularTotal12Meses = (conta: ContaCalculada): number => {
    if (!conta.contas_filhas || conta.contas_filhas.length === 0) {
      return conta.total12Meses;
    }

    return conta.contas_filhas.reduce((total, contaFilha) => {
      const valorFilha = calcularTotal12Meses(contaFilha);
      return total + valorFilha;
    }, 0);
  };

  const renderConta = (conta: ContaCalculada, nivel: number = 0) => {
    if (!conta.visivel) return null;

    const hasChildren = conta.contas_filhas && conta.contas_filhas.length > 0;
    const isExpanded = expandedContas.has(conta.id);

    return (
      <React.Fragment key={conta.id}>
        <tr className="border-b border-gray-700">
          <td className="p-2 sticky left-0 bg-gray-800 z-10 whitespace-nowrap" style={{ paddingLeft: `${nivel * 2 + 1}rem` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(conta.id)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              ) : (
                <div className="w-[26px]" />
              )}
              <span className="text-gray-400 font-mono">{conta.simbolo}</span>
              <span className="text-white font-medium">{conta.nome}</span>
            </div>
          </td>
          {meses.map(({ mes, ano }) => {
            const periodo = `${ano}-${mes}`;
            const valor = calcularValorConta(conta, periodo);
            return (
              <td key={`${ano}-${mes}`} className="p-2 text-right whitespace-nowrap">
                <span className={`font-mono ${valor >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatValue(valor)}
                </span>
              </td>
            );
          })}
          <td className="p-2 text-right whitespace-nowrap bg-gray-700/50">
            <span className={`font-mono font-medium ${calcularTotal12Meses(conta) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatValue(calcularTotal12Meses(conta))}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          conta.contas_filhas.map(contaFilha => renderConta(contaFilha, nivel + 1))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2 sticky left-0 bg-gray-800 z-10 whitespace-nowrap text-gray-400">Conta</th>
              {meses.map(({ mes, ano }) => (
                <th key={`${ano}-${mes}`} className="text-right p-2 text-gray-400 whitespace-nowrap">
                  {getMonthName(mes)}/{String(ano).slice(2)}
                </th>
              ))}
              <th className="text-right p-2 text-gray-400 whitespace-nowrap bg-gray-700/50">
                Total 12M
              </th>
            </tr>
          </thead>
          <tbody>
            {contas.map(conta => renderConta(conta))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DreReport;