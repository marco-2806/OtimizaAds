import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@/types/subscription";
import { STRIPE_PRODUCTS } from "@/stripe-config";
import PlanCard from "./plans/PlanCard";
import PlansHeader from "./plans/PlansHeader";
import PlansFooter from "./plans/PlansFooter";

interface SubscriptionPlansProps {
  compact?: boolean;
}

const SubscriptionPlans = ({ compact = false }: SubscriptionPlansProps) => {
  const { plans, userSubscription, createCheckoutSession, manageSubscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  // Verificar se um plano é o plano atual do usuário
  const isCurrentPlan = (planId: string) => {
    return userSubscription?.plan_id === planId;
  };

  // Manipular ação do plano (selecionar, gerenciar, etc)
  const handlePlanAction = async (plan: SubscriptionPlan) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (isCurrentPlan(plan.id)) {
      manageSubscription();
    } else if (plan.name === "Gratuito") {
      // Lógica para plano gratuito
      toast({
        title: "Plano Gratuito",
        description: "Você está utilizando o plano gratuito.",
      });
    } else {
      setLoadingPlanId(plan.id);
      try {
        await createCheckoutSession(plan.id);
        // O redirecionamento é feito dentro da função createCheckoutSession
      } finally {
        setLoadingPlanId(null);
      }
    }
  };

  // Combinar planos do banco de dados com planos do Stripe
  const allPlans = [...ensureStripePlansExist(plans)];

  return (
    <div className="space-y-6 md:space-y-8">
      <PlansHeader compact={compact} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {allPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={isCurrentPlan(plan.id)}
            onSelectPlan={handlePlanAction}
            isLoading={loadingPlanId !== null}
            loadingPlanId={loadingPlanId}
          />
        ))}
      </div>

      <PlansFooter compact={compact} />
    </div>
  );
};

// Função para garantir que os planos do Stripe existam na lista
function ensureStripePlansExist(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  const result = [...plans];
  
  // Verificar e adicionar plano básico se necessário
  if (!plans.some(p => p.name === "Plano Básico" || p.stripe_price_id === STRIPE_PRODUCTS.basicPlan.priceId)) {
    result.push(createStripePlan("basic"));
  }
  
  // Verificar e adicionar plano intermediário se necessário
  if (!plans.some(p => p.name === "Intermediário" || p.stripe_price_id === STRIPE_PRODUCTS.intermediatePlan.priceId)) {
    result.push(createStripePlan("intermediate"));
  }
  
  // Verificar e adicionar plano premium se necessário
  if (!plans.some(p => p.name === "Premium" || p.stripe_price_id === STRIPE_PRODUCTS.premiumPlan.priceId)) {
    result.push(createStripePlan("premium"));
  }
  
  return result;
}

// Função para criar um plano do Stripe
function createStripePlan(type: "basic" | "intermediate" | "premium"): SubscriptionPlan {
  const planMap = {
    basic: {
      product: STRIPE_PRODUCTS.basicPlan,
      price: 2990,
      name: "Plano Básico",
      features: {
        generations: 100,
        diagnostics: 50,
        funnel_analysis: 10,
        models: "basic",
        support: "email",
        optimization: true,
        performance_analysis: true
      }
    },
    intermediate: {
      product: STRIPE_PRODUCTS.intermediatePlan,
      price: 5990,
      name: "Intermediário",
      features: {
        generations: 250,
        diagnostics: 100,
        funnel_analysis: 30,
        models: "all",
        support: "priority",
        optimization: true,
        performance_analysis: true,
        competitor_analysis: true,
        premium_templates: true,
        detailed_reports: true,
        priority_support: true
      }
    },
    premium: {
      product: STRIPE_PRODUCTS.premiumPlan,
      price: 9990,
      name: "Premium",
      features: {
        generations: -1,
        diagnostics: -1,
        funnel_analysis: -1,
        models: "all",
        support: "dedicated",
        optimization: true,
        performance_analysis: true,
        competitor_analysis: true,
        premium_templates: true,
        detailed_reports: true,
        priority_support: true,
        unlimited_generations: true,
        unlimited_diagnostics: true,
        custom_ai: true,
        multiple_accounts: true,
        api_access: true,
        dedicated_support: true,
        custom_training: true
      }
    }
  };
  
  const plan = planMap[type];
  
  return {
    id: `stripe-${type}-plan`,
    name: plan.name,
    price_monthly: plan.price,
    currency: "BRL",
    features: plan.features,
    is_active: true,
    stripe_price_id: plan.product.priceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export default SubscriptionPlans;