
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiagnosisReport {
  clarityScore: number;
  hookAnalysis: string;
  ctaAnalysis: string;
  mentalTriggers: string[];
  suggestions: string[];
}

interface DiagnosisReportProps {
  diagnosisReport: DiagnosisReport | null;
  isOptimizing: boolean;
  onOptimize: () => void;
}

const DiagnosisReportComponent = ({ diagnosisReport, isOptimizing, onOptimize }: DiagnosisReportProps) => {
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Relatório de Diagnóstico</CardTitle>
        <CardDescription>
          {diagnosisReport ? 
            "Análise completa do seu anúncio com sugestões de melhoria" : 
            "O relatório aparecerá aqui após a análise"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-120px)] overflow-y-auto">
        {diagnosisReport ? (
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <span className="font-medium text-gray-700">Pontuação de Clareza</span>
                <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(diagnosisReport.clarityScore)}`}>
                  {diagnosisReport.clarityScore}/10
                </span>
              </div>
              <Badge variant={diagnosisReport.clarityScore >= 8 ? "default" : diagnosisReport.clarityScore >= 6 ? "secondary" : "destructive"}>
                {getScoreLabel(diagnosisReport.clarityScore)}
              </Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-gray-800">Análise do Gancho (Hook)</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosisReport.hookAnalysis}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-gray-800">Análise da Chamada para Ação</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosisReport.ctaAnalysis}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-gray-800">Gatilhos Mentais Sugeridos</h4>
              <div className="flex flex-wrap gap-2 mt-3">
                {diagnosisReport.mentalTriggers.map((trigger, index) => (
                  <Badge key={index} variant="outline">{trigger}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-gray-800">Sugestões de Melhoria</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {diagnosisReport.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={onOptimize} 
              className="w-full touch-target" 
              disabled={isOptimizing}
            >
              {isOptimizing ? "Gerando versões otimizadas..." : "Gerar Versões Otimizadas"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Cole seu anúncio e clique em "Analisar" para ver o diagnóstico
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosisReportComponent;
