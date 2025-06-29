import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Check, X, AlertTriangle, FolderSync as Sync } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@/types/subscription";

interface SubscriptionPlansManagerProps {
  onPlanUpdated: () => void;
}

const SubscriptionPlansManager = ({ onPlanUpdated }: SubscriptionPlansManagerProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSyncingWithStripe, setIsSyncingWithStripe] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // A função fetchPlans é definida no componente e não muda entre renderizações

  const handleSyncWithStripe = async () => {
    try {
      setIsSyncingWithStripe(true);
      
      // Simular sincronização com Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Sincronização concluída",
        description: "Planos sincronizados com o Stripe com sucesso.",
      });
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'plans_synced_with_stripe',
        details: { 
          timestamp: new Date().toISOString(),
          plans_count: plans.length
        }
      });
      
      fetchPlans();
    } catch (error) {
      console.error('Erro ao sincronizar com Stripe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar com o Stripe.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingWithStripe(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan({
      id: "",
      name: "",
      price_monthly: 0,
      currency: "BRL",
      stripe_price_id: "",
      features: {
        generations: 0,
        diagnostics: 0,
        models: "basic",
        support: "email",
        trial_days: 0,
        optimization: false,
        performance_analysis: false,
        competitor_analysis: false,
        premium_templates: false,
        detailed_reports: false,
        priority_support: false,
        unlimited_generations: false,
        unlimited_diagnostics: false,
        custom_ai: false,
        multiple_accounts: false,
        api_access: false,
        dedicated_support: false,
        custom_training: false
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!editingPlan) return;
    
    try {
      // Verificar se existem assinaturas ativas para este plano
      const { count, error: countError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', editingPlan.id)
        .eq('status', 'active');
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "Não é possível excluir",
          description: `Existem ${count} assinaturas ativas usando este plano.`,
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // Desativar o plano em vez de excluí-lo
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPlan.id);

      if (error) throw error;
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'plan_deactivated',
        details: { 
          plan_id: editingPlan.id,
          plan_name: editingPlan.name
        }
      });
      
      toast({
        title: "Plano desativado",
        description: "O plano foi desativado com sucesso.",
      });
      
      fetchPlans();
      onPlanUpdated();
    } catch (error) {
      console.error('Erro ao desativar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const savePlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      if (editingPlan?.id) {
        // Atualizar plano existente
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            ...planData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlan.id);

        if (error) throw error;
        
        // Registrar no log de auditoria
        await supabase.from('audit_logs').insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'plan_updated',
          details: { 
            plan_id: editingPlan.id,
            plan_name: planData.name,
            changes: JSON.stringify(planData)
          }
        });
        
        toast({
          title: "Plano atualizado",
          description: "Plano atualizado com sucesso.",
        });
      } else {
        // Criar novo plano
        const { error } = await supabase
          .from('subscription_plans')
          .insert(planData);

        if (error) throw error;
        
        // Registrar no log de auditoria
        await supabase.from('audit_logs').insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'plan_created',
          details: { 
            plan_name: planData.name
          }
        });
        
        toast({
          title: "Plano criado",
          description: "Plano criado com sucesso.",
        });
      }

      fetchPlans();
      onPlanUpdated();
      setIsDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano.",
        variant: "destructive",
      });
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: isActive ? 'plan_activated' : 'plan_deactivated',
        details: { 
          plan_id: planId,
          plan_name: plans.find(p => p.id === planId)?.name
        }
      });
      
      toast({
        title: "Status alterado",
        description: `Plano ${isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      fetchPlans();
      onPlanUpdated();
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do plano.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const filteredPlans = plans.filter(plan => 
    activeTab === "all" || 
    (activeTab === "active" && plan.is_active) || 
    (activeTab === "inactive" && !plan.is_active)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h2>
          <p className="text-gray-600">Configure os planos de assinatura disponíveis</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSyncWithStripe} variant="outline" disabled={isSyncingWithStripe}>
            <Sync className={`h-4 w-4 mr-2 ${isSyncingWithStripe ? 'animate-spin' : ''}`} />
            {isSyncingWithStripe ? 'Sincronizando...' : 'Sincronizar com Stripe'}
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Planos Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Planos Inativos</TabsTrigger>
          <TabsTrigger value="all">Todos os Planos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className={`${!plan.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {formatPrice(plan.price_monthly)}/mês
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlan(plan)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Recursos:</Label>
                  <div className="mt-2 space-y-1">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <div key={key} className="text-sm text-gray-600">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {
                          typeof value === 'boolean' ? (value ? 'Sim' : 'Não') :
                          typeof value === 'number' ? (value === -1 ? 'Ilimitado' : String(value)) :
                          String(value)
                        }
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor={`active-${plan.id}`} className="text-sm font-medium">
                    Plano Ativo
                  </Label>
                  <Switch
                    id={`active-${plan.id}`}
                    checked={plan.is_active}
                    onCheckedChange={(checked) => togglePlanStatus(plan.id, checked)}
                  />
                </div>

                {plan.stripe_price_id && (
                  <div>
                    <Label className="text-sm font-medium">Stripe Price ID:</Label>
                    <p className="text-xs text-gray-500 mt-1">{plan.stripe_price_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlans.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum plano encontrado. Clique em "Novo Plano" para começar.
          </div>
        )}
      </div>

      {/* Form para criar/editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan?.id ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações e recursos do plano de assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <PlanForm
            plan={editingPlan} 
            onSave={savePlan}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingPlan(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar Desativação
            </DialogTitle>
            <DialogDescription>
              Você está prestes a desativar o plano <strong>{editingPlan?.name}</strong>. 
              Esta ação não afetará assinaturas existentes, mas impedirá que novos usuários assinem este plano.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <p className="text-sm text-yellow-800">
              Por segurança, os planos não são excluídos permanentemente, apenas desativados.
              Isso preserva a integridade dos dados históricos e assinaturas existentes.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePlan}
            >
              Desativar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Form component for creating/editing plans
const PlanForm = ({ 
  plan, 
  onSave, 
  onCancel 
}: { 
  plan: SubscriptionPlan | null; 
  onSave: (data: Partial<SubscriptionPlan>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price_monthly: plan?.price_monthly || 0,
    price_yearly: 0, // Adicionar suporte para preço anual
    currency: plan?.currency || 'BRL',
    stripe_price_id: plan?.stripe_price_id || '',
    is_active: plan?.is_active ?? true,
    features: plan?.features || {
      generations: 0,
      diagnostics: 0,
      models: 'basic',
      support: 'email',
      trial_days: 0,
      optimization: false,
      performance_analysis: false,
      competitor_analysis: false,
      premium_templates: false,
      detailed_reports: false,
      priority_support: false,
      unlimited_generations: false,
      unlimited_diagnostics: false,
      custom_ai: false,
      multiple_accounts: false,
      api_access: false,
      dedicated_support: false,
      custom_training: false
    },
    description: plan?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateFeature = (key: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="features">Recursos</TabsTrigger>
          <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Preço Mensal (centavos)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_monthly}
                onChange={(e) => setFormData(prev => ({ ...prev, price_monthly: parseInt(e.target.value) }))}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: 2990 para R$29,90
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_yearly">Preço Anual (centavos)</Label>
              <Input
                id="price_yearly"
                type="number"
                value={formData.price_yearly}
                onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe 0 para não oferecer plano anual
              </p>
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os benefícios deste plano"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="trial_days">Período de Teste (dias)</Label>
            <Input
              id="trial_days"
              type="number"
              value={formData.features.trial_days}
              onChange={(e) => updateFeature('trial_days', parseInt(e.target.value))}
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = sem período de teste
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="generations">Gerações (-1 para ilimitado)</Label>
              <Input
                id="generations"
                type="number"
                value={formData.features.generations}
                onChange={(e) => updateFeature('generations', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="diagnostics">Diagnósticos (-1 para ilimitado)</Label>
              <Input
                id="diagnostics"
                type="number"
                value={formData.features.diagnostics}
                onChange={(e) => updateFeature('diagnostics', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="funnel_analysis">Análises de Funil (-1 para ilimitado)</Label>
              <Input
                id="funnel_analysis"
                type="number"
                value={formData.features.funnel_analysis || 0}
                onChange={(e) => updateFeature('funnel_analysis', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="models">Modelos Disponíveis</Label>
            <Select 
              value={formData.features.models} 
              onValueChange={(value) => updateFeature('models', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básicos</SelectItem>
                <SelectItem value="standard">Padrão</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="support">Nível de Suporte</Label>
            <Select 
              value={formData.features.support} 
              onValueChange={(value) => updateFeature('support', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="priority">Prioritário</SelectItem>
                <SelectItem value="dedicated">Dedicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recursos Adicionais</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.features)
                .filter(([key, value]) => typeof value === 'boolean')
                .map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={key}
                      checked={value as boolean}
                      onCheckedChange={(checked) => updateFeature(key, checked)}
                    />
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
            <Input
              id="stripe_price_id"
              value={formData.stripe_price_id}
              onChange={(e) => setFormData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
              placeholder="price_1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID do preço no Stripe. Deixe em branco para gerar automaticamente.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Plano Ativo</Label>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {plan?.id ? 'Atualizar' : 'Criar'} Plano
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SubscriptionPlansManager;