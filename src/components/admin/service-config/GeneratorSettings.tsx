import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Brain, Zap } from "lucide-react";

export const GeneratorSettings = () => {
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
  
  // Configurações do Gerador de Anúncios
  const [generatorConfig, setGeneratorConfig] = useState({
    enabled: true,
    maxTokens: 2048,
    temperature: 0.7,
    cacheEnabled: true,
    cacheExpiryHours: 24,
    defaultModel: "",
    promptTemplate: "Gere 5 anúncios persuasivos para o seguinte produto:\n\nNome do produto: {{productName}}\nDescrição: {{productDescription}}\nPúblico-alvo: {{targetAudience}}\n\nOs anúncios devem ser curtos, persuasivos e incluir emojis estratégicos.\nCada anúncio deve ter um gancho forte, benefícios claros e uma chamada para ação."
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
        .eq('key', 'ad_generator');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setGeneratorConfig(data[0].value as typeof generatorConfig);
      }
      
      toast({
        title: "Configurações carregadas",
        description: "As configurações do gerador de anúncios foram carregadas com sucesso."
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
        key: 'ad_generator',
        value: generatorConfig,
        description: 'Configurações do Gerador de Anúncios'
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
        action: 'ad_generator_settings_updated',
        details: { 
          timestamp: new Date().toISOString(),
          enabled: generatorConfig.enabled,
          maxTokens: generatorConfig.maxTokens,
          temperature: generatorConfig.temperature
        }
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do gerador de anúncios foram salvas com sucesso."
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
            <Zap className="h-5 w-5 text-blue-600" />
            Configurações do Gerador de Anúncios
          </CardTitle>
          <CardDescription>
            Configure como o gerador de anúncios funciona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="generator_enabled">Recurso Ativo</Label>
              <p className="text-sm text-gray-500">
                Habilita ou desabilita o Gerador de Anúncios
              </p>
            </div>
            <Switch
              id="generator_enabled"
              checked={generatorConfig.enabled}
              onCheckedChange={(checked) => setGeneratorConfig({...generatorConfig, enabled: checked})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="generator_max_tokens">Tokens Máximos</Label>
              <Input
                id="generator_max_tokens"
                type="number"
                min="512"
                max="8192"
                value={generatorConfig.maxTokens}
                onChange={(e) => setGeneratorConfig({...generatorConfig, maxTokens: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="generator_temperature">Temperatura</Label>
              <Input
                id="generator_temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={generatorConfig.temperature}
                onChange={(e) => setGeneratorConfig({...generatorConfig, temperature: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="generator_default_model">Modelo Padrão</Label>
            <Select 
              value={generatorConfig.defaultModel || ""} 
              onValueChange={(value) => setGeneratorConfig({...generatorConfig, defaultModel: value})}
            >
              <SelectTrigger id="generator_default_model">
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
              Modelo de IA que será utilizado para gerar anúncios
            </p>
          </div>
          
          <div>
            <Label htmlFor="prompt_template">Template de Prompt</Label>
            <Textarea
              id="prompt_template"
              value={generatorConfig.promptTemplate}
              onChange={(e) => setGeneratorConfig({...generatorConfig, promptTemplate: e.target.value})}
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-2">
              Use {{productName}}, {{productDescription}} e {{targetAudience}} como variáveis que serão substituídas
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="generator_cache_enabled">Cache Ativo</Label>
              <p className="text-sm text-gray-500">
                Habilita cache para gerações de anúncios
              </p>
            </div>
            <Switch
              id="generator_cache_enabled"
              checked={generatorConfig.cacheEnabled}
              onCheckedChange={(checked) => setGeneratorConfig({...generatorConfig, cacheEnabled: checked})}
            />
          </div>
          
          <div>
            <Label htmlFor="generator_cache_expiry_hours">Tempo de Expiração do Cache (horas)</Label>
            <Input
              id="generator_cache_expiry_hours"
              type="number"
              min="1"
              max="168"
              value={generatorConfig.cacheExpiryHours}
              onChange={(e) => setGeneratorConfig({...generatorConfig, cacheExpiryHours: parseInt(e.target.value)})}
              disabled={!generatorConfig.cacheEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSettings}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneratorSettings;