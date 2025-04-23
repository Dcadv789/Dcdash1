/*
  # Criação das tabelas principais do sistema

  1. Novas Tabelas
    - `empresas`: Armazena informações das empresas
      - `id` (uuid, chave primária)
      - `razao_social` (texto, obrigatório)
      - `nome_fantasia` (texto)
      - `cnpj` (texto, único)
      - `ativa` (boolean)
      - `data_inicio_contrato` (date)
      - `created_at` (timestamp)

    - `usuarios`: Armazena informações dos usuários
      - `id` (uuid, chave primária)
      - `auth_id` (uuid, referência ao Supabase Auth)
      - `nome` (texto)
      - `email` (texto, único)
      - `empresa_id` (uuid, chave estrangeira)
      - `role` (enum: master, consultor, cliente)
      - `ativo` (boolean)
      - `telefone` (texto)
      - `cargo` (texto)
      - `avatar_url` (texto)
      - `created_at` (timestamp)

    - `socios`: Armazena informações dos sócios
      - `id` (uuid, chave primária)
      - `empresa_id` (uuid, chave estrangeira)
      - `nome` (texto)
      - `cpf` (texto)
      - `percentual` (decimal)
      - `email` (texto)
      - `telefone` (texto)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitado RLS em todas as tabelas
    - Políticas de acesso serão definidas posteriormente

  3. Relacionamentos
    - usuarios.empresa_id -> empresas.id (SET NULL on delete)
    - socios.empresa_id -> empresas.id (SET NULL on delete)
*/

-- Criar extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar ENUM para roles de usuários
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('master', 'consultor', 'cliente');
  END IF;
END$$;

-- Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text UNIQUE,
  ativa boolean DEFAULT true,
  data_inicio_contrato date,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  role user_role NOT NULL,
  ativo boolean DEFAULT true,
  telefone text,
  cargo text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela socios
CREATE TABLE IF NOT EXISTS socios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  nome text NOT NULL,
  cpf text,
  percentual decimal,
  email text,
  telefone text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX IF NOT EXISTS idx_socios_empresa_id ON socios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);