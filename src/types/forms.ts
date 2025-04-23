import { Usuario, Empresa, Socio } from './database';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserFormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  role: Usuario['role'];
  avatar_url: string;
  empresa_id: string;
}

export interface CompanyFormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  data_inicio_contrato: string;
  logo_url: string;
  email: string;
  telefone: string;
}

export interface SocioFormData {
  nome: string;
  cpf: string;
  percentual: number | null;
  email: string;
  telefone: string;
}

export interface FormErrors {
  [key: string]: string;
}