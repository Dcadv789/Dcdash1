/*
  # Create empresa_categorias association table

  1. New Table
    - `empresa_categorias`: Associates companies with categories
      - `id` (uuid, primary key)
      - `empresa_id` (uuid, foreign key)
      - `categoria_id` (uuid, foreign key)
      - `criado_em` (timestamp)

  2. Constraints
    - Unique constraint on empresa_id + categoria_id pair
    - Foreign key constraints with CASCADE on delete

  3. Security
    - RLS enabled
    - Policies for authenticated users
*/

-- Create empresa_categorias table
CREATE TABLE IF NOT EXISTS empresa_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id uuid NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(empresa_id, categoria_id)
);

-- Enable RLS
ALTER TABLE empresa_categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Usuários autenticados podem ver todas as associações"
  ON empresa_categorias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar associações"
  ON empresa_categorias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar associações"
  ON empresa_categorias
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar associações"
  ON empresa_categorias
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_empresa_categorias_empresa_id ON empresa_categorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_categorias_categoria_id ON empresa_categorias(categoria_id);