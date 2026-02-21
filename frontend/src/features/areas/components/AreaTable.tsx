import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Area } from "@/types/academic";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface AreaTableProps {
  areas: Area[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  pagination: any;
}

const columnHelper = createColumnHelper<Area>();

export function AreaTable({
  areas,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  page,
  setPage,
  perPage,
  setPerPage,
  pagination,
}: AreaTableProps) {
  const columns = useMemo<ColumnDef<Area, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Nome da Área",
        cell: (info) => (
          <div className="font-medium text-center">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("students_count", {
        header: "Alunos por Área",
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  );

  const renderMobileCard = (row: Row<Area>) => {
    const area = row.original;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Nome da Área</Label>
          <h3 className="font-semibold text-base">{area.name}</h3>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Alunos por Área
          </Label>
          <p className="font-medium">{area.students_count}</p>
        </div>

        <CardFooter className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(area)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(area)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar áreas..."
          className="pl-8 w-full sm:max-w-72"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto absolute right-0 top-0">
          <label htmlFor="perPageSelect" className="text-sm text-muted-foreground whitespace-nowrap">
            Por página:
          </label>
          <select
            id="perPageSelect"
            className="border rounded px-2 py-1 text-sm bg-background"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={areas}
        isLoading={isLoading}
        emptyMessage="Nenhuma área encontrada."
        renderMobileCard={renderMobileCard}
      />

      {/* Pagination */}
      {pagination && pagination.meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-md bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Página {pagination.meta.current_page} de {pagination.meta.last_page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.meta.last_page}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.meta.last_page}
              onClick={() => setPage(pagination.meta.last_page)}
            >
              {">>"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
