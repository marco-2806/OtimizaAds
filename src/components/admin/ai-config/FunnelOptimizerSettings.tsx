import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FunnelOptimizerConfig } from "@/types/funnel-optimizer";
import { useQuery } from "@tanstack/react-query";

export const FunnelOptimizerSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  // Buscar modelos de IA disponíveis
  const { data: aiModels } = useQuery({
    queryKey: ["ai-models-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_models")
        .select(`
          id, 
          model_name,
          provider_data:provider_id (
            display_name
          )
        `)
        .eq("is_active", true)
        .order("model_name");

      if (error) throw error;
      return data || [];
    },
  });
  
  // Configurações do Laboratório de Otimização de Funil
  const [funnelConfig, setFunnelConfig] = useState<FunnelOptimizerConfig>({
    enabled: true,
    maxTokens: 2048,
    temperature: 0.7,
    cacheEnabled: true,
    cacheExpiryHours: 24,
    defaultModel: "gpt-4o"
  });

  useEffect(() => {
    fetchSettings();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // A função fetchSettings é definida no componente e não muda entre renderizações

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações de app_settings
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('key', 'funnel_optimizer');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setFunnelConfig(data[0].value as FunnelOptimizerConfig);
      }
      
      toast({
        title: "Configurações carregadas",
        description: "As configurações do otimizador de funil foram carregadas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Preparar atualizações
      const updates = {
        key: 'funnel_optimizer',
        value: funnelConfig,
        description: 'Configurações do Laboratório de Otimização de Funil'
      };
      
      // Salvar configurações
      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, {
          onConflict: 'key'
        });
          
      if (error) throw error;
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'funnel_optimizer_settings_updated',
        details: { 
          timestamp: new Date().toISOString(),
          enabled: funnelConfig.enabled,
          maxTokens: funnelConfig.maxTokens,
          temperature: funnelConfig.temperature
        }
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do otimizador de funil foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configurações do Laboratório de Otimização de Funil
          </CardTitle>
          <CardDescription>
            Configure o comportamento do analisador de funil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="funnel_enabled">Recurso Ativo</Label>
              <p className="text-sm text-gray-500">
                Habilita ou desabilita o Laboratório de Otimização de Funil
              </p>
            </div>
            <Switch
              id="funnel_enabled"
              checked={funnelConfig.enabled}
              onCheckedChange={(checked) => setFunnelConfig({...funnelConfig, enabled: checked})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="funnel_max_tokens">Tokens Máximos</Label>
              <Input
                id="funnel_max_tokens"
                type="number"
                min="512"
                max="8192"
                value={funnelConfig.maxTokens}
                onChange={(e) => setFunnelConfig({...funnelConfig, maxTokens: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="funnel_temperature">Temperatura</Label>
              <Input
                id="funnel_temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={funnelConfig.temperature}
                onChange={(e) => setFunnelConfig({...funnelConfig, temperature: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="funnel_default_model">Modelo Padrão</Label>
            <Select 
              value={funnelConfig.defaultModel || ""} 
              onValueChange={(value) => setFunnelConfig({...funnelConfig, defaultModel: value})}
            >
              <SelectTrigger id="funnel_default_model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels?.length ? (
                  aiModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.model_name} {model.provider_data?.display_name ? `(${model.provider_data.display_name})` : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-models" disabled>Nenhum modelo disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Modelo de IA que será utilizado para analisar a coerência entre anúncios e páginas de destino
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="funnel_cache_enabled">Cache Ativo</Label>
              <p className="text-sm text-gray-500">
                Habilita cache para análises de funil
              </p>
            </div>
            <Switch
              id="funnel_cache_enabled"
              checked={funnelConfig.cacheEnabled}
              onCheckedChange={(checked) => setFunnelConfig({...funnelConfig, cacheEnabled: checked})}
            />
          </div>
          
          <div>
            <Label htmlFor="funnel_cache_expiry_hours">Tempo de Expiração do Cache (horas)</Label>
            <Input
              id="funnel_cache_expiry_hours"
              type="number"
              min="1"
              max="168"
              value={funnelConfig.cacheExpiryHours}
              onChange={(e) => setFunnelConfig({...funnelConfig, cacheExpiryHours: parseInt(e.target.value)})}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};