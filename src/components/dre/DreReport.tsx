import React from 'react';
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
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  };

  const renderConta = (conta: ContaCalculada, nivel: number = 0) => {
    if (!conta.visivel) return null;

    return (
      <React.Fragment key={conta.id}>
        <tr className="border-b border-gray-700">
          <td className="p-4 sticky left-0 bg-gray-800" style={{ paddingLeft: `${nivel * 2 + 1}rem` }}>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{conta.nome}</span>
            </div>
          </td>
          {meses.map(({ mes, ano }) => (
            <td key={`${ano}-${mes}`} className="p-4 text-right min-w-[120px]">
              <span className={`font-mono ${conta.valores[`${ano}-${mes}`] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatValue(conta.valores[`${ano}-${mes}`] || 0)}
              </span>
            </td>
          ))}
          <td className="p-4 text-right min-w-[120px] bg-gray-700/50">
            <span className={`font-mono font-medium ${conta.total12Meses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatValue(conta.total12Meses)}
            </span>
          </td>
        </tr>
        {conta.contas_filhas?.map(contaFilha => renderConta(contaFilha, nivel + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 sticky left-0 bg-gray-800 z-10 text-gray-400">Conta</th>
              {meses.map(({ mes, ano }) => (
                <th key={`${ano}-${mes}`} className="text-right p-4 text-gray-400 min-w-[120px]">
                  {getMonthName(mes)}/{String(ano).slice(2)}
                </th>
              ))}
              <th className="text-right p-4 text-gray-400 min-w-[120px] bg-gray-700/50">
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