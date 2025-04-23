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