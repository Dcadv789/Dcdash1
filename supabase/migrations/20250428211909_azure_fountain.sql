/*
  # Criar tabelas de configuração de vendas e análise

  1. Novas Tabelas
    - `vendas_config`: Configuração dos cards do dashboard de vendas
    - `analise_config`: Configuração dos cards do dashboard de análise
      
  2. Estrutura (igual ao dashboard_config)
    - `id` (uuid, chave primária)
    - `posicao` (integer, 1-7)
    - `titulo` (text)
    - `tipo_visualizacao` (enum: card, chart, list)
    - `tipo_grafico` (enum: line, bar, area, pie)
    - `categoria_id` (uuid, referência a categorias)
    - `indicador_id` (uuid, referência a indicadores)
    - `empresa_id` (uuid, referência a empresas)
    - `ativo` (boolean)
    
  3. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de configuração de vendas
CREATE TABLE IF NOT EXISTS vendas_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao integer NOT NULL CHECK (posicao BETWEEN 1 AND 7),
  titulo text NOT NULL,
  tipo_visualizacao tipo_visualizacao DEFAULT 'card',
  tipo_grafico tipo_grafico,
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE SET NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(posicao, empresa_id),
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
  )
);

-- Criar tabela de configuração de análise
CREATE TABLE IF NOT EXISTS analise_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao integer NOT NULL CHECK (posicao BETWEEN 1 AND 7),
  titulo text NOT NULL,
  tipo_visualizacao tipo_visualizacao DEFAULT 'card',
  tipo_grafico tipo_grafico,
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE SET NULL,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  UNIQUE(posicao, empresa_id),
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
  )
);

-- Criar tabela de componentes do gráfico para vendas
CREATE TABLE IF NOT EXISTS vendas_chart_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES vendas_config(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  cor text NOT NULL,
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Criar tabela de componentes do gráfico para análise
CREATE TABLE IF NOT EXISTS analise_chart_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES analise_config(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  cor text NOT NULL,
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Criar tabela de componentes da lista para vendas
CREATE TABLE IF NOT EXISTS vendas_list_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES vendas_config(id) ON DELETE CASCADE,
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

-- Criar tabela de componentes da lista para análise
CREATE TABLE IF NOT EXISTS analise_list_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES analise_config(id) ON DELETE CASCADE,
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

-- Habilitar RLS em todas as tabelas
ALTER TABLE vendas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE analise_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_chart_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE analise_chart_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_list_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE analise_list_components ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para vendas_config
CREATE POLICY "Usuários autenticados podem ver todas as configurações"
  ON vendas_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar configurações"
  ON vendas_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar políticas de acesso para analise_config
CREATE POLICY "Usuários autenticados podem ver todas as configurações"
  ON analise_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar configurações"
  ON analise_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar políticas de acesso para vendas_chart_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON vendas_chart_components FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON vendas_chart_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar políticas de acesso para analise_chart_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON analise_chart_components FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON analise_chart_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar políticas de acesso para vendas_list_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON vendas_list_components FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON vendas_list_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar políticas de acesso para analise_list_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON analise_list_components FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON analise_list_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar índices
CREATE INDEX idx_vendas_config_empresa_id ON vendas_config(empresa_id);
CREATE INDEX idx_vendas_config_categoria_id ON vendas_config(categoria_id);
CREATE INDEX idx_vendas_config_indicador_id ON vendas_config(indicador_id);
CREATE INDEX idx_vendas_config_posicao ON vendas_config(posicao);

CREATE INDEX idx_analise_config_empresa_id ON analise_config(empresa_id);
CREATE INDEX idx_analise_config_categoria_id ON analise_config(categoria_id);
CREATE INDEX idx_analise_config_indicador_id ON analise_config(indicador_id);
CREATE INDEX idx_analise_config_posicao ON analise_config(posicao);

CREATE INDEX idx_vendas_chart_components_dashboard_id ON vendas_chart_components(dashboard_id);
CREATE INDEX idx_vendas_chart_components_categoria_id ON vendas_chart_components(categoria_id);
CREATE INDEX idx_vendas_chart_components_indicador_id ON vendas_chart_components(indicador_id);

CREATE INDEX idx_analise_chart_components_dashboard_id ON analise_chart_components(dashboard_id);
CREATE INDEX idx_analise_chart_components_categoria_id ON analise_chart_components(categoria_id);
CREATE INDEX idx_analise_chart_components_indicador_id ON analise_chart_components(indicador_id);

CREATE INDEX idx_vendas_list_components_dashboard_id ON vendas_list_components(dashboard_id);
CREATE INDEX idx_vendas_list_components_categoria_id ON vendas_list_components(categoria_id);
CREATE INDEX idx_vendas_list_components_indicador_id ON vendas_list_components(indicador_id);
CREATE INDEX idx_vendas_list_components_cliente_id ON vendas_list_components(cliente_id);

CREATE INDEX idx_analise_list_components_dashboard_id ON analise_list_components(dashboard_id);
CREATE INDEX idx_analise_list_components_categoria_id ON analise_list_components(categoria_id);
CREATE INDEX idx_analise_list_components_indicador_id ON analise_list_components(indicador_id);
CREATE INDEX idx_analise_list_components_cliente_id ON analise_list_components(cliente_id);