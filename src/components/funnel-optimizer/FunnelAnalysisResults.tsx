import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelAnalysisResult } from "@/types/funnel-optimizer";
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  ArrowUpDown, 
  Lightbulb, 
  BarChart, 
  ArrowRight,
  ClipboardCheck 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface FunnelAnalysisResultsProps {
  results: FunnelAnalysisResult;
  originalAd: string;
  originalLandingPage: string;
  onReset: () => void;
}

export const FunnelAnalysisResults = ({
  results,
  originalAd,
  originalLandingPage,
  onReset
}: FunnelAnalysisResultsProps) => {
  const [copiedAd, setCopiedAd] = useState(false);
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bom";
    return "Precisa melhorar";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAd(true);
      setTimeout(() => setCopiedAd(false), 2000);
      toast({
        title: "Texto copiado!",
        description: "O anúncio otimizado foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-medium">Pontuação de Coerência:</span>
            <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(results.funnelCoherenceScore)}`}>
              {results.funnelCoherenceScore}/10
            </span>
          </div>
          <Badge variant={getScoreBadgeVariant(results.funnelCoherenceScore)}>
            {getScoreLabel(results.funnelCoherenceScore)}
          </Badge>
        </div>
        
        <Button variant="outline" onClick={onReset} className="flex items-center gap-2 touch-target h-10">
          <ArrowLeft className="h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            Resumo da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Coerência de Mensagem</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(results.funnelCoherenceScore * 10)}%</span>
              </div>
              <Progress value={results.funnelCoherenceScore * 10} className="h-2" />
            </div>
            
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Impacto na Conversão</p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    {results.funnelCoherenceScore >= 8 
                      ? "Sua coerência de funil está excelente! Isso deve resultar em altas taxas de conversão e menor custo por aquisição."
                      : results.funnelCoherenceScore >= 6
                      ? "Sua coerência de funil é boa, mas há espaço para melhorias. Implementar as sugestões pode aumentar suas conversões."
                      : "A baixa coerência entre seu anúncio e página de destino está provavelmente prejudicando suas conversões. Recomendamos implementar as sugestões urgentemente."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="diagnosis" className="w-full min-h-[400px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          <TabsTrigger value="optimized">Anúncio Otimizado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnosis" className="space-y-4 mt-4 min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Diagnóstico do Anúncio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{results.adDiagnosis}</p>
                
                <div className="mt-4 p-3 border rounded-lg bg-gray-50 max-h-[150px] overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2">Anúncio Original</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalAd}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Diagnóstico da Página de Destino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{results.landingPageDiagnosis}</p>
                
                <div className="mt-4 p-3 border rounded-lg bg-gray-50 max-h-[150px] overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2">Página de Destino</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalLandingPage}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-blue-600" />
                Análise de Coerência
              </CardTitle>
              <CardDescription>
                Avaliação da sincronia entre seu anúncio e página de destino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Pontos de Alinhamento</h3>
                    <ul className="space-y-1">
                      {[
                        "Menção ao desconto de 50%",
                        "Foco em marketing digital",
                        "Chamada para ação para inscrição"
                      ].map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Pontos de Desalinhamento</h3>
                    <ul className="space-y-1">
                      {[
                        "Tópicos específicos mencionados apenas na página",
                        "Certificado e garantia ausentes no anúncio",
                        "Diferença na linguagem de urgência"
                      ].map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-red-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suggestions" className="space-y-4 mt-4 min-h-[400px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Sugestões de Melhoria
              </CardTitle>
              <CardDescription>
                Recomendações para aumentar a coerência e melhorar as conversões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 md:space-y-4">
                {results.syncSuggestions.map((suggestion, index) => (
                  <li key={index} className="p-3 md:p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Para maximizar suas conversões, recomendamos:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 pl-2">
                  <li>Implementar as sugestões de melhoria listadas acima</li>
                  <li>Utilizar o anúncio otimizado fornecido na próxima aba</li>
                  <li>Testar diferentes variações para identificar o que funciona melhor</li>
                  <li>Monitorar as métricas de desempenho após as alterações</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimized" className="space-y-4 mt-4 min-h-[400px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Anúncio Otimizado</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(results.optimizedAd)}
                  className="flex items-center gap-2 touch-target h-9"
                >
                  {copiedAd ? (
                    <>
                      <ClipboardCheck className="h-4 w-4 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Versão reescrita do seu anúncio para maior coerência com a página de destino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{results.optimizedAd}</p>
              </div>
              
              <div className="mt-4 sm:mt-6 space-y-2">
                <h3 className="font-medium text-gray-900">Por que este anúncio funciona melhor?</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Este anúncio foi otimizado para criar uma experiência coerente com sua página de destino. 
                  Ele mantém as promessas alinhadas com o que o usuário encontrará na página, 
                  utiliza linguagem e tom similares, e enfatiza os mesmos benefícios e pontos-chave.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A coerência entre anúncio e página de destino não apenas melhora a experiência do usuário, 
                  mas também aumenta a qualidade do anúncio nas plataformas de publicidade, 
                  potencialmente reduzindo seu custo por clique e aumentando as conversões.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center sm:justify-between mt-6">
            <Button variant="outline" onClick={onReset} className="touch-target h-10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nova Análise
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};