/*
  # Create categorias table and related functions

  1. New Tables
    - `grupo_categorias`: Parent table for category groups
    - `categorias`: Main categories table with auto-generated codes
      
  2. New Functions and Triggers
    - Function to generate sequential codes (R0001, D0001)
    - Trigger to auto-update updated_at timestamp
    - Trigger to auto-generate category codes
    
  3. Security
    - RLS enabled on all tables
    - Basic policies for authenticated users
*/

-- Create enum for category types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_tipo') THEN
    CREATE TYPE categoria_tipo AS ENUM ('receita', 'despesa');
  END IF;
END$$;

-- Create grupo_categorias table
CREATE TABLE IF NOT EXISTS grupo_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Create categorias table
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  grupo_id uuid REFERENCES grupo_categorias(id) ON DELETE SET NULL,
  tipo categoria_tipo NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Create function to update atualizado_em timestamp
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update atualizado_em
CREATE TRIGGER update_categorias_atualizado_em
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER update_grupo_categorias_atualizado_em
  BEFORE UPDATE ON grupo_categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- Create function to generate sequential codes
CREATE OR REPLACE FUNCTION generate_categoria_codigo()
RETURNS trigger AS $$
DECLARE
  last_code text;
  new_number int;
  prefix char;
BEGIN
  -- Define prefix based on category type
  prefix := CASE 
    WHEN NEW.tipo = 'receita' THEN 'R'
    ELSE 'D'
  END;
  
  -- Get last code for this type
  SELECT codigo INTO last_code
  FROM categorias
  WHERE tipo = NEW.tipo
  ORDER BY codigo DESC
  LIMIT 1;
  
  -- Calculate new number
  IF last_code IS NULL THEN
    new_number := 1;
  ELSE
    new_number := (regexp_replace(last_code, '\D', '', 'g')::integer) + 1;
  END IF;
  
  -- Generate new code
  NEW.codigo := prefix || LPAD(new_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate codes
CREATE TRIGGER generate_categoria_codigo_trigger
  BEFORE INSERT ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION generate_categoria_codigo();

-- Enable RLS
ALTER TABLE grupo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Usuários autenticados podem ver todas as categorias"
  ON categorias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir categorias"
  ON categorias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar categorias"
  ON categorias
  FOR DELETE
  TO authenticated
  USING (true);

-- Same policies for grupo_categorias
CREATE POLICY "Usuários autenticados podem ver todos os grupos"
  ON grupo_categorias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir grupos"
  ON grupo_categorias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar grupos"
  ON grupo_categorias
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar grupos"
  ON grupo_categorias
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categorias_grupo_id ON categorias(grupo_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_codigo ON categorias(codigo);