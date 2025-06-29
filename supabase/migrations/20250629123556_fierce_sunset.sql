/*
  # Funções para uso do Stripe

  1. Novas Funções
    - `check_subscription_status`: Verifica o status da assinatura do usuário
    - `has_active_subscription`: Verifica se o usuário tem assinatura ativa
  
  2. Segurança
    - Funções com SECURITY DEFINER para acesso seguro
    - Verificação de autenticação
*/

-- Função para verificar o status da assinatura do usuário
CREATE OR REPLACE FUNCTION check_subscription_status(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Verificar se o usuário está autenticado
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Buscar o status da assinatura
  SELECT status INTO v_status
  FROM user_subscriptions
  WHERE user_id = user_uuid;
  
  -- Se não encontrar assinatura, retornar 'none'
  IF v_status IS NULL THEN
    RETURN 'none';
  END IF;
  
  RETURN v_status;
END;
$$;

-- Função para verificar se o usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Verificar se o usuário está autenticado
  IF user_uuid IS NULL OR user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  -- Buscar o status da assinatura
  SELECT status INTO v_status
  FROM user_subscriptions
  WHERE user_id = user_uuid;
  
  -- Verificar se o status é 'active' ou 'trialing'
  RETURN v_status IN ('active', 'trialing');
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION check_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription TO authenticated;