/*
  # Tabela de Log de Webhooks do Stripe
  
  1. Nova Tabela
    - `stripe_webhook_logs`: Armazena logs de eventos do webhook do Stripe
      - `id` (uuid, chave primária)
      - `event_id` (texto, ID do evento do Stripe)
      - `event_type` (texto, tipo do evento)
      - `payload` (jsonb, conteúdo completo do evento)
      - `processed` (boolean, indica se foi processado com sucesso)
      - `error` (texto, erro durante o processamento, se houver)
      - `created_at` (timestamp, quando o webhook foi recebido)
  
  2. Segurança
    - Habilitar RLS na tabela
    - Criar política para que apenas administradores possam acessar
*/

-- Criar tabela para logs de webhook do Stripe
CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT true,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Adicionar índices para consulta
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_event_type ON stripe_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_created_at ON stripe_webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_processed ON stripe_webhook_logs(processed);

-- Habilitar RLS para a tabela de logs
ALTER TABLE stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Criar política para administradores
CREATE POLICY "Admins can view webhook logs"
  ON stripe_webhook_logs
  FOR SELECT
  TO public
  USING (is_admin(auth.uid()));