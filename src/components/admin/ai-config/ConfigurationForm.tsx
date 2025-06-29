import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface AIConfiguration {
  id?: string;
  config_level: string;
  level_identifier?: string;
  model_id?: string;
  system_prompt?: string;
  is_active: boolean;
}

interface ConfigurationFormProps {
  configuration?: AIConfiguration;
  onClose: () => void;
  onSave: () => void;
}

export const ConfigurationForm = ({ configuration, onClose, onSave }: ConfigurationFormProps) => {
  // Estado para armazenar os modelos disponíveis
  const [models, setModels] = useState<{id: string; model_name: string; provider: { display_name: string }}[]>([]);
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<AIConfiguration>({
    config_level: 'global',
    level_identifier: '',
    model_id: '',
    system_prompt: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  // Carregar modelos e configuração inicial
  useEffect(() => {
    fetchModels();
    if (configuration) {
      setFormData({
        config_level: configuration.config_level,
        level_identifier: configuration.level_identifier || '',
        model_id: configuration.model_id || '',
        system_prompt: configuration.system_prompt || '',
        is_active: configuration.is_active,
      });
    }
  }, [configuration]);

  // Buscar modelos disponíveis
  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          id, 
          model_name,
          provider:provider_id (
            display_name
          )
        `)
        .eq('is_active', true)
        .order('model_name');

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
    }
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados
      const data: Record<string, unknown> = {
        ...formData,
        level_identifier: formData.level_identifier || null
      };

      if (configuration?.id) {
        // Atualizar configuração existente usando a função RPC
        const { error } = await supabase.rpc('update_ai_config_v3', {
          p_config_id: configuration.id,
          p_config_data: {
            config_level: data.config_level,
            level_identifier: data.level_identifier,
            model_id: data.model_id,
            system_prompt: data.system_prompt,
            is_active: data.is_active
          },
          p_change_reason: changeReason || 'Atualização via painel administrativo'
        });

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Configuração atualizada com sucesso.",
        });
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('ai_configurations')
          .insert([data]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Configuração criada com sucesso.",
        });
      }

      onSave();
    } catch (error: unknown) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configuração.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {configuration ? 'Editar Configuração' : 'Nova Configuração'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="config_level">Nível de Configuração</Label>
              <Select 
                value={formData.config_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, config_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="plan">Plano</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.config_level !== 'global' && (
              <div>
                <Label htmlFor="level_identifier">
                  {formData.config_level === 'plan' ? 'Nome do Plano' : 'Nome do Serviço'}
                </Label>
                <Input
                  id="level_identifier"
                  value={formData.level_identifier}
                  onChange={(e) => setFormData(prev => ({ ...prev, level_identifier: e.target.value }))}
                  placeholder={formData.config_level === 'plan' ? 'ex: premium' : 'ex: generation'}
                  required={formData.config_level !== 'global'}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="model_id">Modelo de IA</Label>
            <Select 
              value={formData.model_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.model_name} ({model.provider?.display_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="system_prompt">Prompt do Sistema</Label>
            <Textarea
              id="system_prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Digite o prompt do sistema..."
              rows={3}
              className="max-h-[200px]"
            />
          </div>
          
          <div>
            <Label htmlFor="change_reason">Motivo da Alteração</Label>
            <Textarea
              id="change_reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Descreva o motivo desta alteração para o registro de auditoria..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Configuração Ativa</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};