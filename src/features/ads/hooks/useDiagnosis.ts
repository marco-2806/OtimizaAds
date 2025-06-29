import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";

interface DiagnosisReport {
  clarityScore: number;
  hookAnalysis: string;
  ctaAnalysis: string;
  mentalTriggers: string[];
  suggestions: string[];
}

export const useDiagnosis = () => {
  const [adText, setAdText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisReport, setDiagnosisReport] = useState<DiagnosisReport | null>(null);
  const [optimizedAds, setOptimizedAds] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Função para validar e formatar o texto do anúncio
  const validateAndFormatText = (text: string): { isValid: boolean; formattedText?: string; error?: string } => {
    if (!text.trim()) {
      return { isValid: false, error: "O texto do anúncio não pode estar vazio." };
    }
    
    // Extrair apenas o texto sem as tags HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textOnly = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textOnly.length < 50) {
      return { isValid: false, error: "O texto do anúncio deve ter no mínimo 50 caracteres." };
    }
    
    if (textOnly.length > 1000) {
      return { isValid: false, error: "O texto do anúncio deve ter no máximo 1000 caracteres." };
    }
    
    // Sanitizar o HTML para remover scripts maliciosos
    const sanitizedHtml = DOMPurify.sanitize(text);
    
    // Para o caso de precisarmos apenas do texto simples para a API
    const plainText = textOnly.trim().replace(/\s+/g, ' ');
      
    return { isValid: true, formattedText: plainText, originalHtml: sanitizedHtml };
  };

  const saveToHistory = async (originalHtml: string, diagnosisReport: DiagnosisReport, optimizedAds: string[] = []) => {
    if (!user) return;

    try {
      // Extrair texto puro para o título
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalHtml;
      const textOnly = tempDiv.textContent || tempDiv.innerText || '';
      
      // Criar conteúdo combinando HTML e relatório
      const content = `TEXTO ORIGINAL:\n${originalHtml}\n\n---\n\nRELATÓRIO DE DIAGNÓSTICO:\n${JSON.stringify(diagnosisReport, null, 2)}\n\n---\n\nVERSÕES OTIMIZADAS:\n${optimizedAds.join('\n\n')}`;
      
      const inputData = JSON.parse(JSON.stringify({
        originalHtml,
        diagnosisReport,
        optimizedAds
      }));
      
      const { error } = await supabase
        .from('history_items')
        .insert({
          user_id: user.id,
          type: 'diagnosis',
          title: `Diagnóstico: ${textOnly.substring(0, 50)}...`,
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
          description: "O diagnóstico foi salvo no seu histórico.",
        });
      }
    } catch (error) {
      console.error('Error saving to history:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar no histórico.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    // Validar e formatar o texto do anúncio
    const validation = validateAndFormatText(adText);
    if (!validation.isValid) {
      toast({
        title: "Erro de validação",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Usar o texto formatado para a API e o HTML original para salvar
    const formattedAdText = validation.formattedText!;
    const originalHtml = validation.originalHtml;
    
    setIsAnalyzing(true);

    try {
      console.log("Analisando anúncio:", formattedAdText);
      
      // Verificar se o usuário pode usar o serviço (verificar limite do plano)
      try {
        // Chamada para função que verifica uso do recurso (exemplo)
        const { data, error } = await supabase.rpc('check_feature_usage', {
          user_uuid: user?.id,
          feature: 'diagnostics'
        });
        
        if (error) throw error;
        
        // Se não puder usar o recurso, mostrar mensagem de erro
        if (data && data[0] && !data[0].can_use) {
          throw new Error('Você atingiu o limite de diagnósticos do seu plano.');
        }
        
      } catch (usageError) {
        // Se ocorrer erro na verificação de uso, apenas logar e continuar
        console.error('Erro ao verificar uso da funcionalidade:', usageError);
      }
      
      // Simular chamada à API de diagnóstico
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock do relatório de diagnóstico
      const mockReport: DiagnosisReport = {
        clarityScore: 7.5,
        hookAnalysis: "O gancho inicial está adequado, mas poderia ser mais impactante. Considere usar uma pergunta provocativa ou uma estatística surpreendente.",
        ctaAnalysis: "A chamada para ação está presente, mas não transmite urgência. Adicione elementos de escassez ou tempo limitado.",
        mentalTriggers: ["Urgência", "Autoridade", "Prova Social"],
        suggestions: [
          "Adicione uma pergunta provocativa no início",
          "Inclua números ou estatísticas para credibilidade",
          "Reforce a chamada para ação com urgência",
          "Use mais gatilhos de prova social"
        ]
      };
      
      // Incrementar contador de uso da funcionalidade
      if (user) {
        try {
          await supabase.rpc('increment_usage_counter', {
            p_user_uuid: user.id,
            p_feature_type: 'diagnostics'
          });
        } catch (error) {
          console.error('Erro ao incrementar contador de uso:', error);
        }
      }
      
      setDiagnosisReport(mockReport);
      
      // Salvar diagnóstico no histórico
      await saveToHistory(originalHtml, mockReport);
      
      toast({
        title: "Análise concluída!",
        description: "Seu anúncio foi analisado com sucesso.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Tente novamente em alguns instantes.";
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!diagnosisReport) return;
    
    setIsOptimizing(true);

    try {
      console.log("Otimizando anúncio com base no diagnóstico:", diagnosisReport);
      
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock de anúncios otimizados
      const mockOptimizedAds = [
        "🚨 Você sabia que 87% das pessoas falham no marketing digital? Descubra o método exato que transformou mais de 1.000 empreendedores em especialistas. ⏰ Últimas 24h com desconto! Clique agora! 👇",
        "❓ Por que seus concorrentes vendem mais que você? A resposta está no nosso curso comprovado por + de 500 alunos. 🔥 Apenas hoje: 50% OFF! Garantir minha vaga →",
        "✅ Método aprovado por 1.000+ empreendedores está com vagas limitadas! Transforme seu negócio em 30 dias ou seu dinheiro de volta. ⚡ Restam apenas 12 vagas! Quero me inscrever!"
      ];
      
      setOptimizedAds(mockOptimizedAds);
      
      // Atualizar histórico com as versões otimizadas
      await saveToHistory(adText, diagnosisReport, mockOptimizedAds);
      
      toast({
        title: "Otimização concluída!",
        description: "3 versões otimizadas foram geradas.",
      });
    } catch (error) {
      toast({
        title: "Erro na otimização",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    adText,
    setAdText,
    isAnalyzing,
    diagnosisReport,
    optimizedAds,
    isOptimizing,
    handleAnalyze,
    handleOptimize,
    validateAndFormatText
  };
};