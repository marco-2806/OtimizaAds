/*
  # Adicionar função has_active_subscription

  1. Nova Função
    - `has_active_subscription()` - Verifica se o usuário autenticado tem uma assinatura ativa
    - Retorna BOOLEAN
    - Usa SECURITY DEFINER para acessar dados do usuário

  2. Funcionalidade
    - Verifica se existe uma assinatura ativa para o usuário atual
    - Considera apenas assinaturas com status 'active' e cancel_at_period_end = false
    - Usa auth.uid() para identificar o usuário autenticado
*/

CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_subscriptions
        WHERE user_id = auth.uid()
          AND status = 'active'
          AND cancel_at_period_end = FALSE
    ) INTO is_active;

    RETURN is_active;
END;
$$;