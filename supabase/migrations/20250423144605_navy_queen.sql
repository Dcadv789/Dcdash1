/*
  # Add Complete RLS Policies for Socios Table

  1. New Policies
    - Allow authenticated users to insert new socios
    - Allow authenticated users to update socios
    - Allow authenticated users to delete socios
    
  2. Security
    - Maintains data security by requiring authentication
    - Allows full CRUD operations for authenticated users
*/

-- Policy for inserting socios
CREATE POLICY "Usuários autenticados podem criar sócios"
ON public.socios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating socios
CREATE POLICY "Usuários autenticados podem atualizar sócios"
ON public.socios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting socios
CREATE POLICY "Usuários autenticados podem deletar sócios"
ON public.socios
FOR DELETE
TO authenticated
USING (true);