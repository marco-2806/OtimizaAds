import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AlertTriangle, 
  Edit, 
  Plus, 
  Settings, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Trash2,
  Save,
  Lock,
  Layers,
  Brain,
  Key
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Definição de tipos
interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
  price: number;
  currency: string;
  configuration: ServiceConfig;
  access_level: 'free' | 'basic' | 'intermediate' | 'premium' | 'all';
  created_at: string;
  updated_at: string;
}

interface ServiceConfig {
  ai_models?: string[];
  model_configs?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
  request_limit?: number;
  cache_enabled?: boolean;
  cache_ttl?: number;
  [key: string]: any;
}

interface AIModel {
  id: string;
  model_name: string;
  provider_data?: {
    display_name?: string;
  };
  provider?: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
}

const ServiceManager = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("informacoes");
  const queryClient = useQueryClient();

  // Buscar serviços
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "services");

      if (error) throw error;
      return data?.[0]?.value as Service[] || [];
    },
  });

  // Buscar modelos de IA
  const { data: aiModels } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_models")
        .select(`
          id, 
          model_name,
          temperature,
          max_tokens,
          is_active,
          provider_data:provider_id (
            display_name
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Mutação para salvar serviço
  const updateServiceMutation = useMutation({
    mutationFn: async (updatedServices: Service[]) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert(
          { 
            key: "services", 
            value: updatedServices,
            description: "Configurações de serviços da aplicação"
          },
          { onConflict: "key" }
        );

      if (error) throw error;
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'services_updated',
        details: { 
          timestamp: new Date().toISOString(),
          services_count: updatedServices.length
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar serviço: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditService = (service: Service) => {
    setServiceToEdit(JSON.parse(JSON.stringify(service))); // Clone profundo
    setIsEditDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceToEdit) return;
    
    // Se for um novo serviço
    if (!serviceToEdit.id) {
      const newService = {
        ...serviceToEdit,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const updatedServices = [...(services || []), newService];
      updateServiceMutation.mutate(updatedServices);
    } else {
      // Se for atualização
      const updatedServices = (services || []).map(service => 
        service.id === serviceToEdit.id ? { 
          ...serviceToEdit,
          updated_at: new Date().toISOString()
        } : service
      );
      
      updateServiceMutation.mutate(updatedServices);
    }
    
    setIsEditDialogOpen(false);
    setServiceToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (!serviceToDelete) return;
    
    const updatedServices = (services || []).filter(
      service => service.id !== serviceToDelete.id
    );
    
    updateServiceMutation.mutate(updatedServices);
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleAddService = () => {
    const newService: Service = {
      id: '',
      name: '',
      description: '',
      type: 'ai_service',
      is_active: true,
      price: 0,
      currency: 'BRL',
      configuration: {
        ai_models: ['gpt-4o'],
        model_configs: {
          temperature: undefined,
          max_tokens: undefined,
          top_p: undefined,
          frequency_penalty: undefined,
          presence_penalty: undefined
        },
        request_limit: 100,
        cache_enabled: true
      },
      access_level: 'premium',
      created_at: '',
      updated_at: ''
    };
    
    setServiceToEdit(newService);
    setIsEditDialogOpen(true);
  };

  // Renderizar um badge com base no status de acesso
  const renderAccessLevelBadge = (level: string) => {
    const variants: Record<string, string> = {
      'free': 'bg-gray-200 text-gray-800',
      'basic': 'bg-blue-100 text-blue-800',
      'intermediate': 'bg-purple-100 text-purple-800',
      'premium': 'bg-green-100 text-green-800',
      'all': 'bg-yellow-100 text-yellow-800',
    };
    
    const labels: Record<string, string> = {
      'free': 'Gratuito',
      'basic': 'Básico',
      'intermediate': 'Intermediário',
      'premium': 'Premium',
      'all': 'Todos',
    };
    
    return (
      <Badge className={variants[level] || ''}>
        {labels[level] || level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Serviços Disponíveis</CardTitle>
            <CardDescription>
              Gerencie todos os serviços disponíveis na plataforma
            </CardDescription>
          </div>
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingServices ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando serviços...</p>
            </div>
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      {service.type === 'ai_service' ? 'Serviço de IA' : service.type}
                    </TableCell>
                    <TableCell>
                      {renderAccessLevelBadge(service.access_level)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {service.price > 0 
                        ? new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: service.currency 
                          }).format(service.price / 100)
                        : "Incluso no plano"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Nenhum serviço encontrado</h3>
              <p>Clique no botão "Novo Serviço" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      {serviceToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {serviceToEdit.id ? `Editar Serviço: ${serviceToEdit.name}` : "Criar Serviço"}
              </DialogTitle>
              <DialogDescription>
                {serviceToEdit.id ? "Edite as configurações do serviço existente." : "Configure as informações do novo serviço."}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
                <TabsTrigger value="modelos">Configurações de IA</TabsTrigger>
                <TabsTrigger value="cache">Cache e Performance</TabsTrigger>
              </TabsList>
              
              {/* Aba de Informações Básicas */}
              <TabsContent value="informacoes" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Serviço</Label>
                    <Input
                      id="name"
                      value={serviceToEdit.name}
                      onChange={(e) => setServiceToEdit({...serviceToEdit, name: e.target.value})}
                      placeholder="Ex: Análise de Concorrentes"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={serviceToEdit.type} 
                      onValueChange={(value) => setServiceToEdit({...serviceToEdit, type: value})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_service">Serviço de IA</SelectItem>
                        <SelectItem value="analytics">Análise de Dados</SelectItem>
                        <SelectItem value="integration">Integração Externa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={serviceToEdit.description}
                    onChange={(e) => setServiceToEdit({...serviceToEdit, description: e.target.value})}
                    placeholder="Descreva a função e benefícios deste serviço"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="access_level">Nível de Acesso</Label>
                    <Select 
                      value={serviceToEdit.access_level} 
                      onValueChange={(value) => setServiceToEdit({
                        ...serviceToEdit, 
                        access_level: value as Service["access_level"]
                      })}
                    >
                      <SelectTrigger id="access_level">
                        <SelectValue placeholder="Selecione o nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Gratuito</SelectItem>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="all">Todos os Planos</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Define em quais planos este serviço estará disponível
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Preço (em centavos)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={serviceToEdit.price}
                      onChange={(e) => setServiceToEdit({...serviceToEdit, price: parseInt(e.target.value)})}
                      placeholder="0 = Incluído no plano"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = Incluído no plano, outros valores = Custo adicional
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={serviceToEdit.is_active}
                    onCheckedChange={(checked) => setServiceToEdit({...serviceToEdit, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Serviço Ativo</Label>
                </div>
              </TabsContent>

              {/* Aba de Configurações de IA */}
              <TabsContent value="modelos" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Modelos de IA Disponíveis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecione os modelos que estarão disponíveis para este serviço. As configurações como temperatura e tokens máximos
                    serão utilizadas dos modelos já configurados no sistema.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {aiModels?.filter(model => model.is_active).map((model) => (
                      <div key={model.id} className="flex items-center p-3 rounded-md border">
                        <Switch
                          checked={(serviceToEdit.configuration.ai_models || []).includes(model.model_name)}
                          onCheckedChange={(checked) => {
                            const currentModels = serviceToEdit.configuration.ai_models || [];
                            const updatedModels = checked
                              ? [...currentModels, model.model_name]
                              : currentModels.filter(m => m !== model.model_name);
                            
                            setServiceToEdit({
                              ...serviceToEdit,
                              configuration: {
                                ...serviceToEdit.configuration,
                                ai_models: updatedModels
                              }
                            });
                          }}
                        />
                        <span className="ml-2">{model.model_name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="request_limit">Limite por Requisição</Label>
                    <Input
                      id="request_limit"
                      type="number"
                      min="1"
                      value={serviceToEdit.configuration.request_limit || 100}
                      onChange={(e) => setServiceToEdit({
                        ...serviceToEdit,
                        configuration: {
                          ...serviceToEdit.configuration,
                          request_limit: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número máximo de requisições por período (dia/mês)
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Aba de Cache e Performance */}
              <TabsContent value="cache" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Configurações de Cache</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cache_enabled"
                      checked={serviceToEdit.configuration.cache_enabled || false}
                      onCheckedChange={(checked) => setServiceToEdit({
                        ...serviceToEdit,
                        configuration: {
                          ...serviceToEdit.configuration,
                          cache_enabled: checked
                        }
                      })}
                    />
                    <Label htmlFor="cache_enabled">Habilitar Cache</Label>
                  </div>
                  
                  {serviceToEdit.configuration.cache_enabled && (
                    <div className="mt-4">
                      <Label htmlFor="cache_ttl">Tempo de Expiração do Cache (segundos)</Label>
                      <Input
                        id="cache_ttl"
                        type="number"
                        min="60"
                        value={serviceToEdit.configuration.cache_ttl || 86400}
                        onChange={(e) => setServiceToEdit({
                          ...serviceToEdit,
                          configuration: {
                            ...serviceToEdit.configuration,
                            cache_ttl: parseInt(e.target.value)
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        86400 = 24 horas, 3600 = 1 hora, 604800 = 1 semana
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Serviço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-sm text-red-800">
              Excluir um serviço pode afetar funcionalidades existentes e usuários que dependem dele.
              Considere desativar o serviço em vez de excluí-lo permanentemente.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManager;