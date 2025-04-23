/*
  # Adicionar políticas de acesso RLS

  1. Políticas
    - Permitir que usuários autenticados vejam todos os usuários
    - Permitir que usuários autenticados vejam todas as empresas
    - Permitir que usuários autenticados vejam todos os sócios
    
  2. Segurança
    - Mantém a segurança dos dados permitindo apenas acesso autenticado
    - Habilita RLS em todas as tabelas
*/

-- Habilitar RLS na tabela socios
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;

-- Política para visualização de usuários
CREATE POLICY "Usuários autenticados podem ver todos os usuários"
ON public.usuarios
FOR SELECT
TO authenticated
USING (true);

-- Política para visualização de empresas
CREATE POLICY "Usuários autenticados podem ver todas as empresas"
ON public.empresas
FOR SELECT
TO authenticated
USING (true);

-- Política para visualização de sócios
CREATE POLICY "Usuários autenticados podem ver todos os sócios"
ON public.socios
FOR SELECT
TO authenticated
USING (true);