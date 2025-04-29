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
  showVariation?: boolean;
}

const DreReport: React.FC<DreReportProps> = ({ contas, meses, showVariation = false }) => {
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      signDisplay: 'never',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(Math.abs(value));
  };

  const formatVariation = (variation: number) => {
    return new Intl.NumberFormat('pt-BR', {
      signDisplay: 'never',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(Math.abs(variation));
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

  const calcularVariacao = (conta: ContaCalculada, mesAtual: number, anoAtual: number): number => {
    const periodoAtual = `${anoAtual}-${mesAtual}`;
    const valorAtual = calcularValorConta(conta, periodoAtual);

    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
    const periodoAnterior = `${anoAnterior}-${mesAnterior}`;
    const valorAnterior = calcularValorConta(conta, periodoAnterior);

    if (valorAnterior === 0) return 0;
    return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
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

  const renderConta = (conta: ContaCalculada, nivel: number = 0, isEven: boolean = false) => {
    if (!conta.visivel) return null;

    const hasChildren = conta.contas_filhas && conta.contas_filhas.length > 0;
    const isExpanded = expandedContas.has(conta.id);

    return (
      <React.Fragment key={conta.id}>
        <tr className={`${isEven ? 'bg-gray-800/10' : ''}`}>
          <td className={`p-2 sticky left-0 z-10 whitespace-nowrap ${isEven ? 'bg-black/90' : 'bg-black/90'}`} style={{ paddingLeft: `${nivel * 2 + 2}rem` }}>
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
            const variacao = calcularVariacao(conta, mes, ano);

            return (
              <React.Fragment key={`${ano}-${mes}`}>
                <td className="p-2 text-right whitespace-nowrap">
                  <span className={`font-mono ${valor >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatValue(valor)}
                  </span>
                </td>
                {showVariation && (
                  <td className="p-2 text-right whitespace-nowrap">
                    <span className={`font-mono ${variacao >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatVariation(variacao)}%
                    </span>
                  </td>
                )}
              </React.Fragment>
            );
          })}
          <td className="p-2 text-right whitespace-nowrap">
            <span className={`font-mono font-medium ${calcularTotal12Meses(conta) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatValue(calcularTotal12Meses(conta))}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          conta.contas_filhas.map((contaFilha, index) => renderConta(contaFilha, nivel + 1, !isEven))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2 pl-8 sticky left-0 z-10 bg-black whitespace-nowrap text-gray-400">Conta</th>
              {meses.map(({ mes, ano }) => (
                <React.Fragment key={`${ano}-${mes}`}>
                  <th className="text-right p-2 text-gray-400 whitespace-nowrap">
                    {getMonthName(mes)}/{String(ano).slice(2)}
                  </th>
                  {showVariation && (
                    <th className="text-right p-2 text-gray-400 whitespace-nowrap">
                      Var %
                    </th>
                  )}
                </React.Fragment>
              ))}
              <th className="text-right p-2 text-gray-400 whitespace-nowrap">
                Total 12M
              </th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta, index) => renderConta(conta, 0, index % 2 === 0))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DreReport;