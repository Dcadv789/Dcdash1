// ... (mantenha o código existente)

export interface DreConfiguracao {
  id: string;
  nome: string;
  ordem: number;
  simbolo: '+' | '-' | '=';
  conta_pai_id: string | null;
  ativo: boolean;
  visivel: boolean;
  criado_em: string;
  atualizado_em: string;
  conta_pai?: DreConfiguracao;
  contas_filhas?: DreConfiguracao[];
}

export interface DreContaEmpresa {
  id: string;
  empresa_id: string;
  conta_id: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  empresa?: Empresa;
  conta?: DreConfiguracao;
}