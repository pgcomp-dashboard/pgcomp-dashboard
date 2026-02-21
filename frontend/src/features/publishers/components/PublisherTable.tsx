import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { ColumnDef, createColumnHelper, PaginationState, SortingState } from "@tanstack/react-table";
import { Pencil, SquarePenIcon, Trash } from "lucide-react";
import { useMemo } from "react";

interface PublisherTableProps {
  publishers: Publisher[];
  pagination: PaginatedResponse<Publisher> | null;
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  onPageChange: (page: number) => void;
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
}

const columnHelper = createColumnHelper<Publisher>();

export function PublisherTable({
  publishers,
  pagination,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  onPageChange,
  sorting,
  onSortingChange,
}: PublisherTableProps) {
  const columns = useMemo<ColumnDef<Publisher, any>[]>(
    () => [
      columnHelper.accessor((row) => row, {
        id: "issn_sigla",
        header: () => <div className="text-center">ISSN/Sigla</div>,
        cell: (info) => {
          const publisher = info.getValue();
          return (
            <div className="text-center">
              {publisher.publisher_type === "journal"
                ? publisher.issn || "—"
                : publisher.initials || "—"}
            </div>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: () => <div className="text-center">Nome</div>,
        cell: (info) => (
          <div className="capitalize text-justify max-w-[500px] min-w-[200px] whitespace-normal break-words mx-auto">
            {info.getValue().toLowerCase()}
          </div>
        ),
      }),
      columnHelper.accessor("publisher_type", {
        header: () => <div className="text-center">Veículo</div>,
        cell: (info) => (
          <div className="text-center">
            {info.getValue() === "journal"
              ? "Periódico"
              : info.getValue() === "conference"
                ? "Conferência"
                : info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("stratum_qualis.code", {
        header: () => <div className="text-center">Qualis</div>,
        cell: (info) => (
          <div className="text-center">{info.getValue() || "—"}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-center w-25">Ações</div>,
        cell: (info) => (
          <div className="flex justify-center gap-1">
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
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const paginationState: PaginationState = useMemo(() => {
    return {
      pageIndex: (pagination?.meta.current_page ?? 1) - 1,
      pageSize: pagination?.meta.per_page ?? 10,
    };
  }, [pagination]);

  const handlePaginationChange = (updater: any) => {
    const nextState =
      typeof updater === "function" ? updater(paginationState) : updater;
    onPageChange(nextState.pageIndex + 1);
  };

  const renderMobileCard = (row: any) => {
    const publisher = row.original as Publisher;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="font-semibold">{publisher.name}</div>
          <div className="text-sm bg-muted px-2 py-1 rounded">
            {publisher.stratum_qualis?.code || "—"}
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          <div>
            <span className="font-medium">Tipo:</span>{" "}
            {publisher.publisher_type === "journal"
              ? "Periódico"
              : "Conferência"}
          </div>
          <div>
            <span className="font-medium">
              {publisher.publisher_type === "journal" ? "ISSN" : "Sigla"}:
            </span>{" "}
            {publisher.publisher_type === "journal"
              ? publisher.issn || "—"
              : publisher.initials || "—"}
          </div>
        </div>
        <CardFooter className="flex border-t items-stretch">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm"
            onClick={() => onEdit(publisher)}
          >
            <SquarePenIcon className="h-4 w-4 mr-2" /> Editar
          </Button>
          <div className="w-px bg-border self-stretch" />
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm text-destructive hover:text-destructive"
            onClick={() => onDelete(publisher)}
          >
            <Trash className="h-4 w-4 mr-2" /> Deletar
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={publishers}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={paginationState}
      pageCount={pagination?.meta.last_page ?? 1}
      onPaginationChange={handlePaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualPagination={true}
      manualSorting={true}
      renderMobileCard={renderMobileCard}
      emptyMessage="Nenhum registro encontrado."
    />
  );
}
