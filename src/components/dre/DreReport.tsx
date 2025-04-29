// ... (código anterior mantido)

const calcularValorConta = async (conta: ContaCalculada, periodo: string): Promise<number> => {
  // Se for conta pai, somar valores das contas filhas
  if (conta.contas_filhas && conta.contas_filhas.length > 0) {
    let total = 0;
    for (const contaFilha of conta.contas_filhas) {
      total += await calcularValorConta(contaFilha, periodo);
    }
    return total;
  }

  // Verificar se tem componentes
  const { data: componentes } = await supabase
    .from('dre_conta_componentes')
    .select(`
      *,
      categoria:categorias (*),
      indicador:indicadores (*)
    `)
    .eq('conta_id', conta.id);

  if (componentes && componentes.length > 0) {
    let total = 0;
    for (const componente of componentes) {
      // Buscar lançamentos do período
      const [mes, ano] = periodo.split('-').map(Number);
      
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano)
        .eq(componente.categoria_id ? 'categoria_id' : 'indicador_id', 
            componente.categoria_id || componente.indicador_id);

      // Somar valores dos lançamentos
      const valorComponente = lancamentos?.reduce((sum, l) => 
        sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;

      total += componente.simbolo === '+' ? valorComponente : -valorComponente;
    }
    return total;
  }

  // Verificar se tem fórmula
  const { data: formula } = await supabase
    .from('dre_conta_formulas')
    .select('*')
    .eq('conta_id', conta.id)
    .single();

  if (formula) {
    // Buscar valores dos operandos
    const valor1 = await buscarValorOperando(formula.operando_1_id, formula.operando_1_tipo, periodo);
    const valor2 = await buscarValorOperando(formula.operando_2_id, formula.operando_2_tipo, periodo);

    // Aplicar operador
    switch (formula.operador) {
      case '+': return valor1 + valor2;
      case '-': return valor1 - valor2;
      case '*': return valor1 * valor2;
      case '/': return valor2 !== 0 ? valor1 / valor2 : 0;
      default: return 0;
    }
  }

  return 0;
};

const buscarValorOperando = async (id: string, tipo: string, periodo: string): Promise<number> => {
  const [mes, ano] = periodo.split('-').map(Number);

  switch (tipo) {
    case 'conta': {
      const { data: conta } = await supabase
        .from('dre_configuracao')
        .select('*')
        .eq('id', id)
        .single();
      
      if (conta) {
        return calcularValorConta(conta, periodo);
      }
      break;
    }

    case 'categoria':
    case 'indicador': {
      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('mes', mes)
        .eq('ano', ano)
        .eq(tipo === 'categoria' ? 'categoria_id' : 'indicador_id', id);

      return lancamentos?.reduce((sum, l) => 
        sum + (l.tipo === 'receita' ? l.valor : -l.valor), 0) || 0;
    }
  }

  return 0;
};

// ... (resto do código mantido)

export default buscarValorOperando