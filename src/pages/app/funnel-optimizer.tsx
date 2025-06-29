import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelOptimizerForm } from "@/components/funnel-optimizer/FunnelOptimizerForm";
import { FunnelAnalysisResults } from "@/components/funnel-optimizer/FunnelAnalysisResults";
import { useFunnelOptimizer } from "@/hooks/useFunnelOptimizer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const FunnelOptimizer = () => {
  const {
    adText,
    setAdText,
    landingPageText,
    setLandingPageText,
    isAnalyzing,
    analysisResults,
    handleAnalyze,
    resetResults,
    canUseFeature,
    usageData
  } = useFunnelOptimizer();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laboratório de Otimização de Funil</h1>
        <p className="text-gray-600 mt-2">
          Analise a coerência entre seu anúncio e página de destino para maximizar suas conversões
        </p>
      </div>

      {!canUseFeature && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-base">Recurso não disponível</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            Seu plano atual não inclui acesso ao Laboratório de Otimização de Funil ou você atingiu o limite de análises. 
            <Link to="/app/assinatura" className="underline font-medium ml-1">Faça upgrade para um plano superior</Link> para continuar utilizando este recurso.
          </AlertDescription>
        </Alert>
      )}

      {!analysisResults ? (
        <FunnelOptimizerForm
          adText={adText}
          setAdText={setAdText}
          landingPageText={landingPageText}
          setLandingPageText={setLandingPageText}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          canUseFeature={canUseFeature}
          usageData={usageData}
        />
      ) : (
        <FunnelAnalysisResults
          results={analysisResults}
          originalAd={adText}
          originalLandingPage={landingPageText}
          onReset={resetResults}
        />
      )}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Por que a coerência de funil é importante?
          </CardTitle>
          <CardDescription>
            Entenda como a sincronia entre anúncio e página de destino afeta suas conversões
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 sm:pt-2">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              A coerência entre o anúncio e a página de destino é um dos <strong>fatores mais importantes</strong> para o sucesso de uma campanha. Quando um usuário clica em um anúncio, ele cria uma expectativa sobre o que encontrará na página de destino.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Se a página não entregar o que foi prometido no anúncio, ou se a mensagem não for consistente, o usuário provavelmente abandonará o site sem converter. Isso:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Desperdiça seu investimento em publicidade</li>
              <li>Prejudica sua qualidade de anúncio nas plataformas</li>
              <li>Reduz drasticamente suas taxas de conversão</li>
              <li>Aumenta o custo de aquisição de clientes (CAC)</li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nossa ferramenta analisa a coerência entre seu anúncio e página de destino, identificando desalinhamentos e sugerindo melhorias para maximizar suas conversões.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunnelOptimizer;