import React, { useState, useEffect } from 'react';
import { Plus, Calculator, ChevronDown, ChevronRight } from 'lucide-react';
import { DreConfiguracao, Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import DreAccountList from '../components/dre/DreAccountList';
import DreAccountDetails from '../components/dre/DreAccountDetails';
import DreFilters from '../components/dre/DreFilters';
import DreAccountModal from '../components/dre/DreAccountModal';
import DreComponentsModal from '../components/dre/DreComponentsModal';
import DreCompaniesModal from '../components/dre/DreCompaniesModal';

interface ContaHierarquica extends DreConfiguracao {
  contas_filhas?: ContaHierarquica[];
  nivel: number;
}

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

const DreConfigPage: React.FC = () => {
  const [selectedConta, setSelectedConta] = useState<DreConfiguracao | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [componentes, setComponentes] = useState<ContaComponente[]>([]);
  const [loadingComponentes, setLoadingComponentes] = useState(false);
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [filteredContas, setFilteredContas] = useState<DreConfiguracao[]>([]);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: contas, loading: loadingContas, error, refetch } = useSupabaseQuery<DreConfiguracao>({
    query: () => {
      let query = supabase
        .from('dre_configuracao')
        .select(`
          *,
          conta_pai:dre_configuracao!conta_pai_id (
            id,
            nome
          ),
          empresas:dre_contas_empresa!inner(
            empresa_id,
            ativo
          )
        `);

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      return query.order('ordem');
    },
    dependencies: [searchTerm],
  });

  useEffect(() => {
    if (!contas) return;

    if (!selectedEmpresa) {
      setFilteredContas(contas);
    } else {
      const filteredContas = contas.filter(conta => {
        if (!conta.empresas || conta.empresas.length === 0) return false;
        return conta.empresas.some(e => e.empresa_id === selectedEmpresa && e.ativo);
      });
      setFilteredContas(filteredContas);
    }
  }, [selectedEmpresa, contas]);

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

  const organizarContasHierarquicamente = (contas: DreConfiguracao[]): ContaHierarquica[] => {
    const contasMap = new Map<string, ContaHierarquica>();
    const contasRaiz: ContaHierarquica[] = [];

    contas.forEach(conta => {
      contasMap.set(conta.id, { ...conta, contas_filhas: [], nivel: 0 });
    });

    contas.forEach(conta => {
      const contaAtual = contasMap.get(conta.id)!;
      
      if (conta.conta_pai_id) {
        const contaPai = contasMap.get(conta.conta_pai_id);
        if (contaPai) {
          if (!contaPai.contas_filhas) {
            contaPai.contas_filhas = [];
          }
          contaPai.contas_filhas.push(contaAtual);
          contaAtual.nivel = (contaPai.nivel || 0) + 1;
        } else {
          contasRaiz.push(contaAtual);
        }
      } else {
        contasRaiz.push(contaAtual);
      }
    });

    const ordenarContas = (contas: ContaHierarquica[]) => {
      contas.sort((a, b) => a.ordem - b.ordem);
      contas.forEach(conta => {
        if (conta.contas_filhas && conta.contas_filhas.length > 0) {
          ordenarContas(conta.contas_filhas);
        }
      });
    };

    ordenarContas(contasRaiz);
    return contasRaiz;
  };

  const contasHierarquicas = organizarContasHierarquicamente(filteredContas);

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
      <div className="flex-[7] space-y-6 overflow-hidden flex flex-col">
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

        <DreFilters
          searchTerm={searchTerm}
          selectedEmpresa={selectedEmpresa}
          empresas={empresas}
          onSearchChange={setSearchTerm}
          onEmpresaChange={setSelectedEmpresa}
        />

        <div className="flex-1 bg-gray-800 rounded-xl p-6 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            {filteredContas.length === 0 ? (
              <EmptyState message="Nenhuma conta configurada." />
            ) : (
              <DreAccountList
                contas={contasHierarquicas}
                selectedConta={selectedConta}
                expandedContas={expandedContas}
                onSelectConta={setSelectedConta}
                onToggleExpanded={toggleExpanded}
                onManageCompanies={(conta) => {
                  setSelectedConta(conta);
                  setIsCompaniesModalOpen(true);
                }}
                onManageComponents={(conta) => {
                  setSelectedConta(conta);
                  setIsComponentsModalOpen(true);
                }}
                onEdit={(conta) => {
                  setSelectedConta(conta);
                  setIsModalOpen(true);
                }}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex-[3] bg-gray-800 rounded-xl p-6 flex flex-col">
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

        <div className="flex-1 overflow-auto">
          <DreAccountDetails
            selectedConta={selectedConta}
            componentes={componentes}
            loadingComponentes={loadingComponentes}
            onManageComponents={() => setIsComponentsModalOpen(true)}
          />
        </div>
      </div>

      {isModalOpen && (
        <DreAccountModal
          conta={selectedConta}
          contas={contas}
          loading={loading}
          onClose={() => {
            setSelectedConta(undefined);
            setIsModalOpen(false);
          }}
          onSave={handleSave}
        />
      )}

      {isCompaniesModalOpen && selectedConta && (
        <DreCompaniesModal
          conta={selectedConta}
          onClose={() => {
            setSelectedConta(undefined);
            setIsCompaniesModalOpen(false);
          }}
          onSave={() => {
            refetch();
          }}
        />
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