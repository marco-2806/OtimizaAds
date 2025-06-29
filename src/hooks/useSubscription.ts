import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription, FeatureUsage } from '@/types/subscription';
import { subscriptionService } from '@/services/subscriptionService';
import { stripeService } from '@/services/stripeService';

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar planos de assinatura
  const fetchPlans = useCallback(async () => {
    const plansData = await subscriptionService.fetchPlans();
    setPlans(plansData);
  }, []);

  // Buscar assinatura do usuário
  const fetchUserSubscription = useCallback(async () => {
    if (!user) {
      setUserSubscription(null);
      return;
    }

    const subscription = await subscriptionService.fetchUserSubscription(user.id);
    setUserSubscription(subscription);
  }, [user]);

  // Carregar dados ao inicializar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchUserSubscription()]);
      setLoading(false);
    };

    loadData();
  }, [fetchPlans, fetchUserSubscription]);

  // Verificar uso de funcionalidade
  const checkFeatureUsage = async (feature: string): Promise<FeatureUsage | null> => {
    if (!user) return null;
    return await subscriptionService.checkFeatureUsage(user.id, feature);
  };

  // Verificar se pode usar funcionalidade
  const canUseFeature = async (feature: string): Promise<boolean> => {
    return await subscriptionService.canUseFeature(user?.id || '', feature);
  };

  // Incrementar contador de uso
  const incrementUsage = async (feature: string) => {
    if (!user) return;
    await subscriptionService.incrementUsageCounter(user.id, feature);
  };

  // Criar sessão de checkout
  const createCheckoutSession = async (planId: string) => {
    setLoading(true);
    
    try {
      const checkoutUrl = await stripeService.createCheckoutSession(planId);
      
      if (checkoutUrl) {
        // Redirecionar para a URL de checkout do Stripe
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Abrir portal do cliente
  const manageSubscription = async () => {
    setLoading(true);
    
    try {
      const portalUrl = await stripeService.openCustomerPortal();
      
      if (portalUrl) {
        // Redirecionar para o portal do cliente
        window.location.href = portalUrl;
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    plans,
    userSubscription,
    loading,
    checkFeatureUsage,
    canUseFeature,
    incrementUsage,
    createCheckoutSession,
    manageSubscription,
    refreshSubscription: fetchUserSubscription
  };
};