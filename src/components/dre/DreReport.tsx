import React from 'react';
import { DreConfiguracao } from '../../types/database';

interface ContaCalculada extends DreConfiguracao {
  valor: number;
  contas_filhas?: ContaCalculada[];
}

interface DreReportProps {
  contas: ContaCalculada[];
}

const DreReport: React.FC<DreReportProps> = ({ contas }) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderConta = (conta: ContaCalculada, nivel: number = 0) => {
    if (!conta.visivel) return null;

    return (
      <React.Fragment key={conta.id}>
        <tr className="border-b border-gray-700">
          <td className="p-4" style={{ paddingLeft: `${nivel * 2 + 1}rem` }}>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{conta.nome}</span>
            </div>
          </td>
          <td className="p-4 text-right">
            <span className={`font-mono ${conta.valor >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatValue(conta.valor)}
            </span>
          </td>
        </tr>
        {conta.contas_filhas?.map(contaFilha => renderConta(contaFilha, nivel + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-4 text-gray-400">Conta</th>
            <th className="text-right p-4 text-gray-400">Valor</th>
          </tr>
        </thead>
        <tbody>
          {contas.map(conta => renderConta(conta))}
        </tbody>
      </table>
    </div>
  );
};

export default DreReport;