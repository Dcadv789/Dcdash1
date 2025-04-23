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
  empresa?: {
    razao_social: string;
  };
}