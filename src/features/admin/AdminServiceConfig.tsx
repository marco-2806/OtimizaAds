import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ServiceManager from "@/components/admin/service-config/ServiceManager";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const AdminServiceConfig = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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

      <ServiceManager />
      
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
              Configire corretamente para garantir que apenas usuários autorizados tenham acesso.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Integrações com APIs</h3>
            <p className="text-sm text-gray-600">
              Para serviços que utilizam APIs externas (como OpenAI, Anthropic, etc.), 
              certifique-se de que as chaves de API estão configuradas corretamente.
              As chaves são armazenadas de forma segura e não são expostas aos usuários.
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