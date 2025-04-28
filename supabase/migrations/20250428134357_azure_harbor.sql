/*
  # Adicionar tipo de visualização no dashboard

  1. Alterações
    - Adicionar enum para tipos de visualização
    - Adicionar coluna tipo_visualizacao na tabela dashboard_config
    
  2. Tipos de Visualização
    - card: Card simples com valor
    - chart: Gráfico
*/

-- Criar enum para tipos de visualização
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_visualizacao') THEN
    CREATE TYPE tipo_visualizacao AS ENUM ('card', 'chart');
  END IF;
END$$;

-- Adicionar coluna tipo_visualizacao
ALTER TABLE dashboard_config
ADD COLUMN tipo_visualizacao tipo_visualizacao DEFAULT 'card';

-- Atualizar registros existentes
UPDATE dashboard_config
SET tipo_visualizacao = 'chart'
WHERE tipo_grafico IS NOT NULL;