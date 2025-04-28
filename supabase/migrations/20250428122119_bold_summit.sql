/*
  # Atualizar estrutura do dashboard

  1. Alterações
    - Adicionar coluna categoria_id na tabela dashboard_config
    - Adicionar constraint para garantir que apenas um dos campos (categoria_id ou indicador_id) está preenchido
    
  2. Segurança
    - Mantém a integridade referencial com a tabela categorias
*/

-- Adicionar coluna categoria_id
ALTER TABLE dashboard_config
ADD COLUMN categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL;

-- Adicionar constraint para garantir apenas um campo preenchido
ALTER TABLE dashboard_config
ADD CONSTRAINT check_apenas_um_componente CHECK (
  (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_dashboard_config_categoria_id ON dashboard_config(categoria_id);