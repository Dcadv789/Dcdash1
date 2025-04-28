/*
  # Criar estrutura de configuração do dashboard

  1. Novas Tabelas
    - `dashboard_config`: Configuração dos cards do dashboard
      - `id` (uuid, chave primária)
      - `posicao` (integer, 1-7)
      - `titulo` (text)
      - `indicador_id` (uuid, referência a indicadores)
      - `empresa_id` (uuid, referência a empresas)
      - `ativo` (boolean)
      - `criado_em` (timestamp)
      - `atualizado_em` (timestamp)
    
  2. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de configuração do dashboard
CREATE TABLE IF NOT EXISTS dashboard_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao integer NOT NULL CHECK (posicao BETWEEN 1 AND 7),
  titulo text NOT NULL,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE SET NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(posicao, empresa_id)
);

-- Habilitar RLS
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todas as configurações"
  ON dashboard_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar configurações"
  ON dashboard_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_dashboard_config_empresa_id ON dashboard_config(empresa_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_config_indicador_id ON dashboard_config(indicador_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_config_posicao ON dashboard_config(posicao);