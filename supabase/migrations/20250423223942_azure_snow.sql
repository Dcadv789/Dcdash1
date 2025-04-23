/*
  # Criar estrutura do DRE

  1. Novas Tabelas
    - `dre_configuracao`: Configuração das contas do DRE
    - `dre_contas_empresa`: Relacionamento entre contas e empresas
      
  2. Funções e Triggers
    - Trigger para atualizar timestamp de atualização
    - Trigger para manter consistência de status ativo
    
  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela dre_configuracao
CREATE TABLE IF NOT EXISTS dre_configuracao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ordem integer NOT NULL,
  simbolo text NOT NULL CHECK (simbolo IN ('+', '-', '=')),
  conta_pai_id uuid REFERENCES dre_configuracao(id) ON DELETE SET NULL,
  ativo boolean DEFAULT true,
  visivel boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Criar tabela dre_contas_empresa
CREATE TABLE IF NOT EXISTS dre_contas_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_id uuid NOT NULL REFERENCES dre_configuracao(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(empresa_id, conta_id)
);

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_dre_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar timestamp
CREATE TRIGGER update_dre_configuracao_atualizado_em
  BEFORE UPDATE ON dre_configuracao
  FOR EACH ROW
  EXECUTE FUNCTION update_dre_atualizado_em();

CREATE TRIGGER update_dre_contas_empresa_atualizado_em
  BEFORE UPDATE ON dre_contas_empresa
  FOR EACH ROW
  EXECUTE FUNCTION update_dre_atualizado_em();

-- Criar função para manter consistência do status ativo
CREATE OR REPLACE FUNCTION update_dre_contas_empresa_status()
RETURNS trigger AS $$
BEGIN
  -- Se a conta foi desativada, desativar todas as associações
  IF OLD.ativo = true AND NEW.ativo = false THEN
    UPDATE dre_contas_empresa
    SET ativo = false
    WHERE conta_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para manter consistência do status
CREATE TRIGGER maintain_dre_contas_empresa_status
  AFTER UPDATE OF ativo ON dre_configuracao
  FOR EACH ROW
  EXECUTE FUNCTION update_dre_contas_empresa_status();

-- Habilitar RLS
ALTER TABLE dre_configuracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_contas_empresa ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todas as contas"
  ON dre_configuracao
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar contas"
  ON dre_configuracao
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver todas as associações"
  ON dre_contas_empresa
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar associações"
  ON dre_contas_empresa
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_dre_configuracao_conta_pai_id ON dre_configuracao(conta_pai_id);
CREATE INDEX IF NOT EXISTS idx_dre_configuracao_ordem ON dre_configuracao(ordem);
CREATE INDEX IF NOT EXISTS idx_dre_contas_empresa_empresa_id ON dre_contas_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_dre_contas_empresa_conta_id ON dre_contas_empresa(conta_id);