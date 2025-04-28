import React from 'react';
import { Lancamento } from '../../types/database';
import { Modal } from '../shared/Modal';

interface LancamentoViewModalProps {
  lancamento: Lancamento;
  onClose: () => void;
}

const LancamentoViewModal: React.FC<LancamentoViewModalProps> = ({
  lancamento,
  onClose,
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

  const getClassificacao = () => {
    if (lancamento.categoria) return `Categoria: ${lancamento.categoria.nome}`;
    if (lancamento.indicador) return `Indicador: ${lancamento.indicador.nome}`;
    if (lancamento.cliente) return `Cliente: ${lancamento.cliente.razao_social}`;
    return 'Não classificado';
  };

  return (
    <Modal
      title="Detalhes do Lançamento"
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Valor
            </label>
            <p className="text-lg text-white font-mono">
              {formatValue(lancamento.valor)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo
            </label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              lancamento.tipo === 'receita'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Data
            </label>
            <p className="text-lg text-white">
              {getMonthName(lancamento.mes)}/{lancamento.ano}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Empresa
            </label>
            <p className="text-lg text-white">
              {lancamento.empresa?.razao_social || '-'}
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Classificação
            </label>
            <p className="text-lg text-white">
              {getClassificacao()}
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Descrição
            </label>
            <p className="text-lg text-white">
              {lancamento.descricao || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Criado em
            </label>
            <p className="text-lg text-white">
              {new Date(lancamento.criado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Última atualização
            </label>
            <p className="text-lg text-white">
              {new Date(lancamento.atualizado_em).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LancamentoViewModal;