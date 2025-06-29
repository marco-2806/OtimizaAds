import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Save, 
  Play, 
  Copy,
  TestTube,
  GitBranch,
  Clock,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type PromptVersion = Tables<"prompt_versions">;
type TestResult = Tables<"prompt_test_results">;

export const PromptEditor = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersion | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptVersion | null>(null);
  const [testInput, setTestInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptVersion | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [formData, setFormData] = useState({
    prompt_name: "",
    version: "1.0.0",
    content: "",
    description: "",
  });

  // Fetch prompts using the new RPC function
  const { data: prompts, isLoading } = useQuery({
    queryKey: ["prompts"],
    queryFn: async (): Promise<PromptVersion[]> => {
      const { data, error } = await supabase.rpc('get_prompt_versions');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch test results for selected prompt
  const { data: testResults } = useQuery({
    queryKey: ["test-results", selectedPrompt?.id],
    queryFn: async (): Promise<TestResult[]> => {
      if (!selectedPrompt?.id) return [];
      
      const { data, error } = await supabase
        .from("prompt_test_results")
        .select("*")
        .eq("prompt_version_id", selectedPrompt.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPrompt?.id,
  });

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("prompt_versions")
        .insert({
          prompt_name: data.prompt_name,
          version: data.version,
          content: data.content,
          description: data.description,
          is_active: true,
          created_by: "admin", // TODO: Get from auth context
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setIsCreateDialogOpen(false);
      setFormData({
        prompt_name: "",
        version: "1.0.0",
        content: "",
        description: "",
      });
      toast({
        title: "Sucesso",
        description: "Prompt criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar prompt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async (data: { content: string; description?: string }) => {
      if (!editingPrompt?.id) return;
      
      const { error } = await supabase
        .from("prompt_versions")
        .update({
          content: data.content,
          description: data.description,
        })
        .eq("id", editingPrompt.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setEditingPrompt(null);
      toast({
        title: "Sucesso",
        description: "Prompt atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar prompt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Test prompt mutation
  const testPromptMutation = useMutation({
    mutationFn: async (data: { input: string; expected?: string }) => {
      if (!selectedPrompt?.id) return;

      // Simulate AI test - In real implementation, this would call the AI service
      const mockOutput = `Resultado simulado para: ${data.input}`;
      const status = data.expected && data.expected === mockOutput ? 'passed' : 'failed';

      const { error } = await supabase
        .from("prompt_test_results")
        .insert({
          prompt_version_id: selectedPrompt.id,
          test_input: data.input,
          expected_output: data.expected,
          actual_output: mockOutput,
          status,
        });

      if (error) throw error;
      return { output: mockOutput, status };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["test-results", selectedPrompt?.id] });
      setTestInput("");
      setExpectedOutput("");
      toast({
        title: "Teste Executado",
        description: `Status: ${result?.status === 'passed' ? 'Passou' : 'Falhou'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao executar teste: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from("prompt_versions")
        .update({ is_active: false })
        .eq("id", promptId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setPromptToDelete(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Prompt excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir prompt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreatePrompt = () => {
    createPromptMutation.mutate(formData);
  };

  const handleUpdatePrompt = () => {
    if (editingPrompt) {
      updatePromptMutation.mutate({
        content: editingPrompt.content,
        description: editingPrompt.description,
      });
    }
  };

  const handleTestPrompt = () => {
    testPromptMutation.mutate({
      input: testInput,
      expected: expectedOutput || undefined,
    });
  };

  const handleDeletePrompt = (prompt: PromptVersion) => {
    setPromptToDelete(prompt);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePrompt = () => {
    if (promptToDelete) {
      deletePromptMutation.mutate(promptToDelete.id);
    }
  };

  const handleDuplicatePrompt = (prompt: PromptVersion) => {
    const versionParts = prompt.version.split('.');
    const newMinor = parseInt(versionParts[2]) + 1;
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${newMinor}`;

    setFormData({
      prompt_name: prompt.prompt_name,
      version: newVersion,
      content: prompt.content,
      description: `Cópia de ${prompt.description || prompt.version}`,
    });
    setIsCreateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passou</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Editor de Prompts</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editor de Prompts</CardTitle>
          <CardDescription>
            Editor avançado de prompts com versionamento e testes
          </CardDescription>
          
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Prompt</DialogTitle>
                  <DialogDescription>
                    Criar uma nova versão de prompt
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt_name">Nome do Prompt</Label>
                    <Input
                      id="prompt_name"
                      value={formData.prompt_name}
                      onChange={(e) => setFormData({ ...formData, prompt_name: e.target.value })}
                      placeholder="Ex: Diagnóstico de Anúncios"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="version">Versão</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="Ex: 1.0.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da versão"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Conteúdo do Prompt</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Digite o prompt aqui..."
                      className="min-h-[180px] max-h-[300px] overflow-y-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePrompt} disabled={createPromptMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Prompt
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="tests">Testes</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts?.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.prompt_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{prompt.version}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {prompt.description || "Sem descrição"}
                      </TableCell>
                      <TableCell>
                        {prompt.is_active ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(prompt.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPrompt(prompt);
                              setSelectedPrompt(prompt);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicatePrompt(prompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPrompt(prompt);
                              setIsTestDialogOpen(true);
                            }}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePrompt(prompt)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {editingPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editando: {editingPrompt.prompt_name} v{editingPrompt.version}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="edit_content">Conteúdo do Prompt</Label>
                      <Textarea
                        id="edit_content"
                        value={editingPrompt.content}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                        className="min-h-[300px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit_description">Descrição</Label>
                      <Input
                        id="edit_description"
                        value={editingPrompt.description || ""}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleUpdatePrompt} disabled={updatePromptMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              {selectedPrompt ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Testar Prompt: {selectedPrompt.prompt_name} v{selectedPrompt.version}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="test_input">Entrada de Teste</Label>
                        <Textarea
                          id="test_input"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="Digite o texto de entrada para testar o prompt..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="expected_output">Saída Esperada (Opcional)</Label>
                        <Textarea
                          id="expected_output"
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          placeholder="Digite a saída esperada para comparação..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleTestPrompt} 
                        disabled={testPromptMutation.isPending || !testInput.trim()}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Executar Teste
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados dos Testes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Entrada</TableHead>
                            <TableHead>Saída Esperada</TableHead>
                            <TableHead>Saída Real</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testResults?.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="max-w-[200px] truncate">
                                {result.test_input}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {result.expected_output || "N/A"}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {result.actual_output}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(result.status)}
                              </TableCell>
                              <TableCell>
                                {format(new Date(result.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um prompt para executar testes</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Versões</CardTitle>
                  <CardDescription>
                    Todas as versões dos prompts criados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prompts?.reduce((acc, prompt) => {
                      const group = acc.find(g => g.name === prompt.prompt_name);
                      if (group) {
                        group.versions.push(prompt);
                      } else {
                        acc.push({ name: prompt.prompt_name, versions: [prompt] });
                      }
                      return acc;
                    }, [] as { name: string; versions: PromptVersion[] }[])
                    .map((group) => (
                      <Card key={group.name}>
                        <CardHeader>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {group.versions
                              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                              .map((version) => (
                              <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <GitBranch className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{version.version}</Badge>
                                      {version.is_active && <Badge variant="default">Ativo</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {version.description || "Sem descrição"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(version.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teste Rápido</DialogTitle>
            <DialogDescription>
              Execute um teste rápido no prompt selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="quick_test_input">Entrada</Label>
              <Textarea
                id="quick_test_input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Digite o texto de teste..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleTestPrompt} 
                disabled={testPromptMutation.isPending || !testInput.trim()}
              >
                <Play className="h-4 w-4 mr-2" />
                Executar
              </Button>
              <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o prompt <strong>{promptToDelete?.prompt_name} (v{promptToDelete?.version})</strong>. 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <p className="text-sm text-red-800">
              A exclusão de um prompt pode afetar funcionalidades que dependem dele.
              Certifique-se de que este prompt não está sendo utilizado em nenhum lugar.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePrompt}
              disabled={deletePromptMutation.isPending}
            >
              {deletePromptMutation.isPending ? "Excluindo..." : "Excluir Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};