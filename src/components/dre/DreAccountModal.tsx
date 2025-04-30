import React, { useState, useEffect } from 'react';
import { DreConfiguracao } from '../../types/database';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

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
    operando1Tipo: 'conta' as 'conta' | 'indicador' | 'categoria',
    operador: '+' as '+' | '-' | '*' | '/',
    operando2Id: '',
    operando2Tipo: 'conta' as 'conta' | 'indicador' | 'categoria'
  });
  const [categorias, setCategorias] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);

  useEffect(() => {
    fetchDependencies();
    if (conta) {
      checkFormula();
    }
  }, [conta]);

  const fetchDependencies = async () => {
    const [categoriasRes, indicadoresRes] = await Promise.all([
      supabase.from('categorias').select('*').eq('ativo', true),
      supabase.from('indicadores').select('*').eq('ativo', true)
    ]);

    if (categoriasRes.data) setCategorias(categoriasRes.data);
    if (indicadoresRes.data) setIndicadores(indicadoresRes.data);
  };

  const checkFormula = async () => {
    if (!conta) return;

    const { data } = await supabase
      .from('dre_conta_formulas')
      .select('*')
      .eq('conta_id', conta.id)
      .maybeSingle();

    if (data) {
      setIsFormula(true);
      setFormula({
        operando1Id: data.operando_1_id || '',
        operando1Tipo: data.operando_1_tipo || 'conta',
        operador: data.operador || '+',
        operando2Id: data.operando_2_id || '',
        operando2Tipo: data.operando_2_tipo || 'conta'
      });
    } else {
      setIsFormula(false);
      setFormula({
        operando1Id: '',
        operando1Tipo: 'conta',
        operador: '+',
        operando2Id: '',
        operando2Tipo: 'conta'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contaData = {
      nome: formData.get('nome') as string,
      ordem: parseInt(formData.get('ordem') as string),
      simbolo: formData.get('simbolo') as '+' | '-' | '=',
      conta_pai_id: formData.get('conta_pai_id') as string || null,
      visivel: formData.get('visivel') === 'true',
    };

    try {
      // Salvar a conta
      const { data: savedConta, error: contaError } = await supabase
        .from('dre_configuracao')
        .upsert([{
          id: conta?.id,
          ...contaData,
          ativo: true // Garantir que a conta permaneça ativa
        }])
        .select()
        .single();

      if (contaError) throw contaError;

      // Se for uma conta com fórmula, salvar a fórmula
      if (isFormula && savedConta) {
        // Primeiro, remover fórmula existente se houver
        await supabase
          .from('dre_conta_formulas')
          .delete()
          .eq('conta_id', savedConta.id);

        // Inserir nova fórmula
        const { error: formulaError } = await supabase
          .from('dre_conta_formulas')
          .insert([{
            conta_id: savedConta.id,
            operando_1_id: formula.operando1Id,
            operando_1_tipo: formula.operando1Tipo,
            operador: formula.operador,
            operando_2_id: formula.operando2Id,
            operando_2_tipo: formula.operando2Tipo,
            ordem: 1
          }]);

        if (formulaError) throw formulaError;
      } else if (savedConta) {
        // Se não é mais uma fórmula, remover fórmulas existentes
        await supabase
          .from('dre_conta_formulas')
          .delete()
          .eq('conta_id', savedConta.id);
      }

      onSave(contaData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar conta');
    }
  };

  const renderOperandoSelect = (
    tipo: 'operando1' | 'operando2',
    label: string
  ) => {
    const value = tipo === 'operando1' ? formula.operando1Id : formula.operando2Id;
    const tipoValue = tipo === 'operando1' ? formula.operando1Tipo : formula.operando2Tipo;
    
    return (
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tipo do {label}
          </label>
          <select
            value={tipoValue}
            onChange={(e) => {
              const newTipo = e.target.value as 'conta' | 'indicador' | 'categoria';
              if (tipo === 'operando1') {
                setFormula(prev => ({ ...prev, operando1Tipo: newTipo, operando1Id: '' }));
              } else {
                setFormula(prev => ({ ...prev, operando2Tipo: newTipo, operando2Id: '' }));
              }
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="conta">Conta</option>
            <option value="categoria">Categoria</option>
            <option value="indicador">Indicador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            {label}
          </label>
          <select
            value={value}
            onChange={(e) => {
              if (tipo === 'operando1') {
                setFormula(prev => ({ ...prev, operando1Id: e.target.value }));
              } else {
                setFormula(prev => ({ ...prev, operando2Id: e.target.value }));
              }
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={isFormula}
          >
            <option value="">Selecione...</option>
            {tipoValue === 'conta' && contas.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
            {tipoValue === 'categoria' && categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
            {tipoValue === 'indicador' && indicadores.map(i => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </select>
        </div>
      </div>
    );
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

        {isFormula && (
          <div className="space-y-4 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Fórmula</h3>
            
            {renderOperandoSelect('operando1', 'Primeiro Operando')}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Operador
              </label>
              <select
                value={formula.operador}
                onChange={(e) => setFormula(prev => ({ 
                  ...prev, 
                  operador: e.target.value as '+' | '-' | '*' | '/' 
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={isFormula}
              >
                <option value="+">+ (Soma)</option>
                <option value="-">- (Subtração)</option>
                <option value="*">× (Multiplicação)</option>
                <option value="/">&divide; (Divisão)</option>
              </select>
            </div>

            {renderOperandoSelect('operando2', 'Segundo Operando')}
          </div>
        )}

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