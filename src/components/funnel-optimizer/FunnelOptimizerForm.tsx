import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Lightbulb, AlertTriangle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

interface FunnelOptimizerFormProps {
  adText: string;
  setAdText: (text: string) => void;
  landingPageText: string;
  setLandingPageText: (text: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  canUseFeature?: boolean;
  usageData?: {current: number, limit: number} | null;
}

export const FunnelOptimizerForm = ({
  adText,
  setAdText,
  landingPageText,
  setLandingPageText,
  isAnalyzing,
  onAnalyze,
  canUseFeature = true,
  usageData
}: FunnelOptimizerFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("ad");

  // Validar limites de caracteres
  const adTextExceedsLimit = adText.length > 2000;
  const landingPageTextExceedsLimit = landingPageText.length > 5000;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {usageData && usageData.limit > 0 && (
        <Alert variant={usageData.current >= usageData.limit * 0.8 ? "warning" : "default"}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <AlertTitle className="flex items-center gap-2">
              {usageData.current >= usageData.limit * 0.8 && (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              Uso do recurso
              </AlertTitle>
            </div>
            <AlertDescription className="text-sm">
              Você utilizou {usageData.current} de {usageData.limit} análises disponíveis em seu plano atual.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {!canUseFeature && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limite atingido</AlertTitle>
          <AlertDescription>
            Você atingiu o limite de análises do seu plano. Faça upgrade para continuar utilizando este recurso.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ad">Texto do Anúncio</TabsTrigger>
          <TabsTrigger value="landing">Texto da Página de Destino</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ad" className="space-y-4 mt-4 min-h-[300px]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Texto do Anúncio
              </CardTitle>
              <CardDescription>
                Cole o texto completo do seu anúncio (título, descrição e chamada para ação)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <div className="space-y-2">
                <Textarea
                  value={adText}
                  onChange={(e) => setAdText(e.target.value)}
                  placeholder="Ex: 🔥 Curso de Marketing Digital com 50% OFF! Aprenda a criar campanhas que convertem e aumente suas vendas. Últimas vagas disponíveis, inscreva-se agora!"
                  className={`min-h-[200px] h-full resize-none ${adTextExceedsLimit ? 'border-red-500' : ''}`}
                  disabled={!canUseFeature || isAnalyzing}
                />
                <div className="flex justify-between">
                  <span className={`text-xs ${adTextExceedsLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    Caracteres: {adText.length}{adTextExceedsLimit ? ' (limite máximo: 2000)' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">
                      Inclua título, descrição e CTA para uma análise completa
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab("landing")}
              className="flex items-center gap-2 touch-target"
              disabled={!canUseFeature || isAnalyzing}
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="landing" className="space-y-4 mt-4 min-h-[300px]">
          <Card className="h-full">
            <CardHeader className="flex flex-col">
              <div className="text-xl font-medium mb-1">
                Texto da Página de Destino
              </div>
              <CardDescription>Cole o texto principal da sua página de destino (headline, benefícios, descrição)</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <div className="space-y-2">
                <Textarea
                  value={landingPageText}
                  onChange={(e) => setLandingPageText(e.target.value)}
                  placeholder="Ex: Curso Completo de Marketing Digital | Transforme seu negócio com estratégias comprovadas. Nosso curso abrange Facebook Ads, Google Ads, SEO e muito mais. Garanta 50% de desconto na inscrição até o final da semana."
                  className={`min-h-[250px] h-full resize-none ${landingPageTextExceedsLimit ? 'border-red-500' : ''}`}
                  disabled={!canUseFeature || isAnalyzing}
                />
                <div className="flex justify-between">
                  <span className={`text-xs ${landingPageTextExceedsLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    Caracteres: {landingPageText.length}{landingPageTextExceedsLimit ? ' (limite máximo: 5000)' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">
                      Inclua os elementos principais da sua página para melhor análise
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab("ad")}
              className="gap-2 touch-target"
              className="touch-target"
              disabled={!canUseFeature || isAnalyzing}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Anúncio</span>
            </Button>
            
            <Button
              type="submit" 
              className="touch-target"
              disabled={
                isAnalyzing || 
                !adText.trim() || 
                !landingPageText.trim() || 
                !canUseFeature || 
                adTextExceedsLimit || 
                landingPageTextExceedsLimit
              }
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : (
                <>
                  Analisar Coerência
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
};