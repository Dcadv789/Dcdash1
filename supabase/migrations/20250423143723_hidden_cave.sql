/*
  # Adicionar campos de contato e logo para empresas

  1. Novas Colunas
    - `logo_url` (texto): URL da logo da empresa
    - `email` (texto): Email de contato da empresa
    - `telefone` (texto): Telefone de contato da empresa
    
  2. Alterações
    - Adicionadas novas colunas na tabela empresas
*/

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS telefone text;