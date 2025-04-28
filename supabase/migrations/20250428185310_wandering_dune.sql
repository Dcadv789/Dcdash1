/*
  # Adicionar estrutura de clientes e adaptar lançamentos

  1. Nova Tabela
    - `clientes`: Armazena informações dos clientes
      - `id` (uuid, chave primária)
      - `razao_social` (texto, não nulo)
      - `empresa_id` (uuid, referência a empresas)
      - `ativo` (boolean)
      - `criado_em` (timestamp)
      - `atualizado_em` (timestamp)

  2. Alterações
    - Adicionar coluna cliente_id na tabela lancamentos
    - Adicionar constraint para garantir que apenas um dos campos (categoria_id, indicador_id ou cliente_id) está preenchido
    
  3. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Adicionar coluna cliente_id na tabela lancamentos
ALTER TABLE lancamentos
ADD COLUMN cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL;

-- Remover constraint antiga se existir
ALTER TABLE lancamentos
DROP CONSTRAINT IF EXISTS check_apenas_um_componente;

-- Adicionar nova constraint
ALTER TABLE lancamentos
ADD CONSTRAINT check_apenas_um_componente CHECK (
  (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN cliente_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar clientes"
  ON clientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente_id ON lancamentos(cliente_id);