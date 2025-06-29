import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Serviço para gerenciamento de integrações com o Stripe
 */
export const stripeService = {
  /**
   * Cria uma sessão de checkout do Stripe para um plano
   * @param planId ID do plano de assinatura
   * @returns URL da sessão de checkout ou null em caso de erro
   */
  async createCheckoutSession(planId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_id: planId }
      });

      if (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        throw error;
      }
      
      return data?.url || null;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout.",
        variant: "destructive",
      });
      return null;
    }
  },

  /**
   * Abre o portal do cliente do Stripe para gerenciar assinaturas
   * @returns URL do portal do cliente ou null em caso de erro
   */
  async openCustomerPortal(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Erro ao abrir portal do cliente:', error);
        throw error;
      }
      
      return data?.url || null;
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinatura.",
        variant: "destructive",
      });
      return null;
    }
  },

  /**
   * Verifica o status da assinatura do usuário atual
   * @returns Status da assinatura ('active', 'canceled', etc.) ou 'none' se não houver assinatura
   */
  async getSubscriptionStatus(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('check_subscription_status');
      
      if (error) throw error;
      return data || 'none';
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      return 'none';
    }
  },

  /**
   * Verifica se o usuário tem uma assinatura ativa
   * @returns true se o usuário tem uma assinatura ativa, false caso contrário
   */
  async hasActiveSubscription(userId?: string): Promise<boolean> {
    try {
      // Se userId for fornecido, usa a versão com parâmetro
      // Caso contrário, usa a versão sem parâmetro
      const { data, error } = userId
        ? await supabase.rpc('has_active_subscription', { user_uuid: userId })
        : await supabase.rpc('has_active_subscription');
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error);
      return false;
    }
  }
};