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
    if (selectedEmpresa && selectedYear && selectedMonth) {
      calcularValores();
    }
  }, [selectedEmpresa, selectedYear, selectedMonth, contas]);

  const calcularValores = async () => {
    if (!selectedEmpresa || !contas?.length) return;
    
    setLoading(true);
    setError(null);

    try {
      const meses = getMesesVisualizacao();
      const periodoInicial = meses[0];
      const periodoFinal = meses[meses.length - 1];

      // Buscar todos os componentes e lançamentos de uma vez
      const [{ data: componentes }, { data: lancamentos }] = await Promise.all([
        supabase
          .from('dre_conta_componentes')
          .select(`
            *,
            categoria:categorias (
              id,
              nome,
              tipo
            ),
            indicador:indicadores (
              id,
              nome
            )
          `)
          .in('conta_id', contas.map(c => c.id)),
        supabase
          .from('lancamentos')
          .select('*')
          .eq('empresa_id', selectedEmpresa)
          .gte('ano', periodoInicial.ano)
          .lte('ano', periodoFinal.ano)
      ]);

      if (!componentes || !lancamentos) throw new Error('Erro ao buscar dados');

      // Organizar contas em hierarquia e calcular valores
      const contasMap = new Map<string, ContaCalculada>();
      const contasRaiz: ContaCalculada[] = [];

      // Inicializar todas as contas com valores zerados para cada mês
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

      // Calcular valores para cada mês
      componentes.forEach(componente => {
        const conta = contasMap.get(componente.conta_id);
        if (!conta) return;

        meses.forEach(({ mes, ano }) => {
          let valor = 0;

          // Calcular valor baseado em categoria
          if (componente.categoria_id) {
            valor = lancamentos
              .filter(l => l.categoria_id === componente.categoria_id && l.mes === mes && l.ano === ano)
              .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
          }
          // Calcular valor baseado em indicador
          else if (componente.indicador_id) {
            valor = lancamentos
              .filter(l => l.indicador_id === componente.indicador_id && l.mes === mes && l.ano === ano)
              .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
          }

          conta.valores[`${ano}-${mes}`] += componente.simbolo === '+' ? valor : -valor;
        });
      });

      // Calcular total dos últimos 12 meses
      contasMap.forEach(conta => {
        conta.total12Meses = meses
          .slice(1) // Excluir o primeiro mês (13 meses atrás)
          .reduce((total, { mes, ano }) => total + conta.valores[`${ano}-${mes}`], 0);
      });

      // Organizar hierarquia e propagar valores
      contas.forEach(conta => {
        const contaCalculada = contasMap.get(conta.id)!;
        
        if (conta.conta_pai_id) {
          const contaPai = contasMap.get(conta.conta_pai_id);
          if (contaPai) {
            if (!contaPai.contas_filhas) contaPai.contas_filhas = [];
            contaPai.contas_filhas.push(contaCalculada);
            
            // Propagar valores para a conta pai
            meses.forEach(({ mes, ano }) => {
              contaPai.valores[`${ano}-${mes}`] += contaCalculada.valores[`${ano}-${mes}`];
            });
            contaPai.total12Meses += contaCalculada.total12Meses;
          }
        } else {
          contasRaiz.push(contaCalculada);
        }
      });

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