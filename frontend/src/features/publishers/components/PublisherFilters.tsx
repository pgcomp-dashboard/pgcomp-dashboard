import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { StratumQualis } from "@/types/academic";
import { RotateCw, Search } from "lucide-react";

interface PublisherFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  qualisFilter: string;
  setQualisFilter: (value: string) => void;
  perPage: number;
  setPerPage: (value: number) => void;
  qualisOptions: StratumQualis[];
  refetch: () => void;
  isFetching: boolean;
}

export function PublisherFilters({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  qualisFilter,
  setQualisFilter,
  perPage,
  setPerPage,
  qualisOptions,
  refetch,
  isFetching,
}: PublisherFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-muted/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs defaultValue="all" value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="journal">Periódicos</TabsTrigger>
            <TabsTrigger value="conference">Conferências</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="bg-background hover:bg-muted h-9 w-9"
                >
                  <RotateCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar dados</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isFetching && (
            <span className="text-xs text-muted-foreground animate-pulse hidden sm:inline">
              Atualizando...
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-1 items-center gap-4 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-35">
            <Select
              value={qualisFilter}
              onValueChange={setQualisFilter}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Qualis</SelectItem>
                {Array.from(new Set(qualisOptions.map(q => q.code)))
                  .sort()
                  .map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="perPageSelect" className="text-sm text-muted-foreground whitespace-nowrap">
            Por página:
          </label>
          <select
            id="perPageSelect"
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto bg-background"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
