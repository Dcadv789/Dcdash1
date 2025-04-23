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
  empresa: {
    razao_social: string;
  } | null;
}

export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  ativa: boolean;
  data_inicio_contrato: string | null;
  created_at: string;
  logo_url: string | null;
  email: string | null;
  telefone: string | null;
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
  grupo?: GrupoCategoria;
}

export interface GrupoCategoria {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface EmpresaCategoria {
  id: string;
  empresa_id: string;
  categoria_id: string;
  criado_em: string;
  categoria?: Categoria;
  empresa?: Empresa;
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
}

export interface IndicadorEmpresa {
  id: string;
  indicador_id: string;
  empresa_id: string;
  criado_em: string;
  indicador?: Indicador;
  empresa?: Empresa;
}

export interface IndicadorComposicao {
  id: string;
  indicador_id: string;
  componente_categoria_id: string | null;
  componente_indicador_id: string | null;
  criado_em: string;
  categoria?: Categoria;
  indicador?: Indicador;
}