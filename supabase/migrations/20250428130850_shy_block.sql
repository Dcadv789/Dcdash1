/*
  # Adicionar tipo de gráfico na configuração do dashboard

  1. Alterações
    - Adicionar enum para tipos de gráfico
    - Adicionar coluna tipo_grafico na tabela dashboard_config
    
  2. Tipos de Gráfico
    - line: Gráfico de linha
    - bar: Gráfico de barras
    - area: Gráfico de área
    - pie: Gráfico de pizza
*/

-- Criar enum para tipos de gráfico
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_grafico') THEN
    CREATE TYPE tipo_grafico AS ENUM ('line', 'bar', 'area', 'pie');
  END IF;
END$$;

-- Adicionar coluna tipo_grafico
ALTER TABLE dashboard_config
ADD COLUMN tipo_grafico tipo_grafico;

-- Atualizar registros existentes para usar line como padrão
UPDATE dashboard_config
SET tipo_grafico = 'line'
WHERE tipo_grafico IS NULL;