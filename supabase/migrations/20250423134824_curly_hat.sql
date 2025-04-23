/*
  # Trigger para sincronização de usuários Auth

  1. Funcionalidade
    - Cria uma função que será executada quando um novo usuário for criado no Auth
    - Insere automaticamente o usuário na tabela `usuarios`
    - Define role padrão como 'cliente'
    
  2. Segurança
    - Mantém a integridade dos dados entre Auth e tabela de usuários
    - Garante que todo usuário Auth tenha um registro correspondente
*/

-- Criar função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'cliente'
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuários existentes que ainda não estão na tabela usuarios
INSERT INTO public.usuarios (auth_id, nome, email, role)
SELECT 
  id as auth_id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as nome,
  email,
  'cliente' as role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios WHERE auth_id = auth.users.id
)
ON CONFLICT (email) DO NOTHING;