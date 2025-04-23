/*
  # Criar tabela de lançamentos financeiros

  1. Nova Tabela
    - `lancamentos`: Armazena os lançamentos financeiros
      - `id` (uuid, chave primária)
      - `valor` (decimal, não nulo)
      - `tipo` (texto, não nulo: receita/despesa)
      - `mes` (inteiro, não nulo, 1-12)
      - `ano` (inteiro, não nulo)
      - `categoria_id` (uuid, referência a categorias)
      - `indicador_id` (uuid, referência a indicadores)
      - `empresa_id` (uuid, referência a empresas)
      - `descricao` (texto, opcional)
      - `criado_em` (timestamp)
      - `atualizado_em` (timestamp)

  2. Restrições
    - Validação de mês (1-12)
    - Validação de tipo (receita/despesa)
    - Chaves estrangeiras para categorias, indicadores e empresas
    
  3. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valor decimal NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano integer NOT NULL,
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE SET NULL,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descricao text,
  criado_em timestamptz DEFAULT now() NOT NULL,
  atualizado_em timestamptz DEFAULT now() NOT NULL
);

-- Criar função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_lancamento_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o timestamp
CREATE TRIGGER update_lancamentos_atualizado_em
  BEFORE UPDATE ON lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_lancamento_atualizado_em();

-- Habilitar RLS
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os lançamentos"
  ON lancamentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir lançamentos"
  ON lancamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar lançamentos"
  ON lancamentos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar lançamentos"
  ON lancamentos
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_lancamentos_empresa_id ON lancamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria_id ON lancamentos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_indicador_id ON lancamentos(indicador_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_mes_ano ON lancamentos(mes, ano);