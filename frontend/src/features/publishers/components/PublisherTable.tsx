import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { CheckCircle, Info, Pencil, SquarePenIcon, Trash } from "lucide-react";
import { useMemo, useState } from "react";

interface PublisherTableProps {
  publishers: Publisher[];
  pagination: PaginatedResponse<Publisher> | null;
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
  onApprove: (publisher: Publisher) => void;
  onPageChange: (page: number) => void;
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  showApprove?: boolean;
}

const columnHelper = createColumnHelper<Publisher>();

const MobileCardIssnList = ({ issns }: { issns: string[] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!issns?.length) return <span>—</span>;
  if (issns.length <= 2) return <span>{issns.join(", ")}</span>;

  if (expanded) {
    return (
      <div className="flex flex-col gap-1 mt-1 bg-background border p-2 rounded-md w-full">
        {issns.map((issn, idx) => (
          <span key={idx} className="text-xs bg-muted/50 px-2 py-1 rounded">
            {issn}
          </span>
        ))}
        <button
          className="text-primary text-xs font-semibold self-start hover:underline mt-1 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          Ocultar lista
        </button>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      {issns.slice(0, 2).join(", ")}
      <span className="text-muted-foreground text-xs">
        (+{issns.length - 2})
      </span>
      <button
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <Info className="w-3.5 h-3.5 mt-0.5" />
      </button>
    </span>
  );
};

export function PublisherTable({
  publishers,
  pagination,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  onApprove,
  onPageChange,
  sorting,
  onSortingChange,
  perPage,
  onPerPageChange,
  showApprove,
}: PublisherTableProps) {
  const columns = useMemo<ColumnDef<Publisher, any>[]>(
    () => [
      columnHelper.accessor((row) => row, {
        id: "initials",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ISSN/Sigla" />
        ),
        cell: (info) => {
          const publisher = info.getValue();
          if (publisher.publisher_type !== "journal") {
            return (
              <div className="text-center">{publisher.initials || "—"}</div>
            );
          }

          const issns = publisher.issns || [];
          if (issns.length === 0) return <div className="text-center">—</div>;

          if (issns.length <= 2) {
            return <div className="text-center">{issns.join(", ")}</div>;
          }

          return (
            <div className="text-center flex items-center justify-center gap-1">
              <span>
                {issns.slice(0, 2).join(", ")} (+{issns.length - 2})
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1 text-sm">
                      {issns.map((issn: string, idx: number) => (
                        <span key={idx}>{issn}</span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: (info) => (
          <div className="capitalize text-justify max-w-[500px] min-w-[200px] whitespace-normal break-words mx-auto">
            {info.getValue().toLowerCase()}
          </div>
        ),
      }),
      columnHelper.accessor("publisher_type", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Veículo" />
        ),
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
      columnHelper.accessor((row) => row.stratum_qualis?.code, {
        id: "qualis_code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Qualis" />
        ),
        cell: (info) => (
          <div className="text-center">{info.getValue() || "—"}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex justify-center gap-1">
            {showApprove && !info.row.original.is_approved && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onApprove(info.row.original)}
                title="Aprovar"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
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
    [onEdit, onDelete, onApprove, showApprove],
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

    if (nextState.pageSize !== perPage) {
      onPerPageChange(nextState.pageSize);
    } else {
      onPageChange(nextState.pageIndex + 1);
    }
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
            {publisher.publisher_type === "journal" ? (
              <MobileCardIssnList issns={publisher.issns || []} />
            ) : (
              publisher.initials || "—"
            )}
          </div>
        </div>
        <CardFooter className="flex border-t items-stretch flex-wrap">
          {showApprove && !publisher.is_approved && (
            <>
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-11 text-sm text-green-600 hover:text-green-700"
                onClick={() => onApprove(publisher)}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
              </Button>
              <div className="w-px bg-border self-stretch hidden sm:block" />
            </>
          )}
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
