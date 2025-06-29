import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash2,
  Clock,
  AlertTriangle,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Save,
  Undo,
  CheckCircle,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  price: number;
  settings: any; // Configurações específicas do serviço
  created_at: string;
  updated_at: string;
}

interface AccessLevel {
  id: string;
  name: string;
  permission: "none" | "read" | "write" | "admin";
}

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  api_key?: string;
  settings?: any;
}

interface ServiceLogEntry {
  id: string;
  service_id: string;
  action: string;
  user_id: string;
  changes: any;
  timestamp: string;
  user?: {
    email: string;
    full_name: string;
  };
}

const ServiceManager = () => {
  // Estados para gerenciamento de serviços
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para o formulário de edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    is_active: true,
    price: 0,
    settings: {},
  });
  const [activeTab, setActiveTab] = useState("basic");
  
  // Estados para confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  // Estado para visualização de logs
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [serviceLogs, setServiceLogs] = useState<ServiceLogEntry[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Estado para preview de alterações
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<any>(null);
  
  // Estados para integrações e níveis de acesso
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  
  // Estado para backup de configurações
  const [previousConfigs, setPreviousConfigs] = useState<any>({});
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
  // Estado para gerenciamento de expansão de linhas
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();

  // Simular carregamento de serviços
  useEffect(() => {
    fetchServices();
  }, []);

  // Filtrar serviços quando os filtros mudarem
  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter, sortBy]);

  const fetchServices = async () => {
    setIsLoading(true);
    
    try {
      // Em um ambiente real, isso seria uma chamada ao Supabase
      // Simulando dados para demonstração
      const mockServices = [
        {
          id: "1",
          name: "Gerador de Anúncios",
          description: "Cria anúncios persuasivos usando IA",
          is_active: true,
          price: 0.05,
          settings: {
            limit_per_request: 5,
            models: ["gpt-4o", "claude-3-haiku"],
            max_tokens: 2048,
            temperature: 0.7,
            allowed_plans: ["basic", "intermediate", "premium"]
          },
          created_at: "2023-01-15T12:00:00Z",
          updated_at: "2023-06-20T14:30:00Z"
        },
        {
          id: "2",
          name: "Diagnóstico de Anúncios",
          description: "Analisa anúncios e fornece sugestões de melhorias",
          is_active: true,
          price: 0.08,
          settings: {
            models: ["gpt-4o"],
            max_tokens: 4096,
            temperature: 0.5,
            allowed_plans: ["intermediate", "premium"]
          },
          created_at: "2023-02-10T10:15:00Z",
          updated_at: "2023-07-05T09:45:00Z"
        },
        {
          id: "3",
          name: "Otimizador de Funil",
          description: "Analisa a coerência entre anúncios e páginas de destino",
          is_active: true,
          price: 0.12,
          settings: {
            cache_enabled: true,
            cache_expiry_hours: 24,
            models: ["gpt-4o", "claude-3-sonnet"],
            max_tokens: 8192,
            temperature: 0.6,
            allowed_plans: ["premium"]
          },
          created_at: "2023-03-22T16:30:00Z",
          updated_at: "2023-08-12T11:20:00Z"
        },
        {
          id: "4",
          name: "Análise de Concorrentes",
          description: "Analisa anúncios de concorrentes e fornece insights",
          is_active: false,
          price: 0.15,
          settings: {
            models: ["gpt-4o"],
            max_tokens: 6144,
            temperature: 0.4,
            allowed_plans: ["premium"]
          },
          created_at: "2023-04-05T14:45:00Z",
          updated_at: "2023-09-01T17:10:00Z"
        }
      ];
      
      setServices(mockServices);

      // Simular níveis de acesso
      const mockAccessLevels = [
        { id: "1", name: "Visitantes", permission: "none" as const },
        { id: "2", name: "Usuários Gratuitos", permission: "read" as const },
        { id: "3", name: "Assinantes Básicos", permission: "read" as const },
        { id: "4", name: "Assinantes Intermediários", permission: "read" as const },
        { id: "5", name: "Assinantes Premium", permission: "write" as const },
        { id: "6", name: "Administradores", permission: "admin" as const }
      ];
      
      setAccessLevels(mockAccessLevels);

      // Simular integrações
      const mockIntegrations = [
        { id: "1", name: "OpenAI API", enabled: true, api_key: "sk_...7890", settings: { organization_id: "org-123" } },
        { id: "2", name: "Anthropic API", enabled: true, api_key: "sk_...4567", settings: {} },
        { id: "3", name: "Google AI API", enabled: false, settings: {} },
        { id: "4", name: "Facebook Ads API", enabled: false, settings: {} }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];
    
    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(service => 
        statusFilter === "active" ? service.is_active : !service.is_active
      );
    }
    
    // Ordenação
    if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "updated-desc") {
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    
    setFilteredServices(filtered);
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      is_active: true,
      price: 0,
      settings: {
        models: [],
        max_tokens: 2048,
        temperature: 0.7,
        allowed_plans: []
      }
    });
    setActiveTab("basic");
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      ...service
    });
    setActiveTab("basic");
    setIsDialogOpen(true);
    
    // Salvar configuração anterior para possível restauração
    setPreviousConfigs(prev => ({
      ...prev,
      [service.id]: { ...service }
    }));
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      // Em um ambiente real, isso seria uma chamada ao Supabase
      setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
      
      toast({
        title: "Serviço excluído",
        description: `O serviço "${serviceToDelete.name}" foi excluído com sucesso.`,
        variant: "default",
      });
      
      // Adicionar ao log
      await logServiceChange(serviceToDelete.id, "delete", {
        deleted: true,
        service_name: serviceToDelete.name
      });
      
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const toggleServiceStatus = async (serviceId: string, newStatus: boolean) => {
    try {
      // Em um ambiente real, isso seria uma chamada ao Supabase
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: newStatus, updated_at: new Date().toISOString() } 
            : service
        )
      );
      
      const service = services.find(s => s.id === serviceId);
      
      toast({
        title: newStatus ? "Serviço ativado" : "Serviço desativado",
        description: `O serviço "${service?.name}" foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        variant: "default",
      });
      
      // Adicionar ao log
      await logServiceChange(serviceId, "update_status", {
        previous_status: !newStatus,
        new_status: newStatus
      });
      
    } catch (error) {
      console.error('Erro ao atualizar status do serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do serviço.",
        variant: "destructive",
      });
    }
  };

  const handleViewLogs = async (service: Service) => {
    setSelectedService(service);
    
    try {
      setIsLoading(true);
      
      // Em um ambiente real, isso seria uma chamada ao Supabase
      // Simulando dados de logs
      const mockLogs: ServiceLogEntry[] = [
        {
          id: "1",
          service_id: service.id,
          action: "update",
          user_id: "admin-123",
          changes: {
            price: { from: 0.04, to: 0.05 },
            settings: { max_tokens: { from: 1024, to: 2048 } }
          },
          timestamp: "2023-10-15T15:42:00Z",
          user: {
            email: "admin@otimizaads.com",
            full_name: "Administrador"
          }
        },
        {
          id: "2",
          service_id: service.id,
          action: "update_status",
          user_id: "admin-123",
          changes: {
            is_active: { from: false, to: true }
          },
          timestamp: "2023-09-22T10:15:00Z",
          user: {
            email: "admin@otimizaads.com",
            full_name: "Administrador"
          }
        },
        {
          id: "3",
          service_id: service.id,
          action: "update_integration",
          user_id: "admin-456",
          changes: {
            integration: "OpenAI API",
            enabled: { from: false, to: true }
          },
          timestamp: "2023-08-30T14:20:00Z",
          user: {
            email: "gerente@otimizaads.com",
            full_name: "Gerente"
          }
        }
      ];
      
      setServiceLogs(mockLogs);
      setIsLogDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logServiceChange = async (serviceId: string, action: string, changes: any) => {
    // Em um ambiente real, isso seria uma chamada ao Supabase
    // para registrar a mudança na tabela de logs
    console.log('Log de alteração:', {
      service_id: serviceId,
      action,
      changes,
      user_id: 'admin-123', // Em um ambiente real, isso seria o ID do usuário logado
      timestamp: new Date().toISOString()
    });
    
    // Aqui seria implementado o código para salvar o log no banco de dados
  };

  const handleSaveService = async () => {
    if (!formData.name || formData.price === undefined) {
      toast({
        title: "Erro de validação",
        description: "Nome e preço são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Preview das alterações antes de salvar
    if (editingService) {
      const changes = getChanges(editingService, formData);
      if (Object.keys(changes).length > 0) {
        setPreviewChanges(changes);
        setIsPreviewDialogOpen(true);
        return;
      }
    }
    
    // Se não há alterações ou é um novo serviço, salvar direto
    await saveServiceChanges();
  };

  const saveServiceChanges = async () => {
    try {
      if (editingService) {
        // Atualizar serviço existente
        const changes = getChanges(editingService, formData);
        
        setServices(prev => 
          prev.map(service => 
            service.id === editingService.id 
              ? { 
                  ...service, 
                  ...formData, 
                  updated_at: new Date().toISOString() 
                } as Service
              : service
          )
        );
        
        // Adicionar ao log
        await logServiceChange(editingService.id, "update", changes);
        
        toast({
          title: "Serviço atualizado",
          description: `O serviço "${formData.name}" foi atualizado com sucesso.`,
          variant: "default",
        });
      } else {
        // Criar novo serviço
        const newService: Service = {
          id: `${Date.now()}`, // Em um ambiente real, seria gerado pelo banco
          name: formData.name || "",
          description: formData.description || "",
          is_active: formData.is_active !== undefined ? formData.is_active : true,
          price: formData.price || 0,
          settings: formData.settings || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setServices(prev => [...prev, newService]);
        
        // Adicionar ao log
        await logServiceChange(newService.id, "create", {
          service: newService
        });
        
        toast({
          title: "Serviço criado",
          description: `O serviço "${newService.name}" foi criado com sucesso.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setIsPreviewDialogOpen(false);
      setEditingService(null);
      setPreviewChanges(null);
    }
  };

  const getChanges = (original: Service, updated: Partial<Service>) => {
    const changes: Record<string, { from: any; to: any }> = {};
    
    // Comparar campos básicos
    if (updated.name && updated.name !== original.name) {
      changes.name = { from: original.name, to: updated.name };
    }
    
    if (updated.description && updated.description !== original.description) {
      changes.description = { from: original.description, to: updated.description };
    }
    
    if (updated.is_active !== undefined && updated.is_active !== original.is_active) {
      changes.is_active = { from: original.is_active, to: updated.is_active };
    }
    
    if (updated.price !== undefined && updated.price !== original.price) {
      changes.price = { from: original.price, to: updated.price };
    }
    
    // Comparar configurações
    if (updated.settings) {
      const settingsChanges: Record<string, { from: any; to: any }> = {};
      
      for (const key in updated.settings) {
        if (JSON.stringify(updated.settings[key]) !== JSON.stringify(original.settings?.[key])) {
          settingsChanges[key] = { 
            from: original.settings?.[key], 
            to: updated.settings[key] 
          };
        }
      }
      
      if (Object.keys(settingsChanges).length > 0) {
        changes.settings = settingsChanges;
      }
    }
    
    return changes;
  };

  const handleRestoreConfig = (serviceId: string) => {
    const previousConfig = previousConfigs[serviceId];
    if (!previousConfig) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar a configuração anterior.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingService(previousConfig);
    setFormData(previousConfig);
    setIsRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!editingService) return;
    
    try {
      setServices(prev => 
        prev.map(service => 
          service.id === editingService.id 
            ? { ...editingService, updated_at: new Date().toISOString() } 
            : service
        )
      );
      
      // Adicionar ao log
      await logServiceChange(editingService.id, "restore", {
        restored_to: editingService.updated_at
      });
      
      toast({
        title: "Configuração restaurada",
        description: `O serviço "${editingService.name}" foi restaurado para a configuração anterior.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao restaurar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível restaurar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsRestoreDialogOpen(false);
      setEditingService(null);
    }
  };

  const toggleRowExpansion = (serviceId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Serviços</h2>
          <p className="text-gray-600">
            Configure e gerencie todos os serviços disponíveis na plataforma
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchServices} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                <SelectItem value="price-asc">Preço (menor-maior)</SelectItem>
                <SelectItem value="price-desc">Preço (maior-menor)</SelectItem>
                <SelectItem value="updated-desc">Última atualização</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSortBy("name-asc");
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Disponíveis</CardTitle>
          <CardDescription>
            Total: {filteredServices.length} serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2 text-blue-600" />
                      <span>Carregando serviços...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center">
                      <Settings className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-gray-500">Nenhum serviço encontrado</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <>
                    <TableRow key={service.id} className={expandedRows[service.id] ? "bg-gray-50" : ""}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(service.id)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedRows[service.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{service.description}</TableCell>
                      <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(service.updated_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleServiceStatus(service.id, !service.is_active)}
                          title={service.is_active ? "Desativar serviço" : "Ativar serviço"}
                        >
                          {service.is_active ? (
                            <X className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLogs(service)}
                          title="Ver histórico de alterações"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                          title="Editar serviço"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service)}
                          title="Excluir serviço"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows[service.id] && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold text-sm mb-2">Configurações Específicas</h3>
                              <div className="space-y-1">
                                {Object.entries(service.settings).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{key}:</span>
                                    <span className="text-sm text-gray-600">
                                      {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm mb-2">Ações Rápidas</h3>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(service)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestoreConfig(service.id)}
                                  disabled={!previousConfigs[service.id]}
                                >
                                  <Undo className="h-4 w-4 mr-1" />
                                  Restaurar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewLogs(service)}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Histórico
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de Edição/Criação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? `Editar Serviço: ${editingService.name}` : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? "Edite as configurações do serviço existente." 
                : "Configure as propriedades do novo serviço."}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="access">Acesso e Integrações</TabsTrigger>
            </TabsList>

            {/* Aba de informações básicas */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Serviço</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Análise de Concorrentes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva o que este serviço faz..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço por Uso (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || 0}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500">
                      Defina o custo por uso deste serviço.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label>Serviço Ativo</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba de parâmetros */}
            <TabsContent value="parameters" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Modelos de IA Disponíveis</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["gpt-4o", "gpt-3.5-turbo", "claude-3-haiku", "claude-3-sonnet", "claude-3-opus"].map(model => (
                        <div key={model} className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                          <Switch
                            checked={formData.settings?.models?.includes(model) || false}
                            onCheckedChange={(checked) => {
                              const currentModels = formData.settings?.models || [];
                              const newModels = checked
                                ? [...currentModels, model]
                                : currentModels.filter(m => m !== model);
                              
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  models: newModels
                                }
                              });
                            }}
                          />
                          <Label>{model}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_tokens">Tokens Máximos</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      min="1"
                      max="32000"
                      value={formData.settings?.max_tokens || 2048}
                      onChange={e => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          max_tokens: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperatura</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.settings?.temperature || 0.7}
                      onChange={e => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          temperature: parseFloat(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Controla a aleatoriedade das respostas (0-2).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limit_per_request">Limite por Requisição</Label>
                    <Input
                      id="limit_per_request"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.settings?.limit_per_request || 5}
                      onChange={e => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          limit_per_request: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  
                  {formData.name?.includes("Funil") && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.settings?.cache_enabled || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              cache_enabled: checked
                            }
                          })}
                        />
                        <Label>Ativar Cache</Label>
                      </div>
                      
                      {formData.settings?.cache_enabled && (
                        <div className="ml-6">
                          <Label htmlFor="cache_expiry">Tempo de Expiração do Cache (horas)</Label>
                          <Input
                            id="cache_expiry"
                            type="number"
                            min="1"
                            max="72"
                            value={formData.settings?.cache_expiry_hours || 24}
                            onChange={e => setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                cache_expiry_hours: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Aba de acesso e integrações */}
            <TabsContent value="access" className="space-y-4 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Níveis de Acesso</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Permissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLevels.map(level => (
                        <TableRow key={level.id}>
                          <TableCell>{level.name}</TableCell>
                          <TableCell>
                            <Select
                              value={level.permission}
                              onValueChange={(value: "none" | "read" | "write" | "admin") => {
                                setAccessLevels(prev => prev.map(l => 
                                  l.id === level.id ? { ...l, permission: value } : l
                                ));
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sem Acesso</SelectItem>
                                <SelectItem value="read">Leitura</SelectItem>
                                <SelectItem value="write">Escrita</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Planos com Acesso</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["free", "basic", "intermediate", "premium"].map(plan => (
                      <div key={plan} className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                        <Switch
                          checked={formData.settings?.allowed_plans?.includes(plan) || false}
                          onCheckedChange={(checked) => {
                            const currentPlans = formData.settings?.allowed_plans || [];
                            const newPlans = checked
                              ? [...currentPlans, plan]
                              : currentPlans.filter(p => p !== plan);
                            
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                allowed_plans: newPlans
                              }
                            });
                          }}
                        />
                        <Label className="capitalize">{plan}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Integrações com APIs Externas</h3>
                  <div className="space-y-2">
                    {integrations.map(integration => (
                      <div key={integration.id} className="border p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{integration.name}</span>
                          <Switch
                            checked={integration.enabled}
                            onCheckedChange={(checked) => {
                              setIntegrations(prev => prev.map(i => 
                                i.id === integration.id ? { ...i, enabled: checked } : i
                              ));
                            }}
                          />
                        </div>
                        
                        {integration.enabled && (
                          <div className="pl-5 space-y-2 mt-3">
                            <div className="space-y-1">
                              <Label htmlFor={`api_key_${integration.id}`}>API Key</Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`api_key_${integration.id}`}
                                  type="password"
                                  value={integration.api_key || ""}
                                  onChange={e => {
                                    setIntegrations(prev => prev.map(i => 
                                      i.id === integration.id ? { ...i, api_key: e.target.value } : i
                                    ));
                                  }}
                                  placeholder="sk-***"
                                />
                                <Button variant="outline" size="icon" className="shrink-0">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {integration.name === "OpenAI API" && (
                              <div className="space-y-1">
                                <Label htmlFor={`org_id_${integration.id}`}>Organization ID (opcional)</Label>
                                <Input
                                  id={`org_id_${integration.id}`}
                                  value={integration.settings?.organization_id || ""}
                                  onChange={e => {
                                    setIntegrations(prev => prev.map(i => 
                                      i.id === integration.id ? { 
                                        ...i, 
                                        settings: {
                                          ...i.settings,
                                          organization_id: e.target.value
                                        }
                                      } : i
                                    ));
                                  }}
                                  placeholder="org-***"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveService}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o serviço <strong>{serviceToDelete?.name}</strong>. 
              Esta ação não pode ser desfeita. Todos os dados relacionados a este serviço serão perdidos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-red-800 text-sm">
                <p className="font-semibold">Atenção:</p>
                <p>A exclusão de um serviço pode afetar usuários que dependem dele.</p>
                <p>Antes de excluir, considere desativar o serviço temporariamente.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Logs de Alterações */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Histórico de Alterações - {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Registro completo de todas as alterações feitas neste serviço
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {serviceLogs.length > 0 ? (
              <div className="space-y-4">
                {serviceLogs.map((log) => (
                  <div key={log.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {log.action === "update" ? "Atualização" : 
                           log.action === "create" ? "Criação" : 
                           log.action === "delete" ? "Exclusão" : 
                           log.action === "update_status" ? "Mudança de Status" :
                           log.action === "update_integration" ? "Atualização de Integração" :
                           log.action === "restore" ? "Restauração" : log.action}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('pt-BR')} • {log.user?.full_name || log.user?.email}
                        </p>
                      </div>
                      <Badge variant={
                        log.action === "create" ? "default" : 
                        log.action === "delete" ? "destructive" : 
                        log.action === "update" ? "secondary" : 
                        log.action === "restore" ? "outline" : "default"
                      }>
                        {log.action}
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md mt-2">
                      <h4 className="text-sm font-medium mb-2">Alterações:</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(log.changes).map(([field, change]) => (
                          <div key={field} className="flex flex-col">
                            <span className="font-medium capitalize">{field}:</span>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {typeof change === 'object' && 'from' in change ? (
                                <>
                                  <div className="bg-red-50 p-1 rounded text-xs">
                                    De: {typeof change.from === 'object' ? JSON.stringify(change.from) : change.from?.toString() || "Não definido"}
                                  </div>
                                  <div className="bg-green-50 p-1 rounded text-xs">
                                    Para: {typeof change.to === 'object' ? JSON.stringify(change.to) : change.to?.toString() || "Não definido"}
                                  </div>
                                </>
                              ) : (
                                <div className="col-span-2 bg-blue-50 p-1 rounded text-xs">
                                  {typeof change === 'object' ? JSON.stringify(change) : change?.toString() || "Não definido"}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Nenhum registro de alteração encontrado para este serviço.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Preview de Alterações */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Preview das Alterações
            </DialogTitle>
            <DialogDescription>
              Revise as alterações antes de salvar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Alterações Detectadas:</h3>
              
              <div className="space-y-3">
                {previewChanges && Object.entries(previewChanges).map(([field, change]) => (
                  <div key={field}>
                    <div className="font-medium capitalize text-sm">{field}:</div>
                    
                    {typeof change === 'object' && 'from' in change ? (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-gray-100 p-2 rounded text-sm">
                          <div className="text-xs text-gray-500 mb-1">Valor Atual:</div>
                          <div className="text-sm">
                            {typeof change.from === 'object' 
                              ? <pre className="text-xs overflow-auto">{JSON.stringify(change.from, null, 2)}</pre> 
                              : String(change.from)}
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-2 rounded text-sm">
                          <div className="text-xs text-blue-500 mb-1">Novo Valor:</div>
                          <div className="text-sm">
                            {typeof change.to === 'object' 
                              ? <pre className="text-xs overflow-auto">{JSON.stringify(change.to, null, 2)}</pre> 
                              : String(change.to)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-100 rounded">
                        {typeof change === 'object' 
                          ? JSON.stringify(change) 
                          : String(change)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveServiceChanges}>
              <Check className="h-4 w-4 mr-2" />
              Confirmar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Restauração de Configuração */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo className="h-5 w-5 text-blue-500" />
              Restaurar Configuração
            </DialogTitle>
            <DialogDescription>
              Você está prestes a restaurar a configuração anterior do serviço <strong>{editingService?.name}</strong>.
              Esta ação substituirá todas as configurações atuais.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p>Esta ação é reversível. Você sempre pode voltar a qualquer configuração anterior através do histórico de alterações.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmRestore}>
              Confirmar Restauração
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManager;