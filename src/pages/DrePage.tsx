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
  valor: number;
  contas_filhas?: ContaCalculada[];
}

const DrePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [contasCalculadas, setContasCalculadas] = useState<ContaCalculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: contas } = useSupabaseQuery<DreConfiguracao>({
    query: () => supabase
      .from('dre_configuracao')
      .select(`
        *,
        conta_pai:dre_configuracao!conta_pai_id (
          id,
          nome
        )
      `)
      .eq('ativo', true)
      .order('ordem'),
  });

  useEffect(() => {
    if (selectedEmpresa && selectedYear && selectedMonth) {
      calcularValores();
    }
  }, [selectedEmpresa, selectedYear, selectedMonth, contas]);

  const calcularValores = async () => {
    setLoading(true);
    setError(null);

    try {
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
            ),
            conta_componente:dre_configuracao (
              id,
              nome
            )
          `),
        supabase
          .from('lancamentos')
          .select('*')
          .eq('empresa_id', selectedEmpresa)
          .eq('ano', selectedYear)
          .eq('mes', selectedMonth)
      ]);

      if (!componentes || !lancamentos) throw new Error('Erro ao buscar dados');

      // Organizar contas em hierarquia e calcular valores
      const contasMap = new Map<string, ContaCalculada>();
      const contasRaiz: ContaCalculada[] = [];

      // Inicializar todas as contas com valor 0
      contas.forEach(conta => {
        contasMap.set(conta.id, { ...conta, valor: 0 });
      });

      // Primeiro passo: calcular valores base dos componentes diretos (categorias e indicadores)
      componentes.forEach(componente => {
        const conta = contasMap.get(componente.conta_id);
        if (!conta) return;

        let valor = 0;

        // Calcular valor baseado em categoria
        if (componente.categoria_id) {
          valor = lancamentos
            .filter(l => l.categoria_id === componente.categoria_id)
            .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
        }
        // Calcular valor baseado em indicador
        else if (componente.indicador_id) {
          valor = lancamentos
            .filter(l => l.indicador_id === componente.indicador_id)
            .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
        }
        // Calcular valor baseado em outra conta
        else if (componente.conta_componente_id) {
          const contaComponente = contasMap.get(componente.conta_componente_id);
          if (contaComponente) {
            valor = contaComponente.valor;
          }
        }

        conta.valor += componente.simbolo === '+' ? valor : -valor;
      });

      // Organizar hierarquia e propagar valores
      contas.forEach(conta => {
        const contaCalculada = contasMap.get(conta.id)!;
        
        if (conta.conta_pai_id) {
          const contaPai = contasMap.get(conta.conta_pai_id);
          if (contaPai) {
            if (!contaPai.contas_filhas) contaPai.contas_filhas = [];
            contaPai.contas_filhas.push(contaCalculada);
            contaPai.valor += contaCalculada.valor;
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
        searchTerm={searchTerm}
        selectedEmpresa={selectedEmpresa}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        empresas={empresas}
        onSearchChange={setSearchTerm}
        onEmpresaChange={setSelectedEmpresa}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {!selectedEmpresa ? (
        <EmptyState message="Selecione uma empresa para visualizar o DRE" />
      ) : contasCalculadas.length === 0 ? (
        <EmptyState message="Nenhuma conta configurada para exibição" />
      ) : (
        <DreReport contas={contasCalculadas} />
      )}
    </div>
  );
};

export default DrePage;