import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Configuração do Supabase com API key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Cliente anônimo para operações permitidas para o usuário final
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Cliente com chave de serviço para operações privilegiadas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Headers CORS para permitir chamadas cross-origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type OpenAIResponse = {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
};

type AnthropicResponse = {
  content: {
    text: string;
  }[];
};

async function processIA(prompt: string, systemPrompt: string, model: any): Promise<string> {
  // Lógica para processar a requisição com o modelo correto
  
  // Buscar configurações do provedor
  const { data: providerData } = await supabaseAdmin
    .from("provider_configurations")
    .select("*")
    .eq("id", model.provider_id)
    .single();
    
  if (!providerData) {
    throw new Error("Provedor não encontrado");
  }
  
  // Extrair a chave de API do provedor
  const apiKey = providerData.configuration?.api_key || "";
  
  // Determinar qual provedor está sendo usado
  const provider = providerData.provider_name;
  
  if (provider === "openai") {
    // Chamada para OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.provider_model_id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: model.temperature,
        max_tokens: 2048,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || response.statusText}`);
    }
    
    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message.content || "";
  } 
  else if (provider === "anthropic") {
    // Chamada para Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model.provider_model_id,
        system: systemPrompt,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: model.temperature,
        max_tokens: 2048,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API da Anthropic: ${errorData.error?.message || response.statusText}`);
    }
    
    const data: AnthropicResponse = await response.json();
    return data.content[0]?.text || "";
  }
  else {
    // Simulação de resposta para outros provedores ou para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = {
      funnelCoherenceScore: 7.5,
      adDiagnosis: "O anúncio apresenta uma proposta de valor clara, mas poderia enfatizar mais os benefícios específicos do produto.",
      landingPageDiagnosis: "A página de destino contém as informações principais, mas a proposta de valor poderia estar mais evidente logo no início.",
      syncSuggestions: [
        "Alinhe as palavras-chave principais entre o anúncio e a página de destino",
        "Mantenha a mesma proposta de valor em ambos os textos",
        "Certifique-se de que a chamada para ação no anúncio corresponda ao botão principal da página",
        "Use linguagem consistente e tom de voz similar em ambos"
      ],
      optimizedAd: "🚀 Transforme seu Marketing Digital com nosso Curso Completo! Aprenda Facebook Ads, SEO e estratégias que funcionam. 50% OFF apenas hoje - mesma garantia de 30 dias mencionada em nossa página. Clique agora e comece sua transformação! ✨"
    };
    
    return JSON.stringify(analysis);
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

serve(async (req) => {
  // Lidar com requisições OPTIONS (pre-flight CORS)
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
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verificar se o usuário pode usar o recurso
    const { data: usageData } = await supabaseAdmin.rpc("check_funnel_analysis_usage", {
      user_uuid: user.id
    });
    
    if (!usageData[0]?.can_use) {
      return new Response(
        JSON.stringify({ error: "Você atingiu o limite de análises do seu plano ou seu plano não inclui este recurso" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verificar cache
    const cacheKey = await hashString(`funnel_analysis:${adText}:${landingPageText}`);
    
    // Buscar configurações de cache
    const { data: appSettings } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "funnel_optimizer")
      .single();
    
    const cacheEnabled = appSettings?.value?.cacheEnabled !== false;
    
    if (cacheEnabled) {
      const { data: cachedResult } = await supabaseAdmin
        .from("system_cache")
        .select("value")
        .eq("key", cacheKey)
        .maybeSingle();
      
      if (cachedResult) {
        // Incrementar contador de uso
        await supabaseAdmin.rpc("increment_usage_counter", {
          p_user_uuid: user.id,
          p_feature_type: "funnel_analysis"
        });
        
        // Incrementar métrica de cache hit
        await supabaseAdmin
          .from("usage_metrics")
          .upsert({
            metric_type: "cache_hits",
            metric_value: 1,
            date: new Date().toISOString().split("T")[0]
          }, {
            onConflict: "metric_type,date",
            ignoreDuplicates: false
          });
        
        return new Response(
          JSON.stringify(cachedResult.value),
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "X-Cache": "HIT"
            } 
          }
        );
      }
    }
    
    // Não encontrou no cache, processar com IA
    
    // Buscar o modelo correto para funnel_analysis
    const { data: aiConfig } = await supabaseAdmin
      .from("ai_configurations")
      .select(`
        *,
        model:model_id (
          id,
          model_name,
          provider_id,
          provider_model_id,
          temperature,
          max_tokens,
          top_p,
          frequency_penalty,
          presence_penalty
        )
      `)
      .eq("config_level", "service")
      .eq("level_identifier", "funnel_analysis")
      .eq("is_active", true)
      .single();
    
    if (!aiConfig) {
      return new Response(
        JSON.stringify({ error: "Configuração de IA não encontrada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Construir o prompt para a IA
    const prompt = `
      Analise a coerência entre o seguinte anúncio e sua página de destino:
      
      ANÚNCIO:
      "${adText}"
      
      PÁGINA DE DESTINO:
      "${landingPageText}"
      
      Forneça a análise no seguinte formato JSON:
      {
        "funnelCoherenceScore": número de 0 a 10 representando a pontuação de coerência,
        "adDiagnosis": "diagnóstico do anúncio",
        "landingPageDiagnosis": "diagnóstico da página de destino",
        "syncSuggestions": ["sugestão 1", "sugestão 2", "sugestão 3", "sugestão 4"],
        "optimizedAd": "versão otimizada do anúncio para melhorar a coerência"
      }
    `;
    
    // Obter system prompt da configuração ou usar um padrão
    const systemPrompt = aiConfig.system_prompt || 
      "Você é um especialista em marketing de performance e otimização de funis de conversão. Sua tarefa é analisar a coerência entre anúncios e páginas de destino, fornecendo diagnósticos precisos e sugestões acionáveis para melhorar as taxas de conversão.";
    
    // Medir tempo de processamento
    const startTime = Date.now();
    
    try {
      // Processar com a IA usando o modelo configurado
      const aiResponse = await processIA(prompt, systemPrompt, aiConfig.model);
      
      // Calcular tempo de processamento
      const processingTime = Date.now() - startTime;
      
      // Processar resposta da IA (pode ser JSON ou texto)
      let analysisResult;
      try {
        analysisResult = JSON.parse(aiResponse);
      } catch (e) {
        // Se não for JSON válido, criar um resultado padrão
        analysisResult = {
          funnelCoherenceScore: 5,
          adDiagnosis: "Análise não disponível no formato esperado",
          landingPageDiagnosis: "Análise não disponível no formato esperado",
          syncSuggestions: ["Verifique a formatação do texto", "Tente novamente com textos mais claros"],
          optimizedAd: aiResponse.substring(0, 500) // Pegar parte da resposta como anúncio otimizado
        };
      }
      
      // Armazenar em cache se o cache estiver ativado
      if (cacheEnabled) {
        await supabaseAdmin
          .from("system_cache")
          .upsert({
            key: cacheKey,
            value: analysisResult,
            expires_at: new Date(Date.now() + (appSettings?.value?.cacheExpiryHours || 24) * 60 * 60 * 1000).toISOString()
          });
      }
      
      // Incrementar contador de uso
      await supabaseAdmin.rpc("increment_usage_counter", {
        p_user_uuid: user.id,
        p_feature_type: "funnel_analysis"
      });
      
      // Registrar no log de análises de funil
      await supabaseAdmin
        .from("funnel_analysis_logs")
        .insert({
          user_id: user.id,
          ad_text: adText,
          landing_page_text: landingPageText,
          coherence_score: analysisResult.funnelCoherenceScore,
          suggestions: analysisResult.syncSuggestions,
          optimized_ad: analysisResult.optimizedAd,
          processing_time_ms: processingTime
        });
      
      // Registrar métricas de uso da IA
      await supabaseAdmin
        .from("ai_usage_metrics")
        .insert({
          user_id: user.id,
          model_name: aiConfig.model?.model_name || "unknown",
          service_type: "funnel_analysis",
          tokens_input: (adText.length + landingPageText.length) / 4, // Aproximação de tokens
          tokens_output: aiResponse.length / 4, // Aproximação de tokens
          estimated_cost: 0.0, // Calcular custo real em produção
          response_time_ms: processingTime,
          success: true
        });
      
      return new Response(
        JSON.stringify(analysisResult),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-Cache": "MISS",
            "X-Processing-Time": processingTime.toString()
          } 
        }
      );
    } catch (error) {
      console.error("Erro ao processar análise de funil:", error);
      
      // Registrar erro
      await supabaseAdmin
        .from("ai_usage_metrics")
        .insert({
          user_id: user.id,
          model_name: aiConfig.model?.model_name || "unknown",
          service_type: "funnel_analysis",
          tokens_input: (adText.length + landingPageText.length) / 4, // Aproximação de tokens
          tokens_output: 0,
          estimated_cost: 0.0,
          response_time_ms: Date.now() - startTime,
          success: false
        });
      
      return new Response(
        JSON.stringify({ 
          error: error.message || "Erro ao processar análise de funil"
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
  } catch (error) {
    console.error("Erro geral:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
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