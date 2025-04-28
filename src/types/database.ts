export interface Usuario {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  empresa_id: string | null;
  role: 'master' | 'consultor' | 'cliente';
  ativo: boolean;
  telefone: string | null;
  cargo: string | null;
  avatar_url: string | null;
  created_at: string;
  empresa?: Empresa | null;
}

export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  ativa: boolean;
  data_inicio_contrato: string | null;
  logo_url: string | null;
  email: string | null;
  telefone: string | null;
  created_at: string;
}

export interface Cliente {
  id: string;
  razao_social: string;
  empresa_id: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  empresa?: Empresa;
}

export interface Socio {
  id: string;
  empresa_id: string;
  nome: string;
  cpf: string | null;
  percentual: number | null;
  email: string | null;
  telefone: string | null;
  created_at: string;
}

export interface GrupoCategoria {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  grupo_id: string | null;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  grupo?: GrupoCategoria | null;
}

export interface Indicador {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: 'único' | 'composto';
  tipo_dado: 'moeda' | 'numero' | 'percentual';
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  empresa?: Empresa | null;
}

export interface Lancamento {
  id: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  mes: number;
  ano: number;
  categoria_id: string | null;
  indicador_id: string | null;
  cliente_id: string | null;
  empresa_id: string;
  descricao: string | null;
  criado_em: string;
  atualizado_em: string;
  categoria?: Categoria | null;
  indicador?: Indicador | null;
  cliente?: Cliente | null;
  empresa?: Empresa | null;
}

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