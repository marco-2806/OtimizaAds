import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription, FeatureUsage } from '@/types/subscription';

/**
 * Serviço responsável pelo gerenciamento de assinaturas
 */
export const subscriptionService = {
  /**
   * Busca todos os planos de assinatura ativos
   * @returns Lista de planos de assinatura
   */
  async fetchPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive",
      });
      return [];
    }
  },

  /**
   * Busca a assinatura ativa de um usuário
   * @param userId ID do usuário
   * @returns Assinatura do usuário, se houver
   */
  async fetchUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (!userId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar assinatura do usuário:', error);
      return null;
    }
  },

  /**
   * Verifica o uso de uma funcionalidade para um usuário
   * @param userId ID do usuário
   * @param feature Nome da funcionalidade
   * @returns Dados de uso da funcionalidade
   */
  async checkFeatureUsage(userId: string, feature: string): Promise<FeatureUsage | null> {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('check_feature_usage', {
        user_uuid: userId,
        feature: feature
      });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Erro ao verificar uso da funcionalidade:', error);
      return null;
    }
  },

  
  /**
   * Incrementa o contador de uso de uma funcionalidade
   * @param userId ID do usuário
   * @param feature Nome da funcionalidade
   */
  async incrementUsageCounter(userId: string, feature: string): Promise<void> {
    if (!userId) return;

    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Obter uso atual
      const { data: existingUsage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_type', feature)
        .eq('period_start', periodStart.toISOString())
        .single();

      if (existingUsage) {
        // Atualizar registro existente
        await supabase
          .from('usage_tracking')
          .update({ 
            count: existingUsage.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUsage.id);
      } else {
        // Criar novo registro
        await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            feature_type: feature,
            count: 1,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString()
          });
      }
      
      // Atualizar métricas de uso global
      await supabase.functions.invoke('track-usage', {
        body: { 
          feature_type: feature,
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
    }
  },
  
  /**
   * Verifica se um usuário pode usar uma funcionalidade
   * @param userId ID do usuário
   * @param feature Nome da funcionalidade
   * @returns Se o usuário pode usar a funcionalidade
   */
  async canUseFeature(userId: string, feature: string): Promise<boolean> {
    const usage = await this.checkFeatureUsage(userId, feature);
    return usage?.can_use || false;
  }
};