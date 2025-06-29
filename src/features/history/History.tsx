import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import type { Tables } from "@/integrations/supabase/types";
import HistoryCard from "./components/HistoryCard";
import HistoryFilters from "./components/HistoryFilters";
import HistoryModal from "./components/HistoryModal";
import { Search, History as HistoryIcon } from "lucide-react";

type HistoryItem = Tables<'history_items'>;

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistoryItems();
    }
  }, [user]);  // eslint-disable-line react-hooks/exhaustive-deps
  // A função fetchHistoryItems é definida no componente e não muda entre renderizações

  const fetchHistoryItems = async () => {
    try {
      setLoading(true);
      if (!user) {
        setHistoryItems([]);
        setLoading(false);
        return;
      }
      // Filtrar apenas itens do usuário logado
      const { data, error } = await supabase
        .from('history_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar seus itens do histórico.",
          variant: "destructive",
        });
      } else {
        setHistoryItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    const filtered = historyItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [historyItems, searchTerm, typeFilter, sortBy]);

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

  const deleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('history_items')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o item.",
          variant: "destructive",
        });
      } else {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Item excluído",
          description: "O item foi removido do seu histórico.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    }
  };

  const viewItem = (item: HistoryItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meu Histórico</h1>
          <p className="text-gray-600 mt-2">Carregando seus itens...</p>
        </div>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meu Histórico</h1>
        <p className="text-gray-600 mt-1 sm:mt-2">
          Acesse todos os anúncios gerados e diagnósticos realizados anteriormente
        </p>
      </div>

      <HistoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalItems={historyItems.length}
        filteredItems={filteredAndSortedItems.length}
      />

      {filteredAndSortedItems.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" 
            : "space-y-3 sm:space-y-4"
        }>
          {filteredAndSortedItems.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onCopy={copyToClipboard}
              onDelete={deleteItem}
              onView={viewItem}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="text-gray-500 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <HistoryIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-sm max-w-md mx-auto">
                {searchTerm || typeFilter !== "all" ? 
                  "Tente ajustar os filtros de busca" : 
                  "Você ainda não tem itens no histórico. Comece gerando ou analisando anúncios!"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <HistoryModal
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default History;