/*
  # Criar estrutura de componentes do DRE

  1. Nova Tabela
    - `dre_conta_componentes`: Armazena os componentes que fazem parte do cálculo de uma conta do DRE
      - `id` (uuid, chave primária)
      - `conta_id` (uuid, referência à conta do DRE)
      - `categoria_id` (uuid, opcional, referência a uma categoria)
      - `indicador_id` (uuid, opcional, referência a um indicador)
      - `conta_componente_id` (uuid, opcional, referência a outra conta do DRE)
      - `simbolo` (texto, +, - ou =)
      - `criado_em` (timestamp)

  2. Restrições
    - Apenas um dos campos categoria_id, indicador_id ou conta_componente_id pode estar preenchido
    - O campo simbolo aceita apenas +, - ou =
    - Todas as referências têm restrições de chave estrangeira
    
  3. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de componentes
CREATE TABLE IF NOT EXISTS dre_conta_componentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id uuid NOT NULL REFERENCES dre_configuracao(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  conta_componente_id uuid REFERENCES dre_configuracao(id) ON DELETE CASCADE,
  simbolo text NOT NULL CHECK (simbolo IN ('+', '-', '=')),
  criado_em timestamptz DEFAULT now(),
  
  -- Garantir que apenas um dos campos de referência está preenchido
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN conta_componente_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Habilitar RLS
ALTER TABLE dre_conta_componentes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON dre_conta_componentes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON dre_conta_componentes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_dre_conta_componentes_conta_id ON dre_conta_componentes(conta_id);
CREATE INDEX IF NOT EXISTS idx_dre_conta_componentes_categoria_id ON dre_conta_componentes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_dre_conta_componentes_indicador_id ON dre_conta_componentes(indicador_id);
CREATE INDEX IF NOT EXISTS idx_dre_conta_componentes_conta_componente_id ON dre_conta_componentes(conta_componente_id);