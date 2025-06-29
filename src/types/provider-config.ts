// Tipos para configuração de provedores de IA

export interface ProviderConfiguration {
  api_key: string;
  api_endpoint?: string;
  timeout?: number;
  organization_id?: string;
  [key: string]: any; // Permite propriedades adicionais específicas de cada provedor
}

/**
 * Função para extrair a configuração do provedor da estrutura JSON do banco de dados
 * @param configuration Objeto JSON com a configuração do provedor
 * @returns Configuração tipada do provedor
 */
export function getProviderConfig(configuration: any): ProviderConfiguration {
  if (!configuration) return { api_key: '', timeout: 30 };

  // Se já for um objeto JSON, converter para objeto tipado
  if (typeof configuration === 'object') {
    return {
      api_key: configuration.api_key || '',
      api_endpoint: configuration.api_endpoint || '',
      timeout: configuration.timeout || 30,
      organization_id: configuration.organization_id || '',
      ...configuration  // Preservar outras propriedades específicas do provedor
    };
  }
  
  // Tentar converter de string para objeto
  try {
    const parsed = JSON.parse(configuration);
    return {
      api_key: parsed.api_key || '',
      api_endpoint: parsed.api_endpoint || '',
      timeout: parsed.timeout || 30,
      organization_id: parsed.organization_id || '',
      ...parsed
    };
  } catch (e) {
    // Retornar configuração padrão em caso de erro
    return { api_key: '', timeout: 30 };
  }
}