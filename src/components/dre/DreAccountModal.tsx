import React from 'react';
import { DreConfiguracao } from '../../types/database';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface DreAccountModalProps {
  conta?: DreConfiguracao;
  contas: DreConfiguracao[];
  loading: boolean;
  onClose: () => void;
  onSave: (formData: Partial<DreConfiguracao>) => void;
}

const DreAccountModal: React.FC<DreAccountModalProps> = ({
  conta,
  contas,
  loading,
  onClose,
  onSave,
}) => {
  return (
    <Modal
      title={conta ? 'Editar Conta' : 'Nova Conta'}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSave({
            nome: formData.get('nome') as string,
            ordem: parseInt(formData.get('ordem') as string),
            simbolo: formData.get('simbolo') as '+' | '-' | '=',
            conta_pai_id: formData.get('conta_pai_id') as string || null,
            visivel: formData.get('visivel') === 'true',
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Nome
          </label>
          <input
            type="text"
            name="nome"
            defaultValue={conta?.nome}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Ordem
          </label>
          <input
            type="number"
            name="ordem"
            defaultValue={conta?.ordem}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Símbolo
          </label>
          <select
            name="simbolo"
            defaultValue={conta?.simbolo}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="+">+ (Soma)</option>
            <option value="-">- (Subtração)</option>
            <option value="=">&equals; (Resultado)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Conta Pai
          </label>
          <select
            name="conta_pai_id"
            defaultValue={conta?.conta_pai_id || ''}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Nenhuma</option>
            {contas
              .filter(c => c.id !== conta?.id)
              .map(conta => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Visível no Relatório
          </label>
          <select
            name="visivel"
            defaultValue={conta?.visivel ? 'true' : 'false'}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DreAccountModal;