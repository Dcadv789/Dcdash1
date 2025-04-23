/*
  # Add Company Management RLS Policies

  1. New Policies
    - Allow authenticated users to insert new companies
    - Allow authenticated users to update companies
    - Allow authenticated users to delete companies
    
  2. Security
    - Maintains data security by requiring authentication
    - Allows full CRUD operations for authenticated users
*/

-- Policy for inserting companies
CREATE POLICY "Usuários autenticados podem criar empresas"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating companies
CREATE POLICY "Usuários autenticados podem atualizar empresas"
ON public.empresas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting companies
CREATE POLICY "Usuários autenticados podem deletar empresas"
ON public.empresas
FOR DELETE
TO authenticated
USING (true);