import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ServiceManager from "@/components/admin/service-config/ServiceManager";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { FunnelOptimizerSettings } from "@/components/admin/ai-config/FunnelOptimizerSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratorSettings } from "@/components/admin/service-config/GeneratorSettings";
import { DiagnosisSettings } from "@/components/admin/service-config/DiagnosisSettings";

const AdminServiceConfig = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("services");

  // Função para publicar todas as alterações
  const publishChanges = async () => {
    setIsPublishing(true);
    
    try {
      // Aqui seria implementada a lógica para publicar todas as alterações
      // Simulando uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Alterações publicadas",
        description: "Todas as configurações de serviços foram publicadas com sucesso.",
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao publicar alterações:', error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar as alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuração de Serviços</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os serviços disponíveis na plataforma e suas configurações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={isPublishing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPublishing ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
          
          {hasUnsavedChanges && (
            <Button 
              onClick={publishChanges}
              disabled={isPublishing}
            >
              <Save className="h-4 w-4 mr-2" />
              {isPublishing ? 'Publicando...' : 'Publicar Alterações'}
            </Button>
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alterações não publicadas</AlertTitle>
          <AlertDescription>
            Você tem alterações de configuração que ainda não foram publicadas. 
            Clique em "Publicar Alterações" para aplicá-las.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="gerador">Gerador de Anúncios</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico de Anúncios</TabsTrigger>
          <TabsTrigger value="funil">Otimização de Funil</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServiceManager />
        </TabsContent>

        <TabsContent value="gerador">
          <GeneratorSettings />
        </TabsContent>

        <TabsContent value="diagnostico">
          <DiagnosisSettings />
        </TabsContent>

        <TabsContent value="funil">
          <FunnelOptimizerSettings />
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Documentação de Configuração</CardTitle>
          <CardDescription>
            Informações sobre como os serviços são configurados e suas restrições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Níveis de Acesso</h3>
            <p className="text-sm text-gray-600">
              Os serviços podem ter diferentes níveis de acesso dependendo do plano do usuário.
              Configure corretamente para garantir que apenas usuários autorizados tenham acesso.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Integrações com Modelos de IA</h3>
            <p className="text-sm text-gray-600">
              Para serviços que utilizam IA (como geração de anúncios e análise de funil), 
              certifique-se de selecionar os modelos de IA adequados que foram configurados
              na seção de Modelos de IA. As configurações dos modelos como temperatura e tokens
              máximos serão utilizadas automaticamente.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Cache e Performance</h3>
            <p className="text-sm text-gray-600">
              Para serviços intensivos em processamento, considere ativar o cache 
              para melhorar a performance e reduzir custos. O tempo de expiração do
              cache deve ser configurado de acordo com a frequência de mudança dos dados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminServiceConfig;