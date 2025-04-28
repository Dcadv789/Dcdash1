/*
  # Adicionar suporte a visualização em lista no dashboard

  1. Alterações
    - Alterar enum tipo_visualizacao para incluir 'list'
    - Criar nova tabela dashboard_list_components para componentes da lista
    
  2. Nova Tabela
    - `dashboard_list_components`: Armazena os componentes que compõem uma lista
      - `id` (uuid, chave primária)
      - `dashboard_id` (uuid, referência ao dashboard_config)
      - `categoria_id` (uuid, opcional, referência a categorias)
      - `indicador_id` (uuid, opcional, referência a indicadores)
      - `cliente_id` (uuid, opcional, referência a clientes)
      - `ordem` (integer)
*/

-- Alterar o tipo enum para incluir 'list'
ALTER TYPE tipo_visualizacao ADD VALUE 'list' AFTER 'chart';

-- Criar tabela de componentes da lista
CREATE TABLE IF NOT EXISTS dashboard_list_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES dashboard_config(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  CONSTRAINT check_apenas_um_tipo CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN cliente_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Habilitar RLS
ALTER TABLE dashboard_list_components ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON dashboard_list_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON dashboard_list_components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX idx_dashboard_list_components_dashboard_id 
  ON dashboard_list_components(dashboard_id);
CREATE INDEX idx_dashboard_list_components_categoria_id 
  ON dashboard_list_components(categoria_id);
CREATE INDEX idx_dashboard_list_components_indicador_id 
  ON dashboard_list_components(indicador_id);
CREATE INDEX idx_dashboard_list_components_cliente_id 
  ON dashboard_list_components(cliente_id);