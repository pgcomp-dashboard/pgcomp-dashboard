import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { configurationService } from "@/services/modules/configuration.service";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { ClearProductionsDialog } from "./ProductionDialogs";

interface ProductionToolbarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: {
    titulo: string;
    local: string;
    anoInicio: string;
    anoFim: string;
    tipo: string;
    origem: string;
    qualis: string;
    isFeatured: string;
  };
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  uniqueYears: number[];
  qualisList: any[];
  // Action button props
  isAdmin?: boolean;
  onAdd: (form: "xml" | "doi" | "other") => void;
  onClearAll: () => Promise<void>;
}

export function ProductionToolbar({
  filters,
  setFilters,
  clearFilters,
  uniqueYears,
  qualisList,
  onAdd,
  onClearAll,
}: ProductionToolbarProps) {
  const { data: rulesData } = useQuery({
    queryKey: ["rulesYears"],
    queryFn: () => configurationService.getRulesEndAndStartYears(),
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (rulesData?.startYear && rulesData?.endYear) {
      setFilters({
        ...filters,
        anoInicio: rulesData.startYear.toString(),
        anoFim: rulesData.endYear.toString(),
      });
    }
  }, [rulesData]);

  return (
    <div className="w-full">
      <div className="bg-muted/50 rounded-lg p-4">
        {/* Top row: filter fields + action buttons */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"> */}
        <div className="flex justify-between">
          <div>
            <Label className="text-xs mb-1.5 block">Título</Label>
            <Input
              type="text"
              placeholder="Filtrar título..."
              value={filters.titulo}
              onChange={(e) =>
                setFilters({ ...filters, titulo: e.target.value })
              }
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Local</Label>
            <Input
              type="text"
              placeholder="Filtrar local..."
              value={filters.local}
              onChange={(e) =>
                setFilters({ ...filters, local: e.target.value })
              }
              className="h-9"
            />
          </div>

          <div className="lg:col-span-2">
            <Label className="text-xs mb-1.5 block">Período (Ano)</Label>
            <div className="flex items-center gap-2">
              <Select
                value={filters.anoInicio}
                onValueChange={(value) =>
                  setFilters({ ...filters, anoInicio: value })
                }
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="De" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">até</span>
              <Select
                value={filters.anoFim}
                onValueChange={(value) =>
                  setFilters({ ...filters, anoFim: value })
                }
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Até" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Tipo</Label>
            <Select
              value={filters.tipo}
              onValueChange={(value) => setFilters({ ...filters, tipo: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="conference">Conferência</SelectItem>
                <SelectItem value="journal">Periódico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Qualis</Label>
            <Select
              value={filters.qualis}
              onValueChange={(value) =>
                setFilters({ ...filters, qualis: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {[...new Map(qualisList.map((q) => [q.code, q])).values()].map(
                  (q) => (
                    <SelectItem key={q.code} value={q.code}>
                      {q.code}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Favorito</Label>
            <Select
              value={filters.isFeatured}
              onValueChange={(value) =>
                setFilters({ ...filters, isFeatured: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="featured">Favoritados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-8"
            >
              Limpar Filtros
            </Button>

            <div className="flex items-center gap-2">
              <ClearProductionsDialog onConfirm={onClearAll} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-9 bg-primary hover:bg-primary/90 text-sm">
                    <Plus className="mr-1.5 h-4 w-4" /> Adicionar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onAdd("xml")}>
                    Importar XML Lattes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdd("doi")}>
                    Adicionar via DOI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdd("other")}>
                    Adicionar Manualmente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
