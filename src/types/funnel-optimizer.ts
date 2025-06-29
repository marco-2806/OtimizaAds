/**
 * Interface para configuração do otimizador de funil
 */
export interface FunnelOptimizerConfig {
  enabled: boolean;
  maxTokens: number;
  temperature: number;
  cacheEnabled: boolean;
  cacheExpiryHours: number;
  defaultModel: string;
  promptTemplate?: string;
}

/**
 * Interface para resultado da análise de funil
 */
export interface FunnelAnalysisResult {
  funnelCoherenceScore: number;
  adDiagnosis: string;
  landingPageDiagnosis: string;
  syncSuggestions: string[];
  optimizedAd: string;
  coherenceFactors?: CoherenceFactors;
}

/**
 * Interface para fatores de coerência da análise de funil
 */
interface CoherenceFactors {
  messageMatch: number;
  visualConsistency: number;
  valuePropositionAlignment: number;
  targetAudienceConsistency: number;
  ctaAlignment: number;
}

/**
 * Interface para o log de análise de funil
 */
interface FunnelAnalysisLog {
  id: string;
  user_id: string;
  ad_text: string;
  landing_page_text: string;
  coherence_score: number;
  suggestions: string[];
  optimized_ad: string;
  processing_time_ms: number;
  created_at: string;
}

/**
 * Interface para dados de analytics de funil
 */
interface FunnelAnalyticsData {
  logs: FunnelAnalysisLog[];
  totalAnalyses: number;
  avgCoherenceScore: number;
  avgProcessingTime: number;
  scoreDistribution: {name: string, count: number}[];
  usageByDay: {date: string, analyses: number}[];
  cacheHitRate: number;
}

/**
 * Interface para entrada da análise de funil
 */
interface FunnelAnalysisInput {
  adText: string;
  landingPageText: string;
  userId: string;
}