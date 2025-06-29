import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, RefreshCw, Settings, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { UserSubscription } from "@/types/subscription";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionDetailsProps {
  userSubscription: UserSubscription;
  onManage: () => void;
  onRefresh: () => void;
  loading: boolean;
  usageData?: {
    generations: { current: number; limit: number };
    diagnostics: { current: number; limit: number };
    funnel_analysis?: { current: number; limit: number };
  };
}

const SubscriptionDetails = ({
  userSubscription,
  onManage,
  onRefresh,
  loading,
  usageData
}: SubscriptionDetailsProps) => {
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-600";
      case 'trialing': return "bg-blue-600";
      case 'past_due': return "bg-red-600";
      case 'canceled': return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return "Ativo";
      case 'trialing': return "Em teste";
      case 'past_due': return "Pagamento pendente";
      case 'canceled': return "Cancelado";
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              Sua Assinatura
              <Badge className={getStatusColor(userSubscription.status)}>
                {getStatusText(userSubscription.status)}
              </Badge>
              {userSubscription.cancel_at_period_end && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  Cancelamento agendado
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e veja seu uso atual
            </CardDescription>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading} className="touch-target">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={onManage} variant="outline" size="sm" disabled={loading} className="touch-target">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <h3 className="font-semibold text-gray-900">Plano Atual</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {userSubscription.plan?.name || "Plano não encontrado"}
            </p>
            <p className="text-gray-600">
              {userSubscription.plan?.price_monthly 
                ? formatPrice(userSubscription.plan.price_monthly) + "/mês" 
                : ""}
            </p>
          </div>
          
          {userSubscription.current_period_end && (
            <div>
              <h3 className="font-semibold text-gray-900">Próxima Cobrança</h3>
              <p className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(userSubscription.current_period_end)}
              </p>
              {userSubscription.cancel_at_period_end && (
                <p className="text-sm text-yellow-600 font-medium mt-1">
                  Sua assinatura será encerrada após esta data
                </p>
              )}
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Método de Pagamento</h3>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowPaymentMethod(!showPaymentMethod)}
            >
              <CreditCard className="h-4 w-4" />
              {showPaymentMethod ? "Ocultar detalhes" : "Mostrar detalhes"}
            </Button>
            
            {showPaymentMethod && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md animate-in fade-in-50">
                {userSubscription.status === 'active' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pagamento configurado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>Verifique seu método de pagamento</span>
                  </div>
                )}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-1 h-auto p-0 text-blue-600"
                  onClick={onManage}
                >
                  Atualizar método de pagamento
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Uso do plano */}
        {usageData && (
          <div className="mt-6 sm:mt-8">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4">Uso do Plano</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Gerações de Anúncios</span>
                  <span className="text-sm text-gray-600">
                    {usageData.generations.current} / {usageData.generations.limit === -1 ? '∞' : usageData.generations.limit}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usageData.generations.current, usageData.generations.limit)}
                  className="h-2"
                />
                {usageData.generations.limit !== -1 && usageData.generations.current >= usageData.generations.limit * 0.8 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Você está se aproximando do limite do seu plano
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Diagnósticos</span>
                  <span className="text-sm text-gray-600">
                    {usageData.diagnostics.current} / {usageData.diagnostics.limit === -1 ? '∞' : usageData.diagnostics.limit}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(usageData.diagnostics.current, usageData.diagnostics.limit)}
                  className="h-2"
                />
                {usageData.diagnostics.limit !== -1 && usageData.diagnostics.current >= usageData.diagnostics.limit * 0.8 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Você está se aproximando do limite do seu plano
                  </p>
                )}
              </div>
                
                {usageData.funnel_analysis && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Análises de Funil</span>
                    <span className="text-sm text-gray-600">
                      {usageData.funnel_analysis.current} / {usageData.funnel_analysis.limit === -1 ? '∞' : usageData.funnel_analysis.limit}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usageData.funnel_analysis.current, usageData.funnel_analysis.limit)}
                    className="h-2"
                  />
                  {usageData.funnel_analysis.limit !== -1 && usageData.funnel_analysis.current >= usageData.funnel_analysis.limit * 0.8 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Você está se aproximando do limite do seu plano
                    </p>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Recursos do plano */}
        {userSubscription.plan?.features && (
          <div className="mt-6 sm:mt-8">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4">Recursos Incluídos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 sm:p-4 rounded-lg">
              {Object.entries(userSubscription.plan.features)
                .filter(([_, value]) => value === true || (typeof value === 'number' && value > 0) || value === -1 || value === 'all')
                .map(([key, value]) => {
                  const label = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                  
                  let displayValue = '';
                  if (typeof value === 'number') {
                    displayValue = value === -1 ? 'Ilimitado' : value.toString();
                  } else if (typeof value === 'string') {
                    displayValue = value;
                  }
                  
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">
                        {label} {displayValue ? `(${displayValue})` : ''}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetails;