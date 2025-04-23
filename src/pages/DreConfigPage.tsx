import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, Calculator, ChevronRight, ChevronDown } from 'lucide-react';
import { DreConfiguracao } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import DreComponentsModal from '../components/dre/DreComponentsModal';

interface ContaComponente {
  id: string;
  categoria?: {
    id: string;
    nome: string;
    codigo: string;
  } | null;
  indicador?: {
    id: string;
    nome: string;
    codigo: string;
  } | null;
  conta_componente?: {
    id: string;
    nome: string;
  } | null;
  simbolo: '+' | '-' | '=';
}

interface ContaHierarquica extends DreConfiguracao {
  contas_filhas?: ContaHierarquica[];
  nivel: number;
}

const DreConfigPage: React.FC = () => {
  const [selectedConta, setSelectedConta] = useState<DreConfiguracao | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [componentes, setComponentes] = useState<ContaComponente[]>([]);
  const [loadingComponentes, setLoadingComponentes] = useState(false);
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());

  const { data: contas, loading: loadingContas, error, refetch } = useSupabaseQuery<DreConfiguracao>({
    query: () => supabase
      .from('dre_configuracao')
      .select(`
        *,
        conta_pai:dre_configuracao!conta_pai_id (
          id,
          nome
        )
      `)
      .order('ordem'),
  });

  const organizarContasHierarquicamente = (contas: DreConfiguracao[]): ContaHierarquica[] => {
    const contasMap = new Map<string, ContaHierarquica>();
    const contasRaiz: ContaHierarquica[] = [];

    // Primeiro, criar todas as contas com nível inicial 0
    contas.forEach(conta => {
      contasMap.set(conta.id, { ...conta, contas_filhas: [], nivel: 0 });
    });

    // Depois, organizar a hierarquia
    contas.forEach(conta => {
      const contaAtual = contasMap.get(conta.id)!;
      
      if (conta.conta_pai_id) {
        const contaPai = contasMap.get(conta.conta_pai_id);
        if (contaPai) {
          contaPai.contas_filhas?.push(contaAtual);
          contaAtual.nivel = contaPai.nivel + 1;
        }
      } else {
        contasRaiz.push(contaAtual);
      }
    });

    return contasRaiz.sort((a, b) => a.ordem - b.ordem);
  };

  const contasHierarquicas = organizarContasHierarquicamente(contas);

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
          <div className="flex items-center p-4">
            <div
              style={{ paddingLeft: `${conta.nivel * 1.5}rem` }}
              className="flex-1 flex items-center gap-3 cursor-pointer"
              onClick={() => setSelectedConta(conta)}
            >
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(conta.id);
                  }}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
              <span className="text-gray-400 font-mono">{conta.ordem}.</span>
              <span className="text-white font-medium">{conta.nome}</span>
              <span className="text-gray-400 font-mono">{conta.simbolo}</span>
              {!conta.visivel && (
                <span className="text-xs text-gray-400">(Oculto no relatório)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedConta(conta);
                  setIsComponentsModalOpen(true);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Gerenciar Componentes"
              >
                <Calculator size={18} />
              </button>
              <button
                onClick={() => {
                  setSelectedConta(conta);
                  setIsModalOpen(true);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleToggleActive(conta)}
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
                onClick={() => handleDelete(conta)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {conta.contas_filhas!.sort((a, b) => a.ordem - b.ordem).map(contaFilha => renderConta(contaFilha))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (selectedConta) {
      fetchComponentes();
    }
  }, [selectedConta]);

  const fetchComponentes = async () => {
    if (!selectedConta) return;

    setLoadingComponentes(true);
    try {
      const { data, error } = await supabase
        .from('dre_conta_componentes')
        .select(`
          id,
          simbolo,
          categoria:categorias (
            id,
            nome,
            codigo
          ),
          indicador:indicadores (
            id,
            nome,
            codigo
          ),
          conta_componente:dre_configuracao!dre_conta_componentes_conta_componente_id_fkey (
            id,
            nome
          )
        `)
        .eq('conta_id', selectedConta.id);

      if (error) throw error;
      setComponentes(data || []);
    } catch (err) {
      console.error('Erro ao carregar componentes:', err);
    } finally {
      setLoadingComponentes(false);
    }
  };

  const handleSave = async (formData: Partial<DreConfiguracao>) => {
    try {
      setLoading(true);
      if (selectedConta) {
        const { error } = await supabase
          .from('dre_configuracao')
          .update(formData)
          .eq('id', selectedConta.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dre_configuracao')
          .insert([formData]);

        if (error) throw error;
      }

      refetch();
      setIsModalOpen(false);
      setSelectedConta(undefined);
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
      alert('Não foi possível salvar a conta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conta: DreConfiguracao) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase
        .from('dre_configuracao')
        .delete()
        .eq('id', conta.id);

      if (error) throw error;
      refetch();
      if (selectedConta?.id === conta.id) {
        setSelectedConta(undefined);
      }
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      alert('Não foi possível excluir a conta');
    }
  };

  const handleToggleActive = async (conta: DreConfiguracao) => {
    try {
      const { error } = await supabase
        .from('dre_configuracao')
        .update({ ativo: !conta.ativo })
        .eq('id', conta.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      alert('Não foi possível atualizar a conta');
    }
  };

  if (loadingContas) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Coluna Principal (70%) */}
      <div className="flex-[7] bg-gray-800 rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Configuração do DRE</h2>
            <p className="text-gray-400 mt-1">Configure as contas e estrutura do DRE</p>
          </div>
          <Button
            onClick={() => {
              setSelectedConta(undefined);
              setIsModalOpen(true);
            }}
            icon={Plus}
          >
            Nova Conta
          </Button>
        </div>

        {contas.length === 0 ? (
          <EmptyState message="Nenhuma conta configurada." />
        ) : (
          <div className="space-y-2">
            {contasHierarquicas.map(conta => renderConta(conta))}
          </div>
        )}
      </div>

      {/* Coluna Secundária (30%) */}
      <div className="flex-[3] bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">
            {selectedConta ? 'Componentes' : 'Selecione uma conta'}
          </h3>
          {selectedConta && (
            <Button
              variant="secondary"
              icon={Calculator}
              onClick={() => setIsComponentsModalOpen(true)}
            >
              Gerenciar
            </Button>
          )}
        </div>

        {!selectedConta ? (
          <div className="text-gray-400 text-center py-8">
            Selecione uma conta para visualizar seus componentes
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Detalhes da Conta</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  Ordem: <span className="text-white">{selectedConta.ordem}</span>
                </p>
                <p className="text-gray-400">
                  Símbolo: <span className="text-white font-mono">{selectedConta.simbolo}</span>
                </p>
                <p className="text-gray-400">
                  Visível: <span className="text-white">{selectedConta.visivel ? 'Sim' : 'Não'}</span>
                </p>
                {selectedConta.conta_pai && (
                  <p className="text-gray-400">
                    Conta Pai: <span className="text-white">{selectedConta.conta_pai.nome}</span>
                  </p>
                )}
              </div>
            </div>

            {loadingComponentes ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : componentes.length > 0 ? (
              <div className="space-y-2">
                {componentes.map((componente) => (
                  <div key={componente.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono text-gray-400">{componente.simbolo}</span>
                      <div>
                        {componente.categoria ? (
                          <div>
                            <span className="text-white">{componente.categoria.nome}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({componente.categoria.codigo})
                            </span>
                          </div>
                        ) : componente.indicador ? (
                          <div>
                            <span className="text-white">{componente.indicador.nome}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({componente.indicador.codigo})
                            </span>
                          </div>
                        ) : componente.conta_componente ? (
                          <span className="text-white">{componente.conta_componente.nome}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                Nenhum componente configurado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modais */}
      {isModalOpen && (
        <Modal
          title={selectedConta ? 'Editar Conta' : 'Nova Conta'}
          onClose={() => {
            setSelectedConta(undefined);
            setIsModalOpen(false);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
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
                defaultValue={selectedConta?.nome}
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
                defaultValue={selectedConta?.ordem}
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
                defaultValue={selectedConta?.simbolo}
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
                defaultValue={selectedConta?.conta_pai_id || ''}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhuma</option>
                {contas
                  .filter(c => c.id !== selectedConta?.id)
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
                defaultValue={selectedConta?.visivel ? 'true' : 'false'}
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
                onClick={() => {
                  setSelectedConta(undefined);
                  setIsModalOpen(false);
                }}
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
      )}

      {isComponentsModalOpen && selectedConta && (
        <DreComponentsModal
          conta={selectedConta}
          onClose={() => {
            setIsComponentsModalOpen(false);
          }}
          onSave={() => {
            refetch();
            fetchComponentes();
          }}
        />
      )}
    </div>
  );
};

export default DreConfigPage;