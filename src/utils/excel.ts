import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export function createExampleWorkbook() {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Dados da primeira aba (Modelo)
  const modelData = [
    ['Mês *', 'Ano *', 'Tipo *', 'Valor *', 'Código da Categoria', 'Código do Indicador', 'CNPJ da Empresa *', 'Descrição'],
    [3, 2024, 'receita', 1500.00, 'R0001', '', '12345678000190', 'Venda de serviços'],
    [3, 2024, 'despesa', 350.00, 'D0001', '', '12345678000190', 'Material de escritório'],
    [3, 2024, 'receita', 2000.00, '', 'I0001', '98765432000121', 'Consultoria mensal']
  ];

  // Dados da segunda aba (Instruções)
  const instructionsData = [
    ['Instruções de Preenchimento'],
    [''],
    ['Campos Obrigatórios (*)'],
    ['- Mês: Número de 1 a 12'],
    ['- Ano: Número com 4 dígitos (ex: 2024)'],
    ['- Tipo: receita ou despesa'],
    ['- Valor: Usar ponto para decimais (ex: 1500.00)'],
    ['- CNPJ da Empresa: Apenas números, sem pontos, traços ou barras'],
    ['  Exemplo: 12345678000190'],
    [''],
    ['Campos Opcionais'],
    ['- Código da Categoria: Formato R0001 para receitas, D0001 para despesas'],
    ['- Código do Indicador: Formato I0001'],
    ['- Descrição: Texto livre'],
    [''],
    ['Observações Importantes'],
    ['1. Preencher apenas Categoria OU Indicador, nunca os dois'],
    ['2. Valores devem ser positivos'],
    ['3. CNPJ deve existir no sistema'],
    ['4. O CNPJ deve ser informado sem formatação (apenas números)'],
    ['5. Mês deve ser um número entre 1 e 12'],
    ['6. Ano deve ter 4 dígitos']
  ];

  // Criar as planilhas
  const wsModel = XLSX.utils.aoa_to_sheet(modelData);
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);

  // Adicionar as planilhas ao workbook
  XLSX.utils.book_append_sheet(wb, wsModel, 'Modelo');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

  // Configurar largura das colunas
  wsModel['!cols'] = [
    { wch: 8 },  // Mês
    { wch: 8 },  // Ano
    { wch: 10 }, // Tipo
    { wch: 12 }, // Valor
    { wch: 20 }, // Código Categoria
    { wch: 20 }, // Código Indicador
    { wch: 20 }, // CNPJ
    { wch: 40 }  // Descrição
  ];

  return wb;
}

export function downloadExampleWorkbook() {
  const wb = createExampleWorkbook();
  XLSX.writeFile(wb, 'modelo-lancamentos.xlsx');
}

interface UploadRow {
  mes: number;
  ano: number;
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria_codigo?: string;
  indicador_codigo?: string;
  cnpj: string;
  descricao?: string;
}

interface ProcessResult {
  success: boolean;
  message?: string;
  errors?: string[];
}

export async function processExcelFile(file: File): Promise<ProcessResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: UploadRow[] = XLSX.utils.sheet_to_json(worksheet, { 
      header: ['mes', 'ano', 'tipo', 'valor', 'categoria_codigo', 'indicador_codigo', 'cnpj', 'descricao'], 
      range: 1 
    });

    const errors: string[] = [];
    const lancamentos = [];

    // Buscar todas as empresas, categorias e indicadores uma única vez
    const { data: empresas } = await supabase
      .from('empresas')
      .select('id, cnpj')
      .eq('ativa', true);

    const { data: categorias } = await supabase
      .from('categorias')
      .select('id, codigo')
      .eq('ativo', true);

    const { data: indicadores } = await supabase
      .from('indicadores')
      .select('id, codigo')
      .eq('ativo', true);

    // Mapear IDs para lookup rápido
    const empresaMap = new Map(empresas?.map(e => [e.cnpj, e.id]));
    const categoriaMap = new Map(categorias?.map(c => [c.codigo, c.id]));
    const indicadorMap = new Map(indicadores?.map(i => [i.codigo, i.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque começamos do índice 0 e pulamos o cabeçalho

      // Validações básicas
      if (!row.mes || !row.ano || !row.tipo || !row.valor || !row.cnpj) {
        errors.push(`Linha ${rowNumber}: Campos obrigatórios não preenchidos`);
        continue;
      }

      // Validar mês
      if (!Number.isInteger(row.mes) || row.mes < 1 || row.mes > 12) {
        errors.push(`Linha ${rowNumber}: Mês inválido. Use números de 1 a 12`);
        continue;
      }

      // Validar ano
      if (!Number.isInteger(row.ano) || row.ano.toString().length !== 4) {
        errors.push(`Linha ${rowNumber}: Ano inválido. Use um número com 4 dígitos`);
        continue;
      }

      // Validar tipo
      if (row.tipo !== 'receita' && row.tipo !== 'despesa') {
        errors.push(`Linha ${rowNumber}: Tipo inválido. Use 'receita' ou 'despesa'`);
        continue;
      }

      // Validar valor
      if (isNaN(row.valor) || row.valor <= 0) {
        errors.push(`Linha ${rowNumber}: Valor inválido`);
        continue;
      }

      // Validar CNPJ
      const empresaId = empresaMap.get(row.cnpj);
      if (!empresaId) {
        errors.push(`Linha ${rowNumber}: CNPJ não encontrado no sistema`);
        continue;
      }

      // Validar categoria e indicador
      if (row.categoria_codigo && row.indicador_codigo) {
        errors.push(`Linha ${rowNumber}: Não é permitido informar categoria e indicador simultaneamente`);
        continue;
      }

      let categoriaId = null;
      let indicadorId = null;

      if (row.categoria_codigo) {
        categoriaId = categoriaMap.get(row.categoria_codigo);
        if (!categoriaId) {
          errors.push(`Linha ${rowNumber}: Código de categoria não encontrado`);
          continue;
        }
      }

      if (row.indicador_codigo) {
        indicadorId = indicadorMap.get(row.indicador_codigo);
        if (!indicadorId) {
          errors.push(`Linha ${rowNumber}: Código de indicador não encontrado`);
          continue;
        }
      }

      // Se passou por todas as validações, adicionar à lista de lançamentos
      lancamentos.push({
        valor: row.valor,
        tipo: row.tipo,
        mes: row.mes,
        ano: row.ano,
        categoria_id: categoriaId,
        indicador_id: indicadorId,
        empresa_id: empresaId,
        descricao: row.descricao || null
      });
    }

    // Se houver erros, retornar sem processar
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    // Inserir lançamentos
    const { error } = await supabase
      .from('lancamentos')
      .insert(lancamentos);

    if (error) throw error;

    return {
      success: true,
      message: `${lancamentos.length} lançamentos importados com sucesso`
    };

  } catch (err) {
    console.error('Erro ao processar arquivo:', err);
    return {
      success: false,
      message: 'Erro ao processar o arquivo'
    };
  }
}