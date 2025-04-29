import React, { useState, useEffect } from 'react';
import { DreConfiguracao } from '../../types/database';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

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
  const [isFormula, setIsFormula] = useState(false);
  const [formula, setFormula] = useState({
    operando1Id: '',
    operando1Tipo: 'conta',
    operador: '+',
    operando2Id: '',
    operando2Tipo: 'conta'
  });

  useEffect(() => {
    if (conta) {
      // Verificar se a conta tem fórmula
      const checkFormula = async () => {
        const { data } = await supabase
          .from('dre_conta_formulas')
          .select('*')
          .eq('conta_id', conta.id)
          .single();

        if (data) {
          setIsFormula(true);
          setFormula({
            operando1Id: data.operando_1_id,
            operando1Tipo: data.operando_1_tipo,
            operador: data.operador,
            operando2Id: data.operando_2_id,
            operando2Tipo: data.operando_2_tipo
          });
        }
      };

      checkFormula();
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contaData = {
      nome: formData.get('nome') as string,
      ordem: parseInt(formData.get('ordem') as string),
      simbolo: formData.get('simbolo') as '+' | '-' | '=',
      conta_pai_id: formData.get('conta_pai_id') as string || null,
      visivel: formData.get('visivel') === 'true',
    };

    // Se for uma conta com fórmula, salvar a fórmula após salvar a conta
    if (isFormula) {
      const { data: savedConta } = await supabase
        .from('dre_configuracao')
        .upsert([contaData])
        .select()
        .single();

      if (savedConta) {
        await supabase
          .from('dre_conta_formulas')
          .upsert([{
            conta_id: savedConta.id,
            operando_1_id: formula.operando1Id,
            operando_1_tipo: formula.operando1Tipo,
            operador: formula.operador,
            operando_2_id: formula.operando2Id,
            operando_2_tipo: formula.operando2Tipo,
            ordem: 1
          }]);
      }
    }

    onSave(contaData);
  };

  return (
    <Modal
      title={conta ? 'Editar Conta' : 'Nova Conta'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Tipo de Conta
          </label>
          <select
            value={isFormula ? 'formula' : 'normal'}
            onChange={(e) => setIsFormula(e.target.value === 'formula')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="formula">Fórmula</option>
          </select>
        </div>

        {isFormula ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Primeiro Operando
                </label>
                <select
                  value={formula.operando1Id}
                  onChange={(e) => setFormula(prev => ({ ...prev, operando1Id: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isFormula}
                >
                  <option value="">Selecione uma conta</option>
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Operador
                </label>
                <select
                  value={formula.operador}
                  onChange={(e) => setFormula(prev => ({ ...prev, operador: e.target.value as '+' | '-' | '*' | '/' }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isFormula}
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="*">×</option>
                  <option value="/">/</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Segundo Operando
              </label>
              <select
                value={formula.operando2Id}
                onChange={(e) => setFormula(prev => ({ ...prev, operando2Id: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={isFormula}
              >
                <option value="">Selecione uma conta</option>
                {contas.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

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