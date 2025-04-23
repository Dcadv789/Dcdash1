/*
  # Adicionar coluna empresa_id na tabela empresas

  1. Alterações
    - Adicionar coluna empresa_id na tabela empresas
    - Adicionar chave estrangeira para a tabela empresas
    
  2. Segurança
    - Mantém a integridade referencial com a tabela empresas
*/

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);