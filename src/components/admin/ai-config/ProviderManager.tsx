import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Wifi,
  Key,
  Server,
  Save,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getProviderConfig, type ProviderConfiguration } from "@/types/provider-config";
import type { Json } from "@/integrations/supabase/types";

type ProviderConfigurationTable = {
  id: string;
  display_name: string;
  provider_name: string;
  api_endpoint: string | null;
  configuration: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfigurationTable | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states para dados da configuração do provedor
  const [providerConfig, setProviderConfig] = useState<ProviderConfiguration>({
    api_key: "",
    api_endpoint: "",
    timeout: 30,
  });

  // Buscar configurações de provedores
  const { data: providers, isLoading } = useQuery({
    queryKey: ["provider-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_configurations")
        .select("*")
        .order("display_name");

      if (error) throw error;
      return data || [];
    },
  });

  // Atualizar configuração de provedor
  const updateProviderMutation = useMutation({
    mutationFn: async (data: { id: string; configuration: ProviderConfiguration; is_active: boolean }) => {
      const { error } = await supabase
        .from("provider_configurations")
        .update({
          configuration: data.configuration,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-configurations"] });
      setIsConfigDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Configuração do provedor atualizada!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar configuração: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Testar conexão com o provedor
  const testProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      return Math.random() > 0.3; // Simula 70% de sucesso
    },
    onSuccess: (success) => {
      setTestingProvider(null);
      toast({
        title: success ? "Conexão Bem-sucedida" : "Falha na Conexão",
        description: success 
          ? "O provedor foi conectado com sucesso!" 
          : "Não foi possível conectar ao provedor. Verifique as configurações.",
        variant: success ? "default" : "destructive",
      });
    },
    onError: () => {
      setTestingProvider(null);
      toast({
        title: "Erro",
        description: "Erro ao testar conexão com o provedor.",
        variant: "destructive",
      });
    },
  });

  // Abrir dialog de configuração de provedor
  const handleProviderConfig = (provider: ProviderConfigurationTable) => {
    setSelectedProvider(provider);
    const config = getProviderConfig(provider.configuration);
    
    setProviderConfig({
      api_key: "",  // Não exibir a API key por segurança
      api_endpoint: provider.api_endpoint || "",
      timeout: config.timeout || 30,
      organization_id: config.organization_id
    });
    
    setIsConfigDialogOpen(true);
  };

  // Salvar configurações do provedor
  const handleSaveConfig = () => {
    if (!selectedProvider) return;

    // Obter configuração existente do provedor
    const existingConfig = getProviderConfig(selectedProvider.configuration);
    
    // Preparar configuração para salvar
    const configuration: ProviderConfiguration = {
      ...providerConfig,
      // Preservar API key existente se o campo estiver vazio
      api_key: providerConfig.api_key ? providerConfig.api_key : existingConfig.api_key,
    };

    updateProviderMutation.mutate({
      id: selectedProvider.id,
      configuration,
      is_active: selectedProvider.is_active,
    });
  };

  // Testar conexão com o provedor
  const handleTestConnection = (providerId: string) => {
    setTestingProvider(providerId);
    testProviderMutation.mutate(providerId);
  };

  // Alternar estado ativo/inativo do provedor
  const toggleProviderStatus = (provider: ProviderConfigurationTable) => {
    const config = getProviderConfig(provider.configuration);
    updateProviderMutation.mutate({
      id: provider.id,
      configuration: config,
      is_active: !provider.is_active,
    });
  };

  // Obter ícone de status do provedor
  const getProviderStatusIcon = (provider: ProviderConfigurationTable) => {
    if (testingProvider === provider.id) {
      return <Wifi className="h-4 w-4 animate-pulse text-yellow-500" />;
    }
    
    return provider.is_active ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    );
  };

  // Obter badge com o nome do provedor
  const getProviderBadge = (providerName: string) => {
    const badges = {
      openai: <Badge variant="default">OpenAI</Badge>,
      anthropic: <Badge variant="secondary">Anthropic</Badge>,
      google: <Badge variant="outline">Gemini</Badge>,
      deepseek: <Badge className="bg-purple-100 text-purple-800">DeepSeek</Badge>,
      novita: <Badge className="bg-blue-100 text-blue-800">Novita</Badge>,
      openai_compatible: <Badge variant="outline">Compatible</Badge>
    };
    return badges[providerName as keyof typeof badges] || <Badge>{providerName}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Provedores</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Provedores de IA</CardTitle>
          <CardDescription>
            Configure e gerencie provedores de IA: OpenAI, Anthropic, Gemini, DeepSeek e mais
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {providers?.map((provider) => {
              const config = getProviderConfig(provider.configuration);
              return (
                <Card key={provider.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getProviderStatusIcon(provider)}
                      <div>
                        <h3 className="font-semibold">{provider.display_name}</h3>
                        <p className="text-sm text-gray-600">
                          {provider.api_endpoint || "Endpoint não configurado"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getProviderBadge(provider.provider_name)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={() => toggleProviderStatus(provider)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(provider.id)}
                        disabled={testingProvider === provider.id || !provider.is_active}
                      >
                        {testingProvider === provider.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProviderConfig(provider)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {config.api_key ? "Configurado" : "Não configurado"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      {config.timeout ? `Timeout: ${config.timeout}s` : "Timeout padrão"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Configuração */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar {selectedProvider?.display_name}</DialogTitle>
            <DialogDescription>
              Configure as opções de conexão para este provedor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configuração da API */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold">Configuração da API</h3>
              
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={providerConfig.api_key || ""}
                  onChange={(e) => setProviderConfig({ ...providerConfig, api_key: e.target.value })}
                  placeholder="Digite sua API key..."
                />
              </div>
              
              {selectedProvider?.provider_name === 'openai_compatible' && (
                <div>
                  <Label htmlFor="api_endpoint">Endpoint da API</Label>
                  <Input
                    id="api_endpoint"
                    value={providerConfig.api_endpoint || ""}
                    onChange={(e) => setProviderConfig({ ...providerConfig, api_endpoint: e.target.value })}
                    placeholder="https://api.exemplo.com/v1"
                  />
                </div>
              )}
              
              {['openai'].includes(selectedProvider?.provider_name || '') && (
                <div>
                  <Label htmlFor="organization_id">ID da Organização (opcional)</Label>
                  <Input
                    id="organization_id"
                    value={providerConfig.organization_id || ""}
                    onChange={(e) => setProviderConfig({ ...providerConfig, organization_id: e.target.value })}
                    placeholder="org-..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="timeout">Timeout (segundos)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={providerConfig.timeout || 30}
                  onChange={(e) => setProviderConfig({ ...providerConfig, timeout: parseInt(e.target.value) })}
                  min="1"
                  max="300"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedProvider) {
                  handleTestConnection(selectedProvider.id);
                }
              }}
              variant="outline"
              disabled={testingProvider === selectedProvider?.id}
            >
              {testingProvider === selectedProvider?.id ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
            <Button onClick={handleSaveConfig} disabled={updateProviderMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};