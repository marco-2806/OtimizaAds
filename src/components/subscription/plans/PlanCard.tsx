import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Check, Users, Loader2, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SubscriptionPlan } from "@/types/subscription";
import { useAuth } from "@/features/auth";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isLoading: boolean;
  loadingPlanId: string | null;
}

const PlanCard = ({ 
  plan, 
  isCurrentPlan, 
  onSelectPlan, 
  isLoading, 
  loadingPlanId 
}: PlanCardProps) => {
  const { user } = useAuth();
  
  const isPopular = plan.name === "Plano Básico";
  const isButtonLoading = loadingPlanId === plan.id;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const getFeatureList = (features: Record<string, unknown>) => {
    const featureMap: Record<string, (val: unknown) => string | null> = {
      generations: (val: number) => val === -1 ? 'Gerações ilimitadas' : `${val} gerações de anúncios`,
      diagnostics: (val: number) => val === -1 ? 'Diagnósticos ilimitados' : `${val} diagnósticos`,
      models: (val: string) => val === 'all' ? 'Todos os modelos' : 'Modelos básicos',
      optimization: (val: boolean) => val ? 'Otimização automática' : null,
      performance_analysis: (val: boolean) => val ? 'Análise básica de performance' : null,
      competitor_analysis: (val: boolean) => val ? 'Análise de concorrentes' : null,
      premium_templates: (val: boolean) => val ? 'Templates premium' : null,
      detailed_reports: (val: boolean) => val ? 'Relatórios detalhados' : null,
      priority_support: (val: boolean) => val ? 'Suporte prioritário' : null,
      custom_ai: (val: boolean) => val ? 'IA personalizada' : null,
      multiple_accounts: (val: boolean) => val ? 'Múltiplas contas' : null,
      api_access: (val: boolean) => val ? 'API access' : null,
      dedicated_support: (val: boolean) => val ? 'Suporte dedicado' : null,
      custom_training: (val: boolean) => val ? 'Treinamento personalizado' : null,
      support: (val: string) => {
        const supportMap: Record<string, string> = {
          email: 'Suporte por email',
          priority: 'Suporte prioritário',
          dedicated: 'Suporte dedicado'
        };
        return supportMap[val] || `Suporte ${val}`;
      },
      funnel_analysis: (val: number) => val === -1 ? 'Análises de funil ilimitadas' : `${val} análises de funil`
    };

    return Object.entries(features)
      .map(([key, value]) => {
        const formatter = featureMap[key];
        if (formatter && value) {
          return formatter(value);
        }
        return null;
      })
      .filter(Boolean) as string[];
  };

  const getButtonText = () => {
    if (!user) return "Faça Login";
    if (isButtonLoading) return "Processando...";
    if (isCurrentPlan) return "Plano Atual";
    if (plan.name === "Gratuito") return "Começar Grátis";
    return "Escolher Plano";
  };

  const features = getFeatureList(plan.features);

  return (
    <Card 
      className={`relative ${
        isPopular ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} transition-all duration-300 h-full flex flex-col`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 shadow-sm">
          Mais Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-green-600 shadow-sm">
          Seu Plano
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(plan.price_monthly)}
          </span>
          <span className="text-gray-600">/mês</span>
        </div>
        <CardDescription className="mt-2 text-sm">
          {plan.name === "Gratuito" && "Perfeito para testar e começar"}
          {plan.name === "Plano Básico" && "Ideal para pequenos negócios"}
          {plan.name === "Intermediário" && "Para quem quer escalar"}
          {plan.name === "Premium" && "Solução completa para agências"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 leading-tight">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelectPlan(plan)}
          variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"} 
          className="w-full"
          size="lg"
          disabled={isButtonLoading || (isCurrentPlan && plan.name !== "Gratuito") || isLoading}
        >
          {isButtonLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isCurrentPlan && !isButtonLoading && <Users className="h-4 w-4 mr-2" />}
          {getButtonText()}
        </Button>
        
        {plan.name !== "Gratuito" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-center mt-3 text-gray-500 cursor-help flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" className="mr-1">
                    <path d="M9.17 7.209c0-.438.107-.765.322-.983.214-.218.536-.327.965-.327.43 0 .752.11.966.327.215.218.322.545.322.983 0 .437-.107.764-.322.982-.214.217-.536.326-.966.326-.429 0-.75-.109-.965-.326-.215-.218-.322-.545-.322-.982zm12.56-2.466H8.431v7.496h13.3V4.743z" fill="#32325D"/>
                    <path d="M8.431 12.239h13.3v-2.27l-13.3.001v2.269z" fill="#32325D"/>
                  </svg>
                  Pagamento seguro via Stripe
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Seus dados de pagamento são processados com segurança pelo Stripe, líder mundial em pagamentos online.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCard;