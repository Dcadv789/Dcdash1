import { supabase } from '../lib/supabase';

interface CalculationContext {
  mes: number;
  ano: number;
  empresaId: string;
}

// Cache para armazenar os lançamentos
let lancamentosCache: any[] | null = null;
let lastCacheKey = '';

const getCacheKey = (context: CalculationContext) => {
  return `${context.empresaId}-${context.mes}-${context.ano}`;
};

const clearCache = () => {
  lancamentosCache = null;
  lastCacheKey = '';
};

// Função para buscar todos os lançamentos de uma vez
const fetchLancamentos = async (context: CalculationContext) => {
  const cacheKey = getCacheKey(context);
  
  // Retornar do cache se disponível
  if (lancamentosCache && lastCacheKey === cacheKey) {
    return lancamentosCache;
  }

  const { data } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', context.empresaId)
    .eq('mes', context.mes)
    .eq('ano', context.ano);

  // Atualizar cache
  lancamentosCache = data || [];
  lastCacheKey = cacheKey;

  return lancamentosCache;
};

// Função auxiliar para calcular valor baseado em lançamentos
const calcularValorLancamentos = (lancamentos: any[], referenciaId: string, tipo: 'categoria' | 'indicador') => {
  return lancamentos
    .filter(l => l[`${tipo}_id`] === referenciaId)
    .reduce((sum, l) => sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0);
};

// Cache para evitar loops infinitos em fórmulas recursivas
const formulaCache = new Map<string, number>();

export async function calcularValorConta(contaId: string, context: CalculationContext): Promise<number> {
  // Verificar cache de fórmula para evitar loops infinitos
  const cacheKey = `${contaId}-${context.mes}-${context.ano}`;
  if (formulaCache.has(cacheKey)) {
    return formulaCache.get(cacheKey)!;
  }

  // 1. Primeiro, verificar se a conta tem fórmula
  const { data: formula } = await supabase
    .from('dre_conta_formulas')
    .select('*')
    .eq('conta_id', contaId)
    .maybeSingle();

  if (formula) {
    // Calcular valor usando a fórmula
    const valor1 = await getOperandoValue(formula.operando_1_id, formula.operando_1_tipo, context);
    const valor2 = await getOperandoValue(formula.operando_2_id, formula.operando_2_tipo, context);

    let resultado = 0;
    switch (formula.operador) {
      case '+': resultado = valor1 + valor2; break;
      case '-': resultado = valor1 - valor2; break;
      case '*': resultado = valor1 * valor2; break;
      case '/': resultado = valor2 !== 0 ? valor1 / valor2 : 0; break;
    }

    formulaCache.set(cacheKey, resultado);
    return resultado;
  }

  // 2. Se não tem fórmula, verificar se é conta pai
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
    formulaCache.set(cacheKey, total);
    return total;
  }

  // 3. Se não tem fórmula nem contas filhas, buscar componentes
  const { data: componentes } = await supabase
    .from('dre_conta_componentes')
    .select(`
      *,
      categoria:categorias(*),
      indicador:indicadores(*)
    `)
    .eq('conta_id', contaId);

  // Buscar lançamentos uma única vez
  const lancamentos = await fetchLancamentos(context);

  // 4. Se tem componentes, calcular baseado neles
  if (componentes && componentes.length > 0) {
    let total = 0;
    for (const componente of componentes) {
      let valor = 0;

      if (componente.categoria_id) {
        valor = calcularValorLancamentos(lancamentos, componente.categoria_id, 'categoria');
      } else if (componente.indicador_id) {
        valor = calcularValorLancamentos(lancamentos, componente.indicador_id, 'indicador');
      }

      total += componente.simbolo === '+' ? valor : -valor;
    }
    formulaCache.set(cacheKey, total);
    return total;
  }

  formulaCache.set(cacheKey, 0);
  return 0;
}

async function getOperandoValue(
  id: string, 
  tipo: 'conta' | 'categoria' | 'indicador',
  context: CalculationContext
): Promise<number> {
  const lancamentos = await fetchLancamentos(context);

  switch (tipo) {
    case 'conta':
      return calcularValorConta(id, context);

    case 'categoria':
      return calcularValorLancamentos(lancamentos, id, 'categoria');

    case 'indicador':
      return calcularValorLancamentos(lancamentos, id, 'indicador');

    default:
      return 0;
  }
}