import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Copy, Trash2, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type HistoryItem = Tables<'history_items'>;

interface HistoryCardProps {
  item: HistoryItem;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  onView: (item: HistoryItem) => void;
}

const HistoryCard = ({ item, onCopy, onDelete, onView }: HistoryCardProps) => {
  const getTypeLabel = (type: string) => {
    return type === "generation" ? "Geração" : "Diagnóstico";
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "generation" ? "default" : "secondary";
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 group h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base sm:text-lg line-clamp-1">{item.title}</CardTitle>
              <Badge variant={getTypeBadgeVariant(item.type)}>
                {getTypeLabel(item.type)}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1 text-xs mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(item.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:flex-row flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(item)}
              className="h-8 w-8 p-0 touch-target"
              aria-label="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(item.content)}
              className="h-8 w-8 p-0 touch-target"
              aria-label="Copiar conteúdo"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 touch-target"
              aria-label="Excluir item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {truncateContent(item.content)}
        </p>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;