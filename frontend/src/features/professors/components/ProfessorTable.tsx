import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Professor } from "@/types/user";
import {
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  Row,
  SortingState,
} from "@tanstack/react-table";
import { Eye, FileText, SquarePenIcon, Trash, UserRoundX } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

interface ProfessorTableProps {
  professors: Professor[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortField: "name" | "category" | null;
  sortOrder: "asc" | "desc";
  onSort: (field: "name" | "category") => void;
  onViewDetails: (professor: Professor) => void;
  onViewProductions: (id: number) => void;
  onDelete: (professor: Professor) => void;
}

const columnHelper = createColumnHelper<Professor>();

export function ProfessorTable({
  professors,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  sortField,
  sortOrder,
  onSort,
  onViewDetails,
  onViewProductions,
  onDelete,
}: ProfessorTableProps) {
  const sorting = useMemo<SortingState>(() => {
    if (!sortField) return [];
    return [{ id: sortField, desc: sortOrder === "desc" }];
  }, [sortField, sortOrder]);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;

    const firstSort = newSorting[0];
    if (firstSort && (firstSort.id === "name" || firstSort.id === "category")) {
      onSort(firstSort.id);
    }
  };

  const columns = useMemo<ColumnDef<Professor, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: (info) => (
          <div className="text-center">
            <Link
              to={info.row.original.lattes_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
            >
              {info.getValue()}
            </Link>
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Categoria" />
        ),
        cell: (info) => (
          <div className="text-center">
            {info
              .getValue()
              ?.replace(/^./, (match: string) => match.toUpperCase()) ||
              "Não Encontrado"}
          </div>
        ),
      }),
      columnHelper.accessor("is_admin", {
        header: () => "Administrador",
        cell: (info) => (
          <div className="text-center">
            {info.getValue() ? "Administrador" : "Usuário"}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "Ações",
        cell: (info) => (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(info.row.original)}
              title="Editar"
            >
              <SquarePenIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewProductions(info.row.original.id)}
              title="Produções"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/80"
              onClick={() => onDelete(info.row.original)}
              title="Excluir"
            >
              <UserRoundX className="h-5 w-5" />
            </Button>
          </div>
        ),
      }),
    ],
    [onViewDetails, onViewProductions, onDelete],
  );

  const renderMobileCard = (row: Row<Professor>) => {
    const professor = row.original;
    return (
      <div className="flex flex-col">
        <div className="p-4 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-base">
              <Link
                to={professor.lattes_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
              >
                {professor.name}
              </Link>
            </h3>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="capitalize">
                {professor.category || "Sem categoria"}
              </span>
              <span>•</span>
              <span>{professor.is_admin ? "Admin" : "Usuário"}</span>
            </div>
          </div>
        </div>

        <CardFooter className="flex border-t mt-auto items-stretch">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm"
            onClick={() => onViewDetails(professor)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Detalhes
          </Button>
          <div className="w-px bg-border self-stretch" />
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm"
            onClick={() => onViewProductions(professor.id)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Produções
          </Button>
          <div className="w-px bg-border self-stretch" />
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm text-destructive hover:text-destructive/80"
            onClick={() => onDelete(professor)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar docente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="permanente">Permanente</SelectItem>
              <SelectItem value="colaborador">Colaborador</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={professors}
        renderMobileCard={renderMobileCard}
        emptyMessage="Nenhum professor encontrado."
        sorting={sorting}
        onSortingChange={handleSortingChange}
        pagination={{ pageIndex: 0, pageSize: professors.length || 9999 }}
      />
    </div>
  );
}
