/*
  # Correção da função has_active_subscription

  1. Alterações
    - Adiciona uma versão da função has_active_subscription que aceita um parâmetro user_uuid
    - Mantém compatibilidade com a versão sem parâmetros
    - Corrige o erro "Could not find the function public.has_active_subscription without parameters"
  
  2. Segurança
    - Mantém SECURITY DEFINER para garantir acesso seguro aos dados
    - Concede permissões para usuários autenticados
*/

-- Criar uma versão da função que aceita um parâmetro de ID de usuário
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    -- Se o usuário fornecido for null ou diferente do usuário autenticado
    -- e o usuário autenticado não for admin, negar acesso
    IF user_uuid IS NULL OR (user_uuid != auth.uid() AND NOT is_admin(auth.uid())) THEN
        RETURN FALSE;
    END IF;

    -- Buscar se o usuário tem assinatura ativa
    SELECT EXISTS (
        SELECT 1
        FROM public.user_subscriptions
        WHERE user_id = user_uuid
          AND status = 'active'
          AND cancel_at_period_end = FALSE
    ) INTO is_active;
    
    RETURN is_active;
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated;

-- Manter a versão sem parâmetros para compatibilidade com chamadas existentes
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reutilizar a função com parâmetro, passando o usuário atual
    RETURN public.has_active_subscription(auth.uid());
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.has_active_subscription() TO authenticated;