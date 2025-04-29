/*
  # Criar estrutura de fórmulas para contas do DRE

  1. Nova Tabela
    - `dre_conta_formulas`: Armazena fórmulas para cálculo de contas
      - `id` (uuid, chave primária)
      - `conta_id` (uuid, referência à conta do DRE)
      - `operando_1_id` (uuid, ID do primeiro operando)
      - `operando_1_tipo` (text, tipo do primeiro operando)
      - `operador` (text, operador matemático)
      - `operando_2_id` (uuid, ID do segundo operando)
      - `operando_2_tipo` (text, tipo do segundo operando)
      - `ordem` (integer, ordem da operação)
      
  2. Restrições
    - Validação de tipos de operando (conta, indicador, categoria)
    - Validação de operadores (+, -, *, /)
    - Chaves estrangeiras para dre_configuracao
*/

-- Criar tabela de fórmulas
CREATE TABLE IF NOT EXISTS dre_conta_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES dre_configuracao(id) ON DELETE CASCADE,
  operando_1_id uuid NOT NULL,
  operando_1_tipo text NOT NULL CHECK (operando_1_tipo IN ('conta', 'indicador', 'categoria')),
  operador text NOT NULL CHECK (operador IN ('+', '-', '*', '/')),
  operando_2_id uuid NOT NULL,
  operando_2_tipo text NOT NULL CHECK (operando_2_tipo IN ('conta', 'indicador', 'categoria')),
  ordem integer DEFAULT 1,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(conta_id, ordem)
);

-- Habilitar RLS
ALTER TABLE dre_conta_formulas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todas as fórmulas"
  ON dre_conta_formulas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar fórmulas"
  ON dre_conta_formulas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX idx_dre_conta_formulas_conta_id ON dre_conta_formulas(conta_id);