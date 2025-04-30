import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { DreConfiguracao, Empresa } from '../types/database';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import DreFilters from '../components/dre/DreFilters';
import DreReport from '../components/dre/DreReport';

interface ContaCalculada extends DreConfiguracao {
  valores: { [key: string]: number };
  total12Meses: number;
  contas_filhas?: ContaCalculada[];
}

const DrePage: React.FC = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [contasCalculadas, setContasCalculadas] = useState<ContaCalculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVariation, setShowVariation] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  // Buscar contas do DRE associadas à empresa selecionada
  const { data: contas } = useSupabaseQuery<DreConfiguracao>({
    query: () => {
      if (!selectedEmpresa) return Promise.resolve({ data: [] });

      return supabase
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
        `)
        .eq('ativo', true)
        .eq('dre_contas_empresa.empresa_id', selectedEmpresa)
        .eq('dre_contas_empresa.ativo', true)
        .order('ordem');
    },
    dependencies: [selectedEmpresa],
  });

  // Gerar array de meses para visualização
  const getMesesVisualizacao = () => {
    const meses = [];
    let currentDate = new Date(selectedYear, selectedMonth - 1);
    
    // Voltar 12 meses
    currentDate.setMonth(currentDate.getMonth() - 12);
    
    // Gerar array com 13 meses (mês atual + 12 meses anteriores)
    for (let i = 0; i < 13; i++) {
      meses.push({
        mes: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return meses;
  };

  useEffect(() => {
    if (selectedEmpresa && selectedYear && selectedMonth && contas?.length) {
      calcularValores();
    }
  }, [selectedEmpresa, selectedYear, selectedMonth, contas]);

  const calcularValores = async () => {
    if (!selectedEmpresa || !contas?.length) return;
    
    setLoading(true);
    setError(null);

    try {
      const meses = getMesesVisualizacao();
      
      // Buscar todos os lançamentos de uma vez
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select(`
          *,
          categoria:categorias!inner(id),
          indicador:indicadores!inner(id)
        `)
        .eq('empresa_id', selectedEmpresa)
        .in('mes', meses.map(m => m.mes))
        .in('ano', [...new Set(meses.map(m => m.ano))]);

      // Buscar todos os componentes de uma vez
      const { data: componentes } = await supabase
        .from('dre_conta_componentes')
        .select(`
          *,
          categoria:categorias(id),
          indicador:indicadores(id)
        `)
        .in('conta_id', contas.map(c => c.id));

      // Mapear componentes por conta para acesso rápido
      const componentesPorConta = new Map();
      componentes?.forEach(comp => {
        if (!componentesPorConta.has(comp.conta_id)) {
          componentesPorConta.set(comp.conta_id, []);
        }
        componentesPorConta.get(comp.conta_id).push(comp);
      });

      // Mapear contas para lookup rápido
      const contasMap = new Map<string, ContaCalculada>();
      const contasRaiz: ContaCalculada[] = [];

      // Inicializar todas as contas com valores zerados
      contas.forEach(conta => {
        const valores: { [key: string]: number } = {};
        meses.forEach(({ mes, ano }) => {
          valores[`${ano}-${mes}`] = 0;
        });

        contasMap.set(conta.id, {
          ...conta,
          valores,
          total12Meses: 0
        });
      });

      // Calcular valores para cada conta
      for (const conta of contas) {
        const contaCalculada = contasMap.get(conta.id)!;
        const componentesConta = componentesPorConta.get(conta.id) || [];
        
        // Calcular valores para cada mês
        for (const { mes, ano } of meses) {
          let valorMes = 0;

          // Se tem componentes, calcular baseado neles
          if (componentesConta.length > 0) {
            for (const componente of componentesConta) {
              let valorComponente = 0;
              const lancamentosFiltrados = lancamentos?.filter(l => {
                if (componente.categoria_id) {
                  return l.categoria_id === componente.categoria_id && l.mes === mes && l.ano === ano;
                }
                if (componente.indicador_id) {
                  return l.indicador_id === componente.indicador_id && l.mes === mes && l.ano === ano;
                }
                return false;
              });

              valorComponente = lancamentosFiltrados?.reduce((sum, l) => 
                sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;

              valorMes += componente.simbolo === '+' ? valorComponente : -valorComponente;
            }
          }

          contaCalculada.valores[`${ano}-${mes}`] = valorMes;
        }

        // Calcular total dos últimos 12 meses
        contaCalculada.total12Meses = meses
          .slice(1) // Excluir o primeiro mês (13 meses atrás)
          .reduce((total, { mes, ano }) => total + contaCalculada.valores[`${ano}-${mes}`], 0);

        // Organizar hierarquia
        if (conta.conta_pai_id) {
          const contaPai = contasMap.get(conta.conta_pai_id);
          if (contaPai) {
            if (!contaPai.contas_filhas) contaPai.contas_filhas = [];
            contaPai.contas_filhas.push(contaCalculada);
          }
        } else {
          contasRaiz.push(contaCalculada);
        }
      }

      // Ordenar contas filhas pela ordem
      const ordenarContasFilhas = (contas: ContaCalculada[]) => {
        contas.sort((a, b) => a.ordem - b.ordem);
        contas.forEach(conta => {
          if (conta.contas_filhas && conta.contas_filhas.length > 0) {
            ordenarContasFilhas(conta.contas_filhas);
          }
        });
      };

      ordenarContasFilhas(contasRaiz);
      setContasCalculadas(contasRaiz);
    } catch (err) {
      console.error('Erro ao calcular valores:', err);
      setError('Não foi possível calcular os valores do DRE');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">DRE</h2>
        <p className="text-gray-400 mt-1">Demonstrativo do Resultado do Exercício</p>
      </div>

      <DreFilters
        selectedEmpresa={selectedEmpresa}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        empresas={empresas}
        showVariation={showVariation}
        onEmpresaChange={setSelectedEmpresa}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onToggleVariation={() => setShowVariation(!showVariation)}
      />

      <div className="overflow-auto">
        {!selectedEmpresa ? (
          <EmptyState message="Selecione uma empresa para visualizar o DRE" />
        ) : contasCalculadas.length === 0 ? (
          <EmptyState message="Nenhuma conta configurada para exibição" />
        ) : (
          <DreReport 
            contas={contasCalculadas} 
            meses={getMesesVisualizacao()}
            showVariation={showVariation}
          />
        )}
      </div>
    </div>
  );
};

export default DrePage;