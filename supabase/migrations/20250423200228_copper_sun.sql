/*
  # Create indicators tables and related functions

  1. New Tables
    - `indicadores`: Main indicators table
    - `indicadores_empresas`: Associates companies with indicators
    - `indicador_composicoes`: Defines indicator compositions
      
  2. New Functions and Triggers
    - Function to generate sequential codes (I0001, I0002...)
    - Trigger to auto-update updated_at timestamp
    - Trigger to auto-generate indicator codes
    
  3. Security
    - RLS enabled on all tables
    - Basic policies for authenticated users
*/

-- Create enum for indicator types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'indicador_tipo') THEN
    CREATE TYPE indicador_tipo AS ENUM ('único', 'composto');
  END IF;
END$$;

-- Create enum for data types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_dado') THEN
    CREATE TYPE tipo_dado AS ENUM ('moeda', 'numero', 'percentual');
  END IF;
END$$;

-- Create indicadores table
CREATE TABLE IF NOT EXISTS indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  tipo indicador_tipo NOT NULL,
  tipo_dado tipo_dado NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Create indicadores_empresas table
CREATE TABLE IF NOT EXISTS indicadores_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id uuid NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(indicador_id, empresa_id)
);

-- Create indicador_composicoes table
CREATE TABLE IF NOT EXISTS indicador_composicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id uuid NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  componente_categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  componente_indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  criado_em timestamptz DEFAULT now(),
  CONSTRAINT check_componente_preenchido CHECK (
    (componente_categoria_id IS NOT NULL AND componente_indicador_id IS NULL) OR
    (componente_categoria_id IS NULL AND componente_indicador_id IS NOT NULL)
  )
);

-- Create function to generate sequential codes
CREATE OR REPLACE FUNCTION generate_indicador_codigo()
RETURNS trigger AS $$
DECLARE
  last_code text;
  new_number int;
BEGIN
  -- Get last code
  SELECT codigo INTO last_code
  FROM indicadores
  ORDER BY codigo DESC
  LIMIT 1;
  
  -- Calculate new number
  IF last_code IS NULL THEN
    new_number := 1;
  ELSE
    new_number := (regexp_replace(last_code, '\D', '', 'g')::integer) + 1;
  END IF;
  
  -- Generate new code
  NEW.codigo := 'I' || LPAD(new_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate codes
CREATE TRIGGER generate_indicador_codigo_trigger
  BEFORE INSERT ON indicadores
  FOR EACH ROW
  EXECUTE FUNCTION generate_indicador_codigo();

-- Create function to update atualizado_em timestamp
CREATE OR REPLACE FUNCTION update_indicador_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update atualizado_em
CREATE TRIGGER update_indicadores_atualizado_em
  BEFORE UPDATE ON indicadores
  FOR EACH ROW
  EXECUTE FUNCTION update_indicador_atualizado_em();

-- Enable RLS
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicador_composicoes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Usuários autenticados podem ver todos os indicadores"
  ON indicadores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir indicadores"
  ON indicadores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar indicadores"
  ON indicadores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar indicadores"
  ON indicadores
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for indicadores_empresas
CREATE POLICY "Usuários autenticados podem ver todas as associações de indicadores"
  ON indicadores_empresas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar associações de indicadores"
  ON indicadores_empresas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar associações de indicadores"
  ON indicadores_empresas
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for indicador_composicoes
CREATE POLICY "Usuários autenticados podem ver todas as composições"
  ON indicador_composicoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar composições"
  ON indicador_composicoes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar composições"
  ON indicador_composicoes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_indicadores_codigo ON indicadores(codigo);
CREATE INDEX IF NOT EXISTS idx_indicadores_tipo ON indicadores(tipo);
CREATE INDEX IF NOT EXISTS idx_indicadores_empresas_indicador_id ON indicadores_empresas(indicador_id);
CREATE INDEX IF NOT EXISTS idx_indicadores_empresas_empresa_id ON indicadores_empresas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_indicador_composicoes_indicador_id ON indicador_composicoes(indicador_id);
CREATE INDEX IF NOT EXISTS idx_indicador_composicoes_categoria_id ON indicador_composicoes(componente_categoria_id);
CREATE INDEX IF NOT EXISTS idx_indicador_composicoes_indicador_comp_id ON indicador_composicoes(componente_indicador_id);