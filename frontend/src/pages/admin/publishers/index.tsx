import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { publisherService } from "@/services/modules/publisher.service";
import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function PublishersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Publisher> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchData() {
    setIsLoading(true);
    try {
      const filters: Record<string, any> = {};
      let filterIndex = 0;

      if (search.trim()) {
        filters[`filters[${filterIndex}][field]`] = 'name';
        filters[`filters[${filterIndex}][value]`] = search.trim();
        filters[`filters[${filterIndex}][operator]`] = 'like';
        filterIndex++;
      }

      if (typeFilter !== 'all') {
        filters[`filters[${filterIndex}][field]`] = 'publisher_type';
        filters[`filters[${filterIndex}][value]`] = typeFilter;
        // Using '=' for exact match on enum/type field
        filters[`filters[${filterIndex}][operator]`] = '=';
        filterIndex++;
      }

      const response = await publisherService.getAllPublishers(page, perPage, filters);
      setPublishers(response.data);
      setPagination({
        ...response,
        meta: {
          ...response.meta,
          last_page: Math.max(1, response.meta.last_page),
        },
      });
    } catch (error) {
      console.error("Failed to fetch publishers", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page, perPage, search, typeFilter]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.meta.last_page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Periódicos e Conferências</h1>
          <p className="text-muted-foreground">Gerencie os veículos de publicação cadastrados.</p>
        </div>
      </header>

      <div className="rounded-md border">
        <div className="flex flex-col gap-4 p-4 border-b bg-muted/20">
          {/* Tabs for Publisher Type */}
          <Tabs defaultValue="all" value={typeFilter} onValueChange={(val) => {
            setTypeFilter(val);
            setPage(1); // Reset to first page on filter change
          }} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="journal">Periódicos</TabsTrigger>
              <TabsTrigger value="conference">Conferências</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome..."
                className="pl-8 bg-background"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="perPageSelect" className="text-sm text-muted-foreground whitespace-nowrap">
                Por página:
              </label>
              <select
                id="perPageSelect"
                className="border rounded px-2 py-1 text-sm w-full sm:w-auto bg-background"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qualis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : publishers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                publishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell className="font-medium">{publisher.id}</TableCell>
                    <TableCell>{publisher.name}</TableCell>
                    <TableCell>{publisher.initials || '—'}</TableCell>
                    <TableCell>
                      {publisher.publisher_type === 'journal' ? 'Periódico' :
                        publisher.publisher_type === 'conference' ? 'Conferência' :
                          publisher.publisher_type}
                    </TableCell>
                    <TableCell>
                      {publisher.stratum_qualis?.code || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Página {pagination.meta.current_page} de {pagination.meta.last_page}
            </span>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                disabled={pagination.meta.current_page === 1}
                onClick={() => handlePageChange(1)}
              >
                {'<<'}
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={pagination.meta.current_page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </Button>

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={pagination.meta.current_page === pagination.meta.last_page}
                onClick={() => handlePageChange(page + 1)}
              >
                Próxima
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                disabled={pagination.meta.current_page === pagination.meta.last_page}
                onClick={() => handlePageChange(pagination.meta.last_page)}
              >
                {'>>'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
