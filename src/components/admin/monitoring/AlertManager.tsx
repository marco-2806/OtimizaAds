import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  BellOff,
  AlertTriangle,
  Mail,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type AlertConfiguration = Tables<"alert_configurations">;

export const AlertManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertConfiguration | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [formData, setFormData] = useState({
    alert_name: "",
    metric_type: "",
    comparison_operator: "greater_than",
    threshold_value: "0",
    notification_method: "email",
    notification_target: "",
  });

  // Fetch alert configurations
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alert-configurations"],
    queryFn: async (): Promise<AlertConfiguration[]> => {
      const { data, error } = await supabase
        .from("alert_configurations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validar se threshold_value é um número válido
      let thresholdValue: number;
      try {
        thresholdValue = parseFloat(data.threshold_value);
        if (isNaN(thresholdValue)) {
          throw new Error("Valor limite deve ser um número válido");
        }
      } catch (e) {
        throw new Error("Valor limite deve ser um número válido");
      }
      
      if (isNaN(thresholdValue)) {
        throw new Error("Valor limite deve ser um número válido");
      }

      const { error } = await supabase
        .from("alert_configurations")
        .insert({
          alert_name: data.alert_name,
          metric_type: data.metric_type,
          comparison_operator: data.comparison_operator,
          threshold_value: thresholdValue || 0,
          notification_method: data.notification_method,
          notification_target: data.notification_target,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-configurations"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Alerta criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar alerta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<AlertConfiguration> }) => {
      const { error } = await supabase
        .from("alert_configurations")
        .update({
          ...data.updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-configurations"] });
      setEditingAlert(null);
      toast({
        title: "Sucesso",
        description: "Alerta atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar alerta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("alert_configurations")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-configurations"] });
      toast({
        title: "Sucesso",
        description: "Alerta excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir alerta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      alert_name: "",
      metric_type: "",
      comparison_operator: "greater_than",
      threshold_value: "0",
      notification_method: "email",
      notification_target: "",
    });
  };

  const handleCreateAlert = () => {
    // Validar se threshold_value é um número válido
    let thresholdValue: number;
    try {
      thresholdValue = parseFloat(formData.threshold_value);
      if (isNaN(thresholdValue)) {
        toast({
          title: "Erro",
          description: "O valor limite deve ser um número válido.",
          variant: "destructive",
        });
        return;
      }
    } catch (e) {
      toast({
        title: "Erro",
        description: "O valor limite deve ser um número válido.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação adicional antes de enviar
    if (!formData.alert_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do alerta é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.metric_type) {
      toast({
        title: "Erro",
        description: "Tipo de métrica é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.notification_target.trim()) {
      toast({
        title: "Erro",
        description: "Destino da notificação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    createAlertMutation.mutate(formData);
  };

  const handleEditAlert = (alert: AlertConfiguration) => {
    setEditingAlert(alert);
    setFormData({
      alert_name: alert.alert_name,
      metric_type: alert.metric_type,
      comparison_operator: alert.comparison_operator,
      threshold_value: alert.threshold_value.toString(),
      notification_method: alert.notification_method,
      notification_target: alert.notification_target,
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlert) return;
    
    // Validação similar à criação
    const thresholdValue = parseFloat(formData.threshold_value);
    if (isNaN(thresholdValue)) {
      toast({
        title: "Erro",
        description: "Valor limite deve ser um número válido",
        variant: "destructive",
      });
      return;
    }
    
    updateAlertMutation.mutate({
      id: editingAlert.id,
      updates: {
        alert_name: formData.alert_name,
        metric_type: formData.metric_type,
        comparison_operator: formData.comparison_operator,
        threshold_value: thresholdValue,
        notification_method: formData.notification_method,
        notification_target: formData.notification_target,
      },
    });
  };

  const toggleAlertStatus = (alert: AlertConfiguration) => {
    updateAlertMutation.mutate({
      id: alert.id,
      updates: { is_active: !alert.is_active },
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm("Tem certeza que deseja excluir este alerta?")) {
      deleteAlertMutation.mutate(alertId);
    }
  };

  const getNotificationIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "webhook":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const metricTypes = [
    { value: "response_time", label: "Tempo de Resposta" },
    { value: "error_rate", label: "Taxa de Erro" },
    { value: "cost_per_hour", label: "Custo por Hora" },
    { value: "tokens_per_minute", label: "Tokens por Minuto" },
    { value: "failed_requests", label: "Requisições Falhadas" },
  ];

  const comparisonOperators = [
    { value: "greater_than", label: "Maior que" },
    { value: "less_than", label: "Menor que" },
    { value: "equals", label: "Igual a" },
    { value: "greater_than_or_equal", label: "Maior ou igual a" },
    { value: "less_than_or_equal", label: "Menor ou igual a" },
  ];

  const notificationMethods = [
    { value: "email", label: "Email" },
    { value: "webhook", label: "Webhook" },
    { value: "slack", label: "Slack" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Alertas</CardTitle>
          <CardDescription>
            Configure alertas automáticos para monitoramento de métricas e notificações
          </CardDescription>
          
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingAlert(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAlert ? "Editar Alerta" : "Novo Alerta"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os parâmetros para o alerta automático
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="alert_name">Nome do Alerta</Label>
                    <Input
                      id="alert_name"
                      value={formData.alert_name}
                      onChange={(e) => setFormData({ ...formData, alert_name: e.target.value })}
                      placeholder="Ex: Tempo de resposta alto"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metric_type">Tipo de Métrica</Label>
                      <Select value={formData.metric_type} onValueChange={(value) => setFormData({ ...formData, metric_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a métrica" />
                        </SelectTrigger>
                        <SelectContent>
                          {metricTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="comparison_operator">Operador</Label>
                      <Select value={formData.comparison_operator} onValueChange={(value) => setFormData({ ...formData, comparison_operator: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {comparisonOperators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="threshold_value">Valor Limite</Label>
                    <Input
                      required
                      id="threshold_value"
                      type="number"
                      step="0.01"
                      value={formData.threshold_value}
                      onChange={(e) => {
                        const value = e.target.value || "0";
                        setFormData({ ...formData, threshold_value: value });
                      }}
                      placeholder="Ex: 5000"
                      min="0"
                      aria-required="true"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor numérico que acionará o alerta quando a condição for satisfeita
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notification_method">Método de Notificação</Label>
                      <Select value={formData.notification_method} onValueChange={(value) => setFormData({ ...formData, notification_method: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {notificationMethods.map(method => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="notification_target">Destino</Label>
                      <Input
                        id="notification_target"
                        value={formData.notification_target}
                        onChange={(e) => setFormData({ ...formData, notification_target: e.target.value })}
                        placeholder={
                          formData.notification_method === "email" ? "email@exemplo.com" :
                          formData.notification_method === "webhook" ? "https://webhook.site/..." :
                          "#canal-alertas"
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}
                      disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                    >
                      {editingAlert ? "Atualizar" : "Criar"} Alerta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total de Alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Alertas Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {alerts?.filter(a => a.is_active).length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Alertas Inativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-500">
                    {alerts?.filter(a => !a.is_active).length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Notificações Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {alerts?.filter(a => a.notification_method === 'email').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Table */}
            {isLoading ? (
              <div className="text-center py-8">Carregando alertas...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead>Notificação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts?.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.alert_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {metricTypes.find(m => m.value === alert.metric_type)?.label || alert.metric_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {comparisonOperators.find(op => op.value === alert.comparison_operator)?.label} {alert.threshold_value}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(alert.notification_method)}
                          <span className="truncate max-w-[100px]">
                            {alert.notification_target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {alert.is_active ? (
                            <Bell className="h-4 w-4 text-green-500" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() => toggleAlertStatus(alert)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(alert.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAlert(alert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            disabled={deleteAlertMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};