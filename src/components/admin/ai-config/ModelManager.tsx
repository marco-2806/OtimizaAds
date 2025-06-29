import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, AlertCircle, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Schema for model validation
const modelSchema = z.object({
  model_name: z.string().min(1, "Nome do modelo é obrigatório"),
  provider_id: z.string().min(1, "Provedor é obrigatório"),
  provider_model_id: z.string().min(1, "ID do modelo no provedor é obrigatório"),
  model_type: z.enum(["chat", "completion"], {
    required_error: "Tipo do modelo é obrigatório",
  }),
  cost_per_token_input: z.number().min(0, "Custo de entrada deve ser positivo").optional(),
  cost_per_token_output: z.number().min(0, "Custo de saída deve ser positivo").optional(),
  max_tokens: z.number().min(1, "Máximo de tokens deve ser positivo").optional(),
  temperature: z.number().min(0, "Temperatura deve ser positiva").max(2, "Temperatura máxima é 2").optional(),
  top_p: z.number().min(0, "Top P deve ser positivo").max(1, "Top P máximo é 1").optional(),
  frequency_penalty: z.number().min(-2, "Frequency penalty mínimo é -2").max(2, "Frequency penalty máximo é 2").optional(),
  presence_penalty: z.number().min(-2, "Presence penalty mínimo é -2").max(2, "Presence penalty máximo é 2").optional(),
  supports_streaming: z.boolean().default(false),
  supports_vision: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ModelFormData = z.infer<typeof modelSchema>;

// Type definitions for Supabase data
type Provider = {
  id: string;
  display_name: string;
  provider_name: string;
  is_active: boolean;
};

type Model = {
  id: string;
  model_name: string;
  provider_id: string | null;
  provider_model_id: string;
  model_type: 'chat' | 'completion';
  cost_per_token_input?: number;
  cost_per_token_output?: number;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  is_active: boolean;
  created_at: string;
  provider_data?: Provider;
};

// Type definition for DB insertion (without relational provider data)
type ModelInsertData = {
  model_name: string;
  provider_id: string | null;
  provider_model_id: string;
  model_type: "chat" | "completion";
  cost_per_token_input?: number;
  cost_per_token_output?: number;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  is_active: boolean;
};


export const ModelManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form initialization
  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      model_name: "",
      provider_id: "",
      provider_model_id: "",
      model_type: "chat",
      cost_per_token_input: 0,
      cost_per_token_output: 0,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      supports_streaming: false,
      supports_vision: false,
      is_active: true,
    },
  });

  // Fetch models
  const { data: models, isLoading } = useQuery<Model[]>({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_models")
        .select(`
          *,
          provider_data:provider_id (
            id,
            display_name,
            provider_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Model[]) || [];
    },
  });

  // Fetch providers for the dropdown
  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["provider-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_configurations")
        .select("*")
        .eq("is_active", true)
        .order("display_name");

      if (error) throw error;
      return (data as Provider[]) || [];
    },
  });

  // Function to check if model name already exists
  const checkModelNameExists = (modelName: string, excludeId?: string) => {
    if (!models) return false;
    return models.some(model =>
      model.model_name.toLowerCase() === modelName.toLowerCase() &&
      model.id !== excludeId
    );
  };

  // Convert values between per-token and per-million costs
  const convertToPerToken = (perMillion: number) => {
    return perMillion / 1_000_000;
  };

  const convertToPerMillion = (perToken: number) => {
    return perToken * 1_000_000;
  };

  // Mutation to create a model
  const createModelMutation = useMutation({
    mutationFn: async (data: ModelFormData) => {
      if (checkModelNameExists(data.model_name)) {
        throw new Error(`Já existe um modelo com o nome "${data.model_name}". Por favor, escolha um nome diferente.`);
      }

      const insertData: ModelInsertData = {
        ...data,
        cost_per_token_input: convertToPerToken(data.cost_per_token_input || 0),
        cost_per_token_output: convertToPerToken(data.cost_per_token_output || 0),
      };

      const { error } = await supabase
        .from("ai_models")
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Modelo criado",
        description: "O modelo foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar modelo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a model
  const updateModelMutation = useMutation({
    mutationFn: async (data: ModelFormData) => {
      if (!editingModel) throw new Error("Nenhum modelo selecionado para edição.");

      if (checkModelNameExists(data.model_name, editingModel.id)) {
        throw new Error(`Já existe um modelo com o nome "${data.model_name}". Por favor, escolha um nome diferente.`);
      }

      const updateData: ModelInsertData = {
        ...data,
        cost_per_token_input: convertToPerToken(data.cost_per_token_input || 0),
        cost_per_token_output: convertToPerToken(data.cost_per_token_output || 0),
      };

      const { error } = await supabase
        .from("ai_models")
        .update(updateData)
        .eq("id", editingModel.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      setIsDialogOpen(false);
      setEditingModel(null);
      form.reset();
      toast({
        title: "Modelo atualizado",
        description: "O modelo foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar modelo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete (deactivate) a model
  const deleteModelMutation = useMutation({
    mutationFn: async (model: Model) => {
      const { data: usages, error: usageError } = await supabase
        .from("ai_configurations")
        .select("id")
        .eq("model_id", model.id);

      if (usageError) throw usageError;

      if (usages && usages.length > 0) {
        throw new Error(`Este modelo está sendo usado em ${usages.length} configurações e não pode ser excluído.`);
      }

      const { error } = await supabase
        .from("ai_models")
        .update({ is_active: false })
        .eq("id", model.id);

      if (error) throw error;

      // Optional: Audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        admin_user_id: user?.id,
        action: 'model_deactivated',
        details: {
          model_name: model.model_name,
          provider: model.provider_id
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({
        title: "Modelo desativado",
        description: "O modelo foi desativado com sucesso.",
      });
      setConfirmDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao desativar modelo",
        description: error.message,
        variant: "destructive",
      });
      setConfirmDelete(null);
    },
  });

  // Handle model editing
  const handleEdit = (model: Model) => {
    setEditingModel(model);
    form.reset({
      model_name: model.model_name,
      provider_id: model.provider_id || '',
      provider_model_id: model.provider_model_id,
      model_type: model.model_type,
      cost_per_token_input: convertToPerMillion(model.cost_per_token_input || 0),
      cost_per_token_output: convertToPerMillion(model.cost_per_token_output || 0),
      max_tokens: model.max_tokens || 4096,
      temperature: model.temperature || 0.7,
      top_p: model.top_p || 0.9,
      frequency_penalty: model.frequency_penalty || 0,
      presence_penalty: model.presence_penalty || 0,
      supports_streaming: model.supports_streaming || false,
      supports_vision: model.supports_vision || false,
      is_active: model.is_active,
    });
    setIsDialogOpen(true);
  };

  // Handle model creation
  const handleCreate = () => {
    setEditingModel(null);
    form.reset({
      // Reset with default values
      model_name: "",
      provider_id: "",
      provider_model_id: "",
      model_type: "chat",
      cost_per_token_input: 0,
      cost_per_token_output: 0,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      supports_streaming: false,
      supports_vision: false,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: ModelFormData) => {
    if (editingModel) {
      updateModelMutation.mutate(data);
    } else {
      createModelMutation.mutate(data);
    }
  };

  // Handle model deletion
  const handleDelete = (model: Model) => {
    setConfirmDelete(model.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Modelos</CardTitle>
          <CardDescription>Carregando modelos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Gerenciador de Modelos</CardTitle>
                <CardDescription>
                    Adicionar, editar e configurar modelos de IA disponíveis
                </CardDescription>
            </div>
            <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Modelo
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Modelo</TableHead>
              <TableHead>Provedor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Temp.</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Custo (Input/Output)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models?.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.model_name}</TableCell>
                <TableCell>{model.provider_data?.display_name || "Desconhecido"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{model.model_type}</Badge>
                </TableCell>
                <TableCell>{model.temperature?.toFixed(1) || "N/A"}</TableCell>
                <TableCell>{model.max_tokens || "N/A"}</TableCell>
                <TableCell>
                  <span className="text-xs">
                    In: ${convertToPerMillion(model.cost_per_token_input || 0).toFixed(2)}/1M
                    <br />
                    Out: ${convertToPerMillion(model.cost_per_token_output || 0).toFixed(2)}/1M
                  </span>
                </TableCell>
                <TableCell>
                  {model.is_active ? (
                    <Badge>Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(model)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(model)}
                      disabled={!model.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Model Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? "Editar Modelo" : "Novo Modelo"}
              </DialogTitle>
              <DialogDescription>
                {editingModel
                  ? "Edite as configurações do modelo de IA"
                  : "Adicione um novo modelo de IA ao sistema"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="col-span-2 flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">Configurações do Modelo</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: Basic Info */}
                  <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                    <h3 className="text-md font-medium">Informações Básicas</h3>
                  
                    <FormField
                      control={form.control}
                      name="model_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Modelo</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: GPT-4o" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nome para identificação interna
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provider_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provedor</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o provedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {providers?.map(provider => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.display_name} ({provider.provider_name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provider_model_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Modelo no Provedor</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: gpt-4o" {...field} />
                          </FormControl>
                          <FormDescription>
                            Identificador exato usado na API do provedor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo do Modelo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="chat">Chat</SelectItem>
                              <SelectItem value="completion">Completion</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Column 2: Parameters & Costs */}
                  <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                    <h3 className="text-md font-medium">Parâmetros e Custos</h3>

                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperatura: {field.value?.toFixed(1)}</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value || 0.7]}
                              onValueChange={([value]) => field.onChange(value)}
                              max={2}
                              min={0}
                              step={0.1}
                            />
                          </FormControl>
                          <FormDescription>
                            Controla a aleatoriedade das respostas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="max_tokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tokens Máximos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="4096"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cost_per_token_input"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custo por 1M Tokens (Entrada)</FormLabel>
                                    <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.13"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cost_per_token_output"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custo por 1M Tokens (Saída)</FormLabel>
                                    <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.39"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  
                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <FormField
                            control={form.control}
                            name="supports_streaming"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base">Streaming</FormLabel>
                                <FormDescription>
                                    Suporta respostas em stream
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="supports_vision"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base">Visão</FormLabel>
                                <FormDescription>
                                    Suporta processamento de imagens
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                  
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base">Modelo Ativo</FormLabel>
                                <FormDescription>
                                    O modelo está disponível para uso
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createModelMutation.isPending || updateModelMutation.isPending}
                  >
                    {createModelMutation.isPending || updateModelMutation.isPending 
                      ? "Salvando..." 
                      : (editingModel ? "Atualizar" : "Criar")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      {/* Deactivation Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Confirmar Desativação
            </DialogTitle>
            <DialogDescription>
              Você está prestes a desativar este modelo. Isso o tornará indisponível para novas configurações.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  Por segurança, os modelos não são excluídos permanentemente, apenas desativados.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Isso preserva a integridade dos dados históricos e configurações existentes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const model = models?.find(m => m.id === confirmDelete);
                if (model) {
                  deleteModelMutation.mutate(model);
                }
              }}
              disabled={deleteModelMutation.isPending}
            >
              {deleteModelMutation.isPending ? "Desativando..." : "Desativar Modelo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

