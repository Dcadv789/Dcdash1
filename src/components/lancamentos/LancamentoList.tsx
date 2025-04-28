import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Lancamento } from '../../types/database';

interface LancamentoListProps {
  lancamentos: Lancamento[];
  onView: (lancamento: Lancamento) => void;
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (lancamento: Lancamento) => void;
}

const LancamentoList: React.FC<LancamentoListProps> = ({
  lancamentos,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const getClassificacao = (lancamento: Lancamento) => {
    if (lancamento.categoria) return `Categoria: ${lancamento.categoria.nome}`;
    if (lancamento.indicador) return `Indicador: ${lancamento.indicador.nome}`;
    if (lancamento.cliente) return `Cliente: ${lancamento.cliente.razao_social}`;
    return 'Não classificado';
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-4 text-gray-400">Data</th>
            <th className="text-left p-4 text-gray-400">Tipo</th>
            <th className="text-left p-4 text-gray-400">Valor</th>
            <th className="text-left p-4 text-gray-400">Classificação</th>
            <th className="text-left p-4 text-gray-400">Empresa</th>
            <th className="text-right p-4 text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((lancamento) => (
            <tr key={lancamento.id} className="border-b border-gray-700">
              <td className="p-4 text-white">
                {getMonthName(lancamento.mes)}/{lancamento.ano}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lancamento.tipo === 'receita'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td className="p-4 text-white font-mono">
                {formatValue(lancamento.valor)}
              </td>
              <td className="p-4 text-white">
                {getClassificacao(lancamento)}
              </td>
              <td className="p-4 text-white">
                {lancamento.empresa?.razao_social || '-'}
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(lancamento)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(lancamento)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(lancamento)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LancamentoList;