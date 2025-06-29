import { createClient } from "npm:@supabase/supabase-js@2";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Cliente Supabase para usuários e admin
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info"
};

// System prompt padrão
const DEFAULT_SYSTEM_PROMPT = `# IDENTIDADE E OBJETIVO

Você é o "Analista de Funil IA", um especialista sênior em Marketing de Performance e Otimização da Taxa de Conversão (CRO). Sua identidade é a de um consultor preciso, analítico e focado em resultados.

Sua missão é analisar a coerência e a sinergia entre o texto de um anúncio e o texto de uma página de destino, com o objetivo de identificar pontos de fricção e fornecer um diagnóstico claro com sugestões acionáveis para maximizar as taxas de conversão.

# TAREFA DETALHADA

Execute uma análise passo a passo, comparando o Anúncio com a Página de Destino. Sua análise deve cobrir os seguintes pontos críticos:

1. Coerência da Oferta e Mensagem Principal: Verifique se a promessa central (ex: "50% OFF", "Aprenda a criar campanhas") feita no anúncio é imediatamente visível, clara e consistente na página de destino.

2. Alinhamento do Tom de Voz: Avalie se o estilo de linguagem, formalidade e tom emocional são consistentes entre as duas peças.

3. Consistência da Chamada para Ação (CTA): Compare o CTA do anúncio (ex: "Inscreva-se agora") com o CTA principal da página de destino. Eles são congruentes e levam ao mesmo objetivo?

4. Identificação de Pontos de Fricção: Aponte qualquer quebra de expectativa, mensagem confusa ou informação prometida no anúncio que não é facilmente encontrada na página de destino.

# FORMATO DA SAÍDA

Você deve retornar APENAS um objeto JSON válido no seguinte formato:
{
  "funnelCoherenceScore": [número de 0 a 10 representando a pontuação de coerência],
  "adDiagnosis": "Diagnóstico detalhado do anúncio analisando proposta de valor, clareza da mensagem, apelo emocional e eficácia do CTA. Seja específico sobre pontos fortes e fracos.",
  "landingPageDiagnosis": "Diagnóstico detalhado da página de destino analisando consistência com o anúncio, clareza da informação, facilidade de navegação e conversão. Identifique gaps e oportunidades.",
  "syncSuggestions": [
    "Sugestão específica e acionável 1 com prioridade alta - foque em alinhamento de mensagem",
    "Sugestão específica e acionável 2 com prioridade média - melhore a consistência do tom", 
    "Sugestão específica e acionável 3 com prioridade baixa - otimize elementos de conversão",
    "Sugestão adicional se necessário para completar a análise"
  ],
  "optimizedAd": "Versão otimizada do anúncio que mantém a essência original mas melhora a coerência com a página de destino e maximiza o potencial de conversão. Use linguagem persuasiva e elementos de prova social quando apropriado."
}`;

// Simular resposta para testes
async function generateSimulatedResponse() {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const analysis = {
    funnelCoherenceScore: 7.5,
    adDiagnosis: "O anúncio apresenta uma proposta de valor clara, mas poderia enfatizar mais os benefícios específicos do produto. A linguagem está adequada ao público-alvo.",
    landingPageDiagnosis: "A página de destino contém as informações principais e mantém consistência com o anúncio. A proposta de valor poderia estar mais evidente logo no início da página.",
    syncSuggestions: [
      "Alinhe as palavras-chave principais entre o anúncio e a página de destino",
      "Mantenha a mesma proposta de valor em ambos os textos",
      "Certifique-se de que a chamada para ação no anúncio corresponda ao botão principal da página",
      "Use linguagem consistente e tom de voz similar em ambos os materiais"
    ],
    optimizedAd: "🚀 Transforme seu Marketing Digital com nosso Curso Completo! Aprenda Facebook Ads, SEO e estratégias comprovadas que funcionam. 50% OFF apenas hoje - mesma garantia de 30 dias mencionada em nossa página. Clique agora e comece sua transformação! ✨"
  };
  
  return JSON.stringify(analysis);
}

// Função principal do servidor
Deno.serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS pre-flight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Extrair dados da requisição
    const { adText, landingPageText } = await req.json();
    
    // Validar entrada
    if (!adText || !landingPageText) {
      return new Response(
        JSON.stringify({ error: "Textos de anúncio e página de destino são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar permissões (se o usuário pode usar o serviço)
    const { data: usageData, error: usageError } = await supabase.rpc("check_funnel_analysis_usage", {
      user_uuid: user.id
    }).catch(() => ({ data: [{ can_use: true }], error: null }));

    if (usageError || (usageData && usageData[0] && !usageData[0].can_use)) {
      return new Response(
        JSON.stringify({ error: "Você atingiu o limite de análises do seu plano." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Processar a análise
    // Em uma implementação real, aqui chamaríamos o modelo de IA
    // Para simplificar, usamos uma resposta simulada
    const response = await generateSimulatedResponse();
    const analysis = JSON.parse(response);
    
    // Incrementar contador de uso
    try {
      await supabase.rpc("increment_usage_counter", {
        p_user_uuid: user.id,
        p_feature_type: "funnel_analysis"
      });
    } catch (error) {
      console.error("Erro ao incrementar contador:", error);
    }

    // Retornar resultado
    return new Response(
      JSON.stringify(analysis),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    // Lidar com erros
    console.error("Erro ao processar requisição:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar a análise",
        message: error.message
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});