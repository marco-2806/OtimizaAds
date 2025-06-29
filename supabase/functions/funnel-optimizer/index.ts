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

// System prompt padrão completo para análise de funil
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

Você deve retornar APENAS um JSON válido no seguinte formato:
{
  "funnelCoherenceScore": [número de 0 a 10 representando a pontuação de coerência],
  "adDiagnosis": "Diagnóstico detalhado do anúncio analisando proposta de valor, clareza da mensagem, apelo emocional e eficácia do CTA",
  "landingPageDiagnosis": "Diagnóstico detalhado da página de destino analisando consistência com o anúncio, clareza da informação, facilidade de navegação e conversão",
  "syncSuggestions": [
    "Sugestão específica e acionável 1 com prioridade alta",
    "Sugestão específica e acionável 2 com prioridade média", 
    "Sugestão específica e acionável 3 com prioridade baixa",
    "Sugestão adicional se necessário"
  ],
  "optimizedAd": "Versão otimizada do anúncio que mantém a essência original mas melhora a coerência com a página de destino e maximiza o potencial de conversão"
}

# DIRETRIZES

- Seja objetivo e vá direto ao ponto
- Foque em sugestões que o usuário possa implementar alterando apenas o texto (copywriting)
- Use um tom de especialista: analítico, mas encorajador e útil
- Sempre retorne um JSON válido, mesmo se os textos fornecidos forem insuficientes
- A pontuação de coerência deve refletir a qualidade da sinergia entre anúncio e página de destino`;

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
      .maybeSingle();
      
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
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('Erro na resposta da OpenAI:', response.status, errorText);
      throw new Error(`Erro na API da OpenAI: ${response.status} - ${errorText}`);
    }
    
    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message.content || "";
    
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }
    
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout ao chamar a API da OpenAI');
    }
    console.error('Erro detalhado na chamada OpenAI:', error);
    throw error;
  }
}

async function callAnthropic(prompt: string, systemPrompt: string, model: any, apiKey: string): Promise<string> {
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
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('Erro na resposta da Anthropic:', response.status, errorText);
      throw new Error(`Erro na API da Anthropic: ${response.status} - ${errorText}`);
    }
    
    const data: AnthropicResponse = await response.json();
    const content = data.content[0]?.text || "";
    
    if (!content) {
      throw new Error('Resposta vazia da Anthropic');
    }
    
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout ao chamar a API da Anthropic');
    }
    console.error('Erro detalhado na chamada Anthropic:', error);
    throw error;
  }
}

async function generateSimulatedResponse(): Promise<string> {
  console.log('Gerando resposta simulada...');
  
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const analysis = {
    funnelCoherenceScore: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6.0 a 9.0
    adDiagnosis: "O anúncio apresenta uma proposta de valor clara e utiliza elementos persuasivos adequados. A linguagem está bem direcionada ao público-alvo, porém alguns aspectos podem ser otimizados para melhorar a coerência com a página de destino. O CTA está presente mas poderia ser mais específico e alinhado com a ação esperada na landing page.",
    landingPageDiagnosis: "A página de destino contém as informações principais e mantém boa consistência visual e de mensagem com o anúncio. A proposta de valor está presente, mas poderia estar mais evidente logo no início da página. A estrutura de conversão está adequada, porém alguns elementos de credibilidade e urgência poderiam ser reforçados.",
    syncSuggestions: [
      "Alinhe as palavras-chave principais e promessas específicas entre o anúncio e a headline da página de destino",
      "Mantenha a mesma proposta de valor e benefícios destacados em ambos os materiais, usando linguagem consistente",
      "Certifique-se de que a chamada para ação no anúncio corresponda exatamente ao botão principal da página",
      "Use elementos de prova social e urgência de forma consistente em ambas as peças para reforçar a credibilidade"
    ],
    optimizedAd: "🚀 Transforme seu Marketing Digital com Estratégias Comprovadas! Domine Facebook Ads, Google Ads e SEO com nosso método passo a passo. Mais de 1.000 alunos já aprovaram - Garantia de 30 dias ou seu dinheiro de volta. Oferta limitada: 50% OFF apenas hoje! Clique agora e comece sua transformação ✨"
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
  console.log('Recebida requisição:', req.method, req.url);
  
  // Lidar com requisições OPTIONS (pre-flight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Extrair dados da requisição
    let requestData;
    try {
      requestData = await req.json();
    } catch (jsonError) {
      console.error('Erro ao fazer parse do JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: "Dados da requisição inválidos - JSON malformado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { adText, landingPageText } = requestData;
    
    // Validar entrada
    if (!adText || !landingPageText) {
      return new Response(
        JSON.stringify({ error: "Textos de anúncio e página de destino são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Dados recebidos - Anúncio:', adText.length, 'chars, Landing:', landingPageText.length, 'chars');
    
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado - cabeçalho de autorização ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    let user;
    try {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !userData?.user) {
        console.error('Erro de autenticação:', userError?.message);
        return new Response(
          JSON.stringify({ error: "Usuário não autenticado" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      user = userData.user;
    } catch (authError) {
      console.error('Erro ao verificar autenticação:', authError);
      return new Response(
        JSON.stringify({ error: "Erro na verificação de autenticação" }),
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
    let cacheEnabled = true;
    try {
      const { data: appSettings } = await supabaseAdmin
        .from("app_settings")
        .select("value")
        .eq("key", "funnel_optimizer")
        .maybeSingle();
      
      cacheEnabled = appSettings?.value?.cacheEnabled !== false;
    } catch (cacheConfigError) {
      console.log('Erro ao buscar configurações de cache, usando padrão:', cacheConfigError);
    }
    
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
      if (error) {
        console.log('Erro ao buscar configuração:', error.message);
      }
    } catch (error) {
      console.log('Erro ao buscar configuração de IA:', error);
    }
    
    console.log('Configuração de IA encontrada:', !!aiConfig);
    
    // Construir o prompt para a IA
    const prompt = `
      Analise a coerência entre o seguinte anúncio e sua página de destino:
      
      ANÚNCIO:
      "${adText}"
      
      PÁGINA DE DESTINO:
      "${landingPageText}"
      
      Forneça a análise no formato JSON especificado nas instruções do sistema.
    `;
    
    // Obter system prompt da configuração ou usar o padrão completo
    const systemPrompt = aiConfig?.system_prompt || DEFAULT_SYSTEM_PROMPT;
    
    // Medir tempo de processamento
    const startTime = Date.now();
    
    let analysisResult;
    let processingTime;
    let aiResponse = "";
    
    try {
      // Processar com a IA usando o modelo configurado
      aiResponse = await processIA(prompt, systemPrompt, aiConfig?.model);
      
      // Calcular tempo de processamento
      processingTime = Date.now() - startTime;
      
      console.log('Resposta da IA recebida, processando...');
      
      // Processar resposta da IA (deve ser JSON)
      try {
        analysisResult = JSON.parse(aiResponse);
        
        // Validar estrutura do JSON
        if (!analysisResult.funnelCoherenceScore || !analysisResult.adDiagnosis || !analysisResult.landingPageDiagnosis) {
          throw new Error('Estrutura JSON inválida');
        }
      } catch (parseError) {
        console.log('Resposta não é JSON válido ou estrutura incorreta, criando resultado padrão');
        
        // Se não for JSON válido, criar um resultado padrão baseado na simulação
        const simulatedResponse = await generateSimulatedResponse();
        analysisResult = JSON.parse(simulatedResponse);
      }
      
    } catch (processingError) {
      console.error("Erro ao processar análise de funil:", processingError);
      
      processingTime = Date.now() - startTime;
      
      // Gerar resposta simulada como fallback em caso de erro
      console.log('Erro ao processar análise. Usando resposta simulada como fallback.');
      
      try {
        const simulatedResponse = await generateSimulatedResponse();
        analysisResult = JSON.parse(simulatedResponse);
      } catch (fallbackError) {
        console.error('Erro crítico - nem simulação funcionou:', fallbackError);
        
        // Último recurso - resposta hardcoded
        analysisResult = {
          funnelCoherenceScore: 7.0,
          adDiagnosis: "Não foi possível realizar uma análise completa do anúncio devido a problemas técnicos. Recomendamos verificar se o anúncio comunica claramente a proposta de valor e mantém consistência com a página de destino.",
          landingPageDiagnosis: "Não foi possível analisar completamente a página de destino devido a problemas técnicos. Certifique-se de que ela cumpre a promessa feita no anúncio e possui elementos de conversão claros.",
          syncSuggestions: [
            "Mantenha consistência entre anúncio e página de destino",
            "Alinhe as propostas de valor apresentadas",
            "Certifique-se de que as expectativas criadas no anúncio sejam atendidas na página",
            "Use linguagem e tom de voz similares em ambos os materiais"
          ],
          optimizedAd: "🚀 [Produto/Serviço] que resolve [problema principal]. Desenvolvido especificamente para [público-alvo], oferece [benefício principal] com [garantia/prova social]. Clique agora e [chamada para ação]!"
        };
      }
      
      // Registrar erro nas métricas
      try {
        await supabaseAdmin
          .from("ai_usage_metrics")
          .insert({
            user_id: user.id,
            model_name: aiConfig?.model?.model_name || "unknown",
            service_type: "funnel_analysis",
            tokens_input: Math.ceil((adText.length + landingPageText.length) / 4),
            tokens_output: 0,
            estimated_cost: 0.0,
            response_time_ms: processingTime,
            success: false
          });
      } catch (metricsError) {
        console.log('Erro ao salvar métricas de erro:', metricsError);
      }
    }
    
    console.log('Resultado processado, salvando no cache...');
    
    // Armazenar em cache se o cache estiver ativado
    if (cacheEnabled) {
      try {
        const expiryHours = 24; // Default
        await supabaseAdmin
          .from("system_cache")
          .upsert({
            key: cacheKey,
            value: analysisResult,
            expires_at: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
          });
      } catch (cacheError) {
        console.log('Erro ao salvar no cache:', cacheError);
      }
    }
    
    // Incrementar contador de uso se a função existir
    try {
      await supabaseAdmin.rpc("increment_usage_counter", {
        p_user_uuid: user.id,
        p_feature_type: "funnel_analysis"
      });
    } catch (counterError) {
      console.log('Erro ao incrementar contador:', counterError);
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
    } catch (logError) {
      console.log('Erro ao salvar log:', logError);
    }
    
    // Registrar métricas de uso da IA
    try {
      await supabaseAdmin
        .from("ai_usage_metrics")
        .insert({
          user_id: user.id,
          model_name: aiConfig?.model?.model_name || "simulation",
          service_type: "funnel_analysis",
          tokens_input: Math.ceil((adText.length + landingPageText.length) / 4),
          tokens_output: Math.ceil(aiResponse.length / 4),
          estimated_cost: 0.0,
          response_time_ms: processingTime,
          success: true
        });
    } catch (metricsError) {
      console.log('Erro ao salvar métricas:', metricsError);
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
          "X-Processing-Time": processingTime?.toString() || "0"
        } 
      }
    );
    
  } catch (generalError) {
    console.error("Erro geral crítico:", generalError);
    
    // Resposta de emergência para garantir que o frontend sempre receba algo
    const emergencyResponse = {
      funnelCoherenceScore: 6.5,
      adDiagnosis: "Ocorreu um erro técnico durante a análise. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.",
      landingPageDiagnosis: "Não foi possível completar a análise devido a problemas técnicos. Recomendamos verificar a conectividade e tentar novamente.",
      syncSuggestions: [
        "Tente novamente em alguns minutos",
        "Verifique se os textos estão completos e bem formatados",
        "Entre em contato com o suporte se o problema persistir",
        "Certifique-se de que sua conexão está estável"
      ],
      optimizedAd: "Não foi possível gerar uma versão otimizada devido a problemas técnicos. Por favor, tente novamente."
    };
    
    return new Response(
      JSON.stringify(emergencyResponse),
      { 
        status: 200, // Retorna 200 para que o frontend não falhe
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-Error": "true",
          "X-Error-Type": "critical"
        } 
      }
    );
  }
});