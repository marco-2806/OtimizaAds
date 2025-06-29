import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { FunnelAnalysisResult } from "@/types/funnel-optimizer";

export const useFunnelOptimizer = () => {
  const [adText, setAdText] = useState<string>("");
  const [landingPageText, setLandingPageText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<FunnelAnalysisResult | null>(null);
  const [canUseFeature, setCanUseFeature] = useState<boolean>(true);
  const [usageData, setUsageData] = useState<{current: number, limit: number} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar se o usuário pode usar o recurso
  useEffect(() => {
    if (user) {
      checkFeatureUsage();
    }
  }, [user]);  // eslint-disable-line react-hooks/exhaustive-deps
  // A função checkFeatureUsage é definida no componente e não muda entre renderizações

  const checkFeatureUsage = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase.rpc('check_funnel_analysis_usage', {
        user_uuid: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const usage = data[0];
        setCanUseFeature(usage.can_use);
        setUsageData({
          current: usage.current_usage,
          limit: usage.limit_value
        });
        
        // Avisar se estiver próximo do limite
        if (usage.limit_value > 0 && usage.current_usage >= usage.limit_value * 0.8 && usage.current_usage < usage.limit_value) {
          toast({
            title: "Atenção",
            description: `Você utilizou ${usage.current_usage} de ${usage.limit_value} análises disponíveis em seu plano.`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar uso do recurso:', error);
    }
  };

  const validateTexts = (): {valid: boolean, message?: string} => {
    // Validar texto do anúncio
    if (!adText.trim()) {
      return { 
        valid: false, 
        message: "Por favor, insira o texto do anúncio." 
      };
    }

    if (adText.length > 2000) {
      return { 
        valid: false, 
        message: "O texto do anúncio deve ter no máximo 2000 caracteres." 
      };
    }

    // Validar texto da página de destino
    if (!landingPageText.trim()) {
      return { 
        valid: false, 
        message: "Por favor, insira o texto da página de destino." 
      };
    }

    if (landingPageText.length > 5000) {
      return { 
        valid: false, 
        message: "O texto da página de destino deve ter no máximo 5000 caracteres." 
      };
    }

    return { valid: true };
  };

  const saveToHistory = async (
    adText: string, 
    landingPageText: string, 
    results: FunnelAnalysisResult
  ) => {
    if (!user) return;

    try {
      const content = `
TEXTO DO ANÚNCIO:
${adText}

TEXTO DA PÁGINA DE DESTINO:
${landingPageText}

ANÁLISE DE COERÊNCIA:
Pontuação: ${results.funnelCoherenceScore}/10

DIAGNÓSTICO DO ANÚNCIO:
${results.adDiagnosis}

DIAGNÓSTICO DA PÁGINA DE DESTINO:
${results.landingPageDiagnosis}

SUGESTÕES DE MELHORIA:
${results.syncSuggestions.map((s, i) => `${i+1}. ${s}`).join('\n')}

ANÚNCIO OTIMIZADO:
${results.optimizedAd}
`;
      
      const inputData = {
        adText,
        landingPageText,
        results
      };
      
      const { error } = await supabase
        .from('history_items')
        .insert({
          user_id: user.id,
          type: 'funnel_analysis',
          title: `Análise de Funil: ${adText.substring(0, 30)}...`,
          content: content,
          input_data: inputData
        });

      if (error) {
        console.error('Error saving to history:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar no histórico.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Salvo no histórico!",
          description: "A análise foi salva no seu histórico.",
        });
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleAnalyze = async () => {
    // Validar textos de entrada
    const validation = validateTexts();
    if (!validation.valid) {
      toast({
        title: "Validação",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    if (!canUseFeature) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de análises do seu plano. Faça upgrade para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Chamar a Edge Function do Supabase
      const { data, error } = await supabase.functions.invoke('funnel-optimizer', {
        body: { 
          adText: adText.trim(), 
          landingPageText: landingPageText.trim()
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.funnelCoherenceScore) {
        throw new Error('Resposta inválida da API');
      }
      
      // Atualizar dados de uso após análise bem-sucedida
      await checkFeatureUsage();
      
      // Definir resultados
      setAnalysisResults(data);
      
      // Salvar no histórico
      await saveToHistory(adText, landingPageText, data);

      toast({
        title: "Análise concluída!",
        description: `Pontuação de coerência: ${data.funnelCoherenceScore}/10`,
      });
    } catch (error: unknown) {
      console.error('Error analyzing funnel:', error);

      // Verificar se é um erro de limite de plano
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('não inclui') || errorMessage.includes('limite') || errorMessage.includes('atingiu')) {
        setCanUseFeature(false);
        toast({
          title: "Limite atingido",
          description: "Você atingiu o limite de análises do seu plano ou seu plano não inclui este recurso. Faça upgrade para continuar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na análise",
          description: errorMessage || "Não foi possível analisar os textos. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetResults = () => {
    setAnalysisResults(null);
  };

  return {
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
  };
};