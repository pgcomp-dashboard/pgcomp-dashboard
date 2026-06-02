import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
  getRowClassName?: (row: Row<TData>) => string;
  pagination?: PaginationState;
  pageCount?: number;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  manualPagination?: boolean; // Set to true if the backend paginates the data
  manualSorting?: boolean; // Set to true if the backend sorts the data
  manualFiltering?: boolean; // Set to true if the backend filters the data
  renderMobileCard?: (row: Row<TData>) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isFetching,
  emptyMessage,
  getRowClassName,
  pagination: controlledPagination,
  pageCount,
  onPaginationChange: controlledOnPaginationChange,
  manualPagination,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  manualSorting,
  manualFiltering,
  renderMobileCard,
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize: 10 },
  );
  const pagination = controlledPagination ?? internalPagination;
  const onPaginationChange = controlledOnPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data: data ?? [],
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    state: { sorting, columnFilters, pagination },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    manualPagination,
    manualSorting,
    manualFiltering,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {/* ── Desktop Table ─────────────────────────────── */}
      <div className="relative hidden rounded-md border md:block">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {table.getVisibleFlatColumns().map((column) => (
                    <TableCell key={column.id} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getRowClassName?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                      colSpan={table.getVisibleFlatColumns().length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile Cards ──────────────────────────────── */}
      <div className="relative md:hidden">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isLoading ? (
          // Skeleton cards
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rows.length > 0 ? (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <Card key={row.id} className={getRowClassName?.(row)}>
                <CardContent className="p-4">
                  {renderMobileCard?.(row)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────── */}
      {pagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
