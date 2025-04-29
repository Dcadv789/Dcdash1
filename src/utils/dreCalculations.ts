import { supabase } from '../lib/supabase';

interface CalculationContext {
  mes: number;
  ano: number;
  empresaId: string;
}

export async function calcularValorConta(contaId: string, context: CalculationContext): Promise<number> {
  const { mes, ano, empresaId } = context;

  // 1. Verificar se é conta pai
  const { data: conta } = await supabase
    .from('dre_configuracao')
    .select(`
      *,
      contas_filhas:dre_configuracao!conta_pai_id(id)
    `)
    .eq('id', contaId)
    .single();

  if (!conta) return 0;

  // Se for conta pai, somar valores das contas filhas
  if (conta.contas_filhas && conta.contas_filhas.length > 0) {
    let total = 0;
    for (const contaFilha of conta.contas_filhas) {
      total += await calcularValorConta(contaFilha.id, context);
    }
    return total;
  }

  // 2. Verificar se tem componentes
  const { data: componentes } = await supabase
    .from('dre_conta_componentes')
    .select(`
      *,
      categoria:categorias(*),
      indicador:indicadores(*)
    `)
    .eq('conta_id', contaId);

  if (componentes && componentes.length > 0) {
    let total = 0;
    for (const componente of componentes) {
      let valor = 0;

      // Buscar lançamentos do período
      if (componente.categoria_id) {
        const { data: lancamentos } = await supabase
          .from('lancamentos')
          .select('valor, tipo')
          .eq('categoria_id', componente.categoria_id)
          .eq('empresa_id', empresaId)
          .eq('mes', mes)
          .eq('ano', ano);

        if (lancamentos) {
          valor = lancamentos.reduce((sum, l) => 
            sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0
          );
        }
      } else if (componente.indicador_id) {
        const { data: lancamentos } = await supabase
          .from('lancamentos')
          .select('valor, tipo')
          .eq('indicador_id', componente.indicador_id)
          .eq('empresa_id', empresaId)
          .eq('mes', mes)
          .eq('ano', ano);

        if (lancamentos) {
          valor = lancamentos.reduce((sum, l) => 
            sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0
          );
        }
      }

      // Aplicar o símbolo do componente
      total += componente.simbolo === '+' ? valor : -valor;
    }
    return total;
  }

  // 3. Verificar se tem fórmula
  const { data: formula } = await supabase
    .from('dre_conta_formulas')
    .select('*')
    .eq('conta_id', contaId)
    .single();

  if (formula) {
    const valor1 = await getOperandoValue(formula.operando_1_id, formula.operando_1_tipo, context);
    const valor2 = await getOperandoValue(formula.operando_2_id, formula.operando_2_tipo, context);

    switch (formula.operador) {
      case '+': return valor1 + valor2;
      case '-': return valor1 - valor2;
      case '*': return valor1 * valor2;
      case '/': return valor2 !== 0 ? valor1 / valor2 : 0;
      default: return 0;
    }
  }

  // 4. Se nada for encontrado, retornar 0
  return 0;
}

async function getOperandoValue(
  id: string, 
  tipo: 'conta' | 'categoria' | 'indicador',
  context: CalculationContext
): Promise<number> {
  const { mes, ano, empresaId } = context;

  switch (tipo) {
    case 'conta':
      return calcularValorConta(id, context);

    case 'categoria': {
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('valor, tipo')
        .eq('categoria_id', id)
        .eq('empresa_id', empresaId)
        .eq('mes', mes)
        .eq('ano', ano);

      if (!lancamentos) return 0;
      return lancamentos.reduce((sum, l) => 
        sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0
      );
    }

    case 'indicador': {
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('valor, tipo')
        .eq('indicador_id', id)
        .eq('empresa_id', empresaId)
        .eq('mes', mes)
        .eq('ano', ano);

      if (!lancamentos) return 0;
      return lancamentos.reduce((sum, l) => 
        sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0
      );
    }

    default:
      return 0;
  }
}