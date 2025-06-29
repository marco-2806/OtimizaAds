import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/features/auth";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import SubscriptionDetails from "./components/SubscriptionDetails";
import SubscriptionPricing from "./components/SubscriptionPricing";
import PaymentSection from "./components/PaymentSection";
import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";
import { stripeService } from '@/services/stripeService';

const Subscription = () => {
  const { 
    userSubscription, 
    loading, 
    checkFeatureUsage, 
    manageSubscription,
    refreshSubscription 
  } = useSubscription();
  const { user } = useAuth();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [usageData, setUsageData] = useState<{
    generations: { current: number; limit: number };
    diagnostics: { current: number; limit: number };
  } | undefined>(undefined);

  useEffect(() => {
    refreshSubscription();
    
    // Check for success or canceled query parameters
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setShowSuccess(true);
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Sua assinatura foi processada e está ativa.",
        variant: "default",
      });
    }
    
    if (canceled === 'true') {
      setShowCanceled(true);      toast({
        title: "Checkout cancelado",
        description: "Você cancelou o processo de checkout.",
        variant: "default",
      });
    }
    
    // Clean up URL parameters
    if (success || canceled) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }  }, [location, refreshSubscription]);
  // Adicionando refreshSubscription como dependência

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user, userSubscription, checkFeatureUsage]);  // eslint-disable-line react-hooks/exhaustive-deps
  // Adicionando checkFeatureUsage como dependência

  const fetchUsageData = async () => {
    try {
      if (!user) return;
      
      // Verificar primeiro se tem assinatura ativa
      const hasActiveSubscription = await stripeService.hasActiveSubscription();
      if (!hasActiveSubscription) return;
      
      // Buscar dados de uso apenas se tiver assinatura ativa
      const [generationsUsage, diagnosticsUsage, funnelAnalysisUsage] = await Promise.all([
        checkFeatureUsage('generations'),
        checkFeatureUsage('diagnostics'),
        checkFeatureUsage('funnel_analysis')
      ]);
      
      if (generationsUsage && diagnosticsUsage && funnelAnalysisUsage) {
        setUsageData({
          generations: {
            current: generationsUsage.current_usage,
            limit: generationsUsage.limit_value
          },
          diagnostics: {
            current: diagnosticsUsage.current_usage,
            limit: diagnosticsUsage.limit_value
          },
          funnel_analysis: {
            current: funnelAnalysisUsage.current_usage,
            limit: funnelAnalysisUsage.limit_value
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-600 mt-1 sm:mt-2">
          Gerencie sua assinatura e veja seu uso atual
        </p>
      </div>

      {/* Notification Messages */}
      {showSuccess && (
        <SuccessNotification onClose={() => setShowSuccess(false)} className="animate-in fade-in-50 slide-in-from-top-5" />
      )}

      {showCanceled && (
        <CanceledNotification onClose={() => setShowCanceled(false)} className="animate-in fade-in-50 slide-in-from-top-5" />
      )}

      {user && userSubscription ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Current Subscription Status */}
          <SubscriptionDetails
            userSubscription={userSubscription}
            onManage={manageSubscription}
            onRefresh={refreshSubscription}
            loading={loading}
            usageData={usageData}
          />

          {/* All Plans */}
          <SubscriptionPricing />
          
          {/* Payment Method & History */}
          {userSubscription && userSubscription.status === 'active' && (
            <PaymentSection 
              userSubscription={userSubscription}
              onManage={manageSubscription}
            />
          )}
        </div>
      ) : (
        <NoSubscriptionView user={user} />
      )}
    </div>
  );
};

// Componentes para diferentes estados da assinatura
const SuccessNotification = ({ onClose, className = "" }: { onClose: () => void, className?: string }): JSX.Element => (
  <Card className={`bg-green-50 border-green-200 ${className}`}>
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-green-800 text-base sm:text-lg">Assinatura realizada com sucesso!</h3>
          <p className="text-green-700 mt-1 text-sm sm:text-base">
            Sua assinatura foi processada e está ativa. Você já pode aproveitar todos os benefícios do seu plano.
          </p>
          <Button
            variant="outline"
            className="mt-3 sm:mt-4 bg-white hover:bg-white touch-target"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CanceledNotification = ({ onClose, className = "" }: { onClose: () => void, className?: string }) => (
  <Card className={`bg-yellow-50 border-yellow-200 ${className}`}>
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-yellow-800 text-base sm:text-lg">Checkout cancelado</h3>
          <p className="text-yellow-700 mt-1 text-sm sm:text-base">
            Você cancelou o processo de checkout. Se precisar de ajuda ou tiver dúvidas, entre em contato com nosso suporte.
          </p>
          <Button
            variant="outline"
            className="mt-3 sm:mt-4 bg-white hover:bg-white touch-target"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NoSubscriptionView = ({ user }: { user: User | null }) => (
  <div className="space-y-6 sm:space-y-8">
    <div className="text-center mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
        Escolha seu Plano de Assinatura
      </h1>
      <p className="text-lg sm:text-xl text-gray-600">
        {user ? 
          "Você ainda não tem uma assinatura ativa." :
          "Faça login para gerenciar sua assinatura."
        }
      </p>
    </div>
    <SubscriptionPlans />
  </div>
);

export default Subscription;