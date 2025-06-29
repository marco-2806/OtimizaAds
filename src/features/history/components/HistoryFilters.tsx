import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Search, Filter, X, Grid3X3, List } from "lucide-react";

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalItems: number;
  filteredItems: number;
}

const HistoryFilters = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalItems,
  filteredItems
}: HistoryFiltersProps) => {
  const clearFilters = () => {
    onSearchChange("");
    onTypeFilterChange("all");
    onSortChange("newest");
  };

  const hasActiveFilters = searchTerm || typeFilter !== "all";

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 flex-1 w-full">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 mobile-input"
              aria-label="Buscar no histórico"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="generation">Geração</SelectItem>
              <SelectItem value="diagnosis">Diagnóstico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recente</SelectItem>
              <SelectItem value="oldest">Mais antigo</SelectItem>
              <SelectItem value="title">Título A-Z</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end">
          <fieldset className="flex border rounded-md">
            <legend className="sr-only">Modo de visualização</legend>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none touch-target"
              aria-label="Visualização em grade"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none touch-target"
              aria-label="Visualização em lista"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </Button>
          </fieldset>
        </div>
      </div>

      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="touch-target"
            >
              <X className="h-4 w-4 mr-1 flex-shrink-0" />
              Limpar filtros
            </Button>
          )}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <Badge variant="secondary">
                  Busca: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary">
                  Tipo: {typeFilter === "generation" ? "Geração" : "Diagnóstico"}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredItems !== totalItems && filteredItems > 0 ? (
            <>Mostrando {filteredItems} de {totalItems} itens</>
          ) : (
            <>{totalItems} {totalItems === 1 ? 'item encontrado' : 'itens encontrados'}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryFilters;