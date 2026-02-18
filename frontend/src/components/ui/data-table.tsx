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
  manualSorting?: boolean; // Set to true if the backend sort the data
  manualFiltering?: boolean; // Set to true if the backend filter the data
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
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    },
  );
  const pagination = controlledPagination ?? internalPagination;
  const onPaginationChange =
    controlledOnPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data: data ?? [],
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onPaginationChange,
    manualPagination,
    onSortingChange,
    onColumnFiltersChange,
    manualSorting, // If true, table won't sort data internally
    manualFiltering, // If true, table won't filter data internally
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // client-side sorting
    getFilteredRowModel: getFilteredRowModel(), // client-side filtering
  });

  const showSkeletons = isLoading || data === undefined;

  return (
    <div className="space-y-4">
      <div className="relative rounded-md border">
        {/* Background Overlay */}
        {isFetching && !showSkeletons && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showSkeletons ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-t">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getRowClassName?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
