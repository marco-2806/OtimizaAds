import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Copy, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type HistoryItem = Tables<'history_items'>;

interface HistoryModalProps {
  item: HistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HistoryModal = ({ item, open, onOpenChange }: HistoryModalProps) => {
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Conteúdo copiado!",
        description: "O texto foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "generation" ? "Geração" : "Diagnóstico";
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "generation" ? "default" : "secondary";
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} aria-label="Detalhes do histórico">
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-lg sm:text-xl break-words pr-8">{item.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <Badge variant={getTypeBadgeVariant(item.type)}>
                  {getTypeLabel(item.type)}
                </Badge>
              </DialogDescription>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(item.content)}
              className="self-end"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] w-full rounded-md border p-3 sm:p-4 mt-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {item.content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;