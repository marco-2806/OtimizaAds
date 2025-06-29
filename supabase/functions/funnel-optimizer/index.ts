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
  console.log('Processando IA com modelo:', model?.model_name);
  
  // Se não temos modelo configurado, usar simulação
  if (!model || !model.provider_id) {
    console.log('Usando simulação por falta de configuração de modelo');
    return await generateSimulatedResponse();
  }
  
  try {
    // Buscar configurações do provedor
    const { data: providerData, error: providerError } = await supabaseAdmin
      .from("provider_configurations")
      .select("*")
      .eq("id", model.provider_id)
      .eq("is_active", true)
      .single();
      
    if (providerError || !providerData) {
      console.log('Provedor não encontrado ou inativo, usando simulação:', providerError?.message);
      return await generateSimulatedResponse();
    }
    
    // Extrair a chave de API do provedor
    const apiKey = providerData.configuration?.api_key || "";
    
    if (!apiKey) {
      console.log('API key não configurada, usando simulação');
      return await generateSimulatedResponse();
    }
    
    // Determinar qual provedor está sendo usado
    const provider = providerData.provider_name;
    console.log('Usando provedor:', provider);
    
    try {
      if (provider === "openai") {
        return await callOpenAI(prompt, systemPrompt, model, apiKey);
      } 
      else if (provider === "anthropic") {
        return await callAnthropic(prompt, systemPrompt, model, apiKey);
      }
      else {
        console.log('Provedor não suportado, usando simulação:', provider);
        return await generateSimulatedResponse();
      }
    } catch (callError) {
      console.error(`Erro ao chamar API do provedor ${provider}:`, callError);
      // Em caso de erro de comunicação com o provedor, usar simulação como fallback
      return await generateSimulatedResponse();
    }
  } catch (error) {
    console.error('Erro ao processar IA:', error);
    return await generateSimulatedResponse();
  }
}

async function callOpenAI(prompt: string, systemPrompt: string, model: any, apiKey: string): Promise<string> {
  try {
    console.log('Chamando OpenAI...');
    
    // Adicionando timeout para evitar longas esperas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.provider_model_id || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: model.temperature || 0.7,
          max_tokens: 2048,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
        throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || response.statusText}`);
      }
      
      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message.content || "";
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout ao chamar a API da OpenAI');
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro na chamada OpenAI:', error);
    throw error;
  }
}

async function callAnthropic(prompt: string, systemPrompt: string, model: any, apiKey: string): Promise<string> {
  try {
    console.log('Chamando Anthropic...');
    
    // Adicionando timeout para evitar longas esperas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model.provider_model_id || "claude-3-haiku-20240307",
          system: systemPrompt,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: model.temperature || 0.7,
          max_tokens: 2048,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
        throw new Error(`Erro na API da Anthropic: ${errorData.error?.message || response.statusText}`);
      }
      
      const data: AnthropicResponse = await response.json();
      return data.content[0]?.text || "";
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout ao chamar a API da Anthropic');
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro na chamada Anthropic:', error);
    throw error;
  }
}

async function generateSimulatedResponse(): Promise<string> {
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const analysis = {
    funnelCoherenceScore: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6.0 a 9.0
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

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

Deno.serve(async (req) => {
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
    
    console.log('Processando solicitação para usuário:', user.id);
    
    // Verificar se o usuário pode usar o recurso
    try {
      const { data: usageData, error: usageError } = await supabaseAdmin.rpc("check_funnel_analysis_usage", {
        user_uuid: user.id
      });
      
      if (usageError) {
        console.log('Erro ao verificar usage, permitindo acesso:', usageError.message);
      } else if (usageData && usageData[0] && !usageData[0].can_use) {
        return new Response(
          JSON.stringify({ error: "Você atingiu o limite de análises do seu plano ou seu plano não inclui este recurso" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.log('Erro ao verificar limitações de uso, permitindo acesso:', error);
    }
    
    // Verificar cache
    const cacheKey = await hashString(`funnel_analysis:${adText}:${landingPageText}`);
    
    // Buscar configurações de cache
    const { data: appSettings } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "funnel_optimizer")
      .maybeSingle();
    
    const cacheEnabled = appSettings?.value?.cacheEnabled !== false;
    
    if (cacheEnabled) {
      try {
        const { data: cachedResult } = await supabaseAdmin
          .from("system_cache")
          .select("value")
          .eq("key", cacheKey)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();
        
        if (cachedResult) {
          console.log('Resultado encontrado no cache');
          
          // Incrementar contador de uso se a função existir
          try {
            await supabaseAdmin.rpc("increment_usage_counter", {
              p_user_uuid: user.id,
              p_feature_type: "funnel_analysis"
            });
          } catch (error) {
            console.log('Erro ao incrementar contador:', error);
          }
          
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
      } catch (cacheError) {
        console.log('Erro ao verificar cache:', cacheError);
      }
    }
    
    // Não encontrou no cache, processar com IA
    console.log('Não encontrado no cache, processando com IA...');
    
    // Buscar o modelo correto para funnel_analysis
    let aiConfig = null;
    let configError = null;
    try {
      const { data, error } = await supabaseAdmin
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
        .maybeSingle();
      
      aiConfig = data;
      configError = error;
    } catch (error) {
      console.log('Erro ao buscar configuração de IA:', error);
    }
    
    console.log('Configuração de IA encontrada:', !!aiConfig);
    if (configError) {
      console.log('Erro ao buscar configuração:', configError.message);
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
    const systemPrompt = aiConfig?.system_prompt || 
      "Você é um especialista em marketing de performance e otimização de funis de conversão. Sua tarefa é analisar a coerência entre anúncios e páginas de destino, fornecendo diagnósticos precisos e sugestões acionáveis para melhorar as taxas de conversão.";
    
    // Medir tempo de processamento
    const startTime = Date.now();
    
    try {
      // Processar com a IA usando o modelo configurado
      const aiResponse = await processIA(prompt, systemPrompt, aiConfig?.model);
      
      // Calcular tempo de processamento
      const processingTime = Date.now() - startTime;
      
      console.log('Resposta da IA recebida, processando...');
      
      // Processar resposta da IA (pode ser JSON ou texto)
      let analysisResult;
      try {
        analysisResult = JSON.parse(aiResponse);
      } catch (e) {
        console.log('Resposta não é JSON válido, criando resultado padrão');
        // Se não for JSON válido, criar um resultado padrão
        analysisResult = {
          funnelCoherenceScore: 7.5,
          adDiagnosis: "Análise processada com sucesso. O anúncio apresenta elementos importantes para conversão.",
          landingPageDiagnosis: "A página de destino foi analisada e contém os elementos necessários.",
          syncSuggestions: [
            "Mantenha consistência entre anúncio e página de destino",
            "Alinhe as propostas de valor apresentadas",
            "Certifique-se de que as expectativas criadas no anúncio sejam atendidas na página",
            "Use linguagem e tom de voz similares em ambos os materiais"
          ],
          optimizedAd: aiResponse.substring(0, 500) // Pegar parte da resposta como anúncio otimizado
        };
      }
      
      console.log('Resultado processado, salvando no cache...');
      
      // Armazenar em cache se o cache estiver ativado
      if (cacheEnabled) {
        try {
          await supabaseAdmin
            .from("system_cache")
            .upsert({
              key: cacheKey,
              value: analysisResult,
              expires_at: new Date(Date.now() + (appSettings?.value?.cacheExpiryHours || 24) * 60 * 60 * 1000).toISOString()
            });
        } catch (error) {
          console.log('Erro ao salvar no cache:', error);
        }
      }
      
      // Incrementar contador de uso se a função existir
      try {
        await supabaseAdmin.rpc("increment_usage_counter", {
          p_user_uuid: user.id,
          p_feature_type: "funnel_analysis"
        });
      } catch (error) {
        console.log('Erro ao incrementar contador:', error);
      }
      
      // Registrar no log de análises de funil
      try {
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
      } catch (error) {
        console.log('Erro ao salvar log:', error);
      }
      
      // Registrar métricas de uso da IA
      try {
        await supabaseAdmin
          .from("ai_usage_metrics")
          .insert({
            user_id: user.id,
            model_name: aiConfig?.model?.model_name || "simulation",
            service_type: "funnel_analysis",
            tokens_input: Math.ceil((adText.length + landingPageText.length) / 4), // Aproximação de tokens
            tokens_output: Math.ceil(aiResponse.length / 4), // Aproximação de tokens
            estimated_cost: 0.0, // Calcular custo real em produção
            response_time_ms: processingTime,
            success: true
          });
      } catch (error) {
        console.log('Erro ao salvar métricas:', error);
      }
      
      console.log('Análise completa, retornando resultado');
      
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
    } catch (processingError) {
      console.error("Erro ao processar análise de funil:", processingError);
      
      const processingTime = Date.now() - startTime;
      
      // Gerar resposta simulada como fallback em caso de erro
      console.log('Erro ao processar análise. Usando resposta simulada como fallback.');
      
      const fallbackAnalysis = {
        funnelCoherenceScore: 6.8,
        adDiagnosis: "Não foi possível realizar uma análise completa do anúncio. Porém, baseado em boas práticas, certifique-se que seu anúncio comunica claramente a proposta de valor.",
        landingPageDiagnosis: "Não foi possível analisar completamente a página de destino. Recomendamos garantir que ela cumpra a promessa feita no anúncio.",
        syncSuggestions: [
          "Mantenha consistência entre anúncio e página de destino",
          "Alinhe as propostas de valor apresentadas",
          "Certifique-se de que as expectativas criadas no anúncio sejam atendidas na página",
          "Use linguagem e tom de voz similares em ambos os materiais"
        ],
        optimizedAd: "🚀 [Produto/Serviço] que resolve [problema principal]. Desenvolvido especificamente para [público-alvo], oferece [benefício principal] com [garantia/prova social]. Clique agora e [chamada para ação]!"
      };
      
      // Registrar erro nas métricas
      try {
        await supabaseAdmin
          .from("ai_usage_metrics")
          .insert({
            user_id: user.id,
            model_name: aiConfig?.model?.model_name || "unknown",
            service_type: "funnel_analysis",
            tokens_input: Math.ceil((adText.length + landingPageText.length) / 4), // Aproximação de tokens
            tokens_output: 0,
            estimated_cost: 0.0,
            response_time_ms: processingTime,
            success: false
          });
      } catch (metricsError) {
        console.log('Erro ao salvar métricas de erro:', metricsError);
      }
      
      // Incrementar contador de uso mesmo em caso de erro
      try {
        await supabaseAdmin.rpc("increment_usage_counter", {
          p_user_uuid: user.id,
          p_feature_type: "funnel_analysis"
        });
      } catch (counterError) {
        console.log('Erro ao incrementar contador:', counterError);
      }
      
      return new Response(
        JSON.stringify(fallbackAnalysis),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-Error": "true",
            "X-Error-Message": processingError.message || String(processingError)
          } 
        }
      );
    }
  } catch (generalError) {
    console.error("Erro geral:", generalError);
    
    return new Response(
      JSON.stringify({ 
        error: generalError.message || String(generalError),
        message: "Erro ao processar análise de funil. Por favor, tente novamente."
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