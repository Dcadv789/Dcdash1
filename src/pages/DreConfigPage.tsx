import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Power, Eye, Building2, Search, Calculator } from 'lucide-react';
import { DreConfiguracao, Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import DreComponentsModal from '../components/dre/DreComponentsModal';

const DreConfigPage: React.FC = () => {
  const [selectedConta, setSelectedConta] = useState<DreConfiguracao | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Todas as empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.razao_social}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {contas.length === 0 ? (
        <EmptyState message="Nenhuma conta configurada." />
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400">Nome</th>
                <th className="text-left p-4 text-gray-400">Ordem</th>
                <th className="text-left p-4 text-gray-400">Símbolo</th>
                <th className="text-left p-4 text-gray-400">Conta Pai</th>
                <th className="text-left p-4 text-gray-400">Status</th>
                <th className="text-right p-4 text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => (
                <tr key={conta.id} className="border-b border-gray-700">
                  <td className="p-4 text-white">{conta.nome}</td>
                  <td className="p-4 text-white">{conta.ordem}</td>
                  <td className="p-4 text-white font-mono">{conta.simbolo}</td>
                  <td className="p-4 text-white">{conta.conta_pai?.nome || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conta.ativo 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {conta.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
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
                          setIsEmpresasModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title="Gerenciar Empresas"
                      >
                        <Building2 size={18} />
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
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Criação/Edição */}
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

      {/* Modal de Empresas */}
      {isEmpresasModalOpen && selectedConta && (
        <Modal
          title="Gerenciar Empresas"
          onClose={() => {
            setSelectedConta(undefined);
            setIsEmpresasModalOpen(false);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Selecione as empresas que usarão esta conta
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {empresas.map(empresa => (
                  <label
                    key={empresa.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmpresas.includes(empresa.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmpresas([...selectedEmpresas, empresa.id]);
                        } else {
                          setSelectedEmpresas(selectedEmpresas.filter(id => id !== empresa.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="text-white">{empresa.razao_social}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedConta(undefined);
                  setIsEmpresasModalOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setLoading(true);

                    // Remover associações existentes
                    await supabase
                      .from('dre_contas_empresa')
                      .delete()
                      .eq('conta_id', selectedConta.id);

                    // Criar novas associações
                    if (selectedEmpresas.length > 0) {
                      const { error } = await supabase
                        .from('dre_contas_empresa')
                        .insert(
                          selectedEmpresas.map(empresaId => ({
                            conta_id: selectedConta.id,
                            empresa_id: empresaId
                          }))
                        );

                      if (error) throw error;
                    }

                    setIsEmpresasModalOpen(false);
                    setSelectedConta(undefined);
                    refetch();
                  } catch (err) {
                    console.error('Erro ao salvar empresas:', err);
                    alert('Não foi possível salvar as empresas');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
              >
                Salvar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Componentes */}
      {isComponentsModalOpen && selectedConta && (
        <DreComponentsModal
          conta={selectedConta}
          onClose={() => {
            setSelectedConta(undefined);
            setIsComponentsModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default DreConfigPage;