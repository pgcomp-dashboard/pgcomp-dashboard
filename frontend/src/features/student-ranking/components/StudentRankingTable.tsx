import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { StudentRanking } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import {
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useMemo } from "react";

interface StudentRankingTableProps {
  ranking: StudentRanking[];
  isLoading: boolean;
  isFetching: boolean;
  pagination: PaginatedResponse<StudentRanking> | null;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
}

const columnHelper = createColumnHelper<StudentRanking>();

export function StudentRankingTable({
  ranking,
  isLoading,
  isFetching,
  pagination,
  page,
  perPage,
  setPage,
  setPerPage,
  sorting,
  setSorting,
}: StudentRankingTableProps) {
  const columns = useMemo<ColumnDef<StudentRanking, any>[]>(
    () => [
      columnHelper.accessor("position", {
        id: "position",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Colocação" />
        ),
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}º</div>
        ),
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor("registration", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Matrícula" />
        ),
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor("course_name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Curso" />
        ),
        cell: (info) => <div>{info.getValue() ?? "Não informado"}</div>,
      }),
      columnHelper.accessor("area_name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Área" />
        ),
        cell: (info) => <div>{info.getValue() ?? "Não informado"}</div>,
      }),
      columnHelper.accessor("productions_count", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Produções" />
        ),
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor("a1_a4_count", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="A1-A4" />
        ),
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("a1_a2_count", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="A1-A2" />
        ),
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("total_score", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Pontuação" />
        ),
        cell: (info) => (
          <div className="text-center font-bold">
            {info.getValue().toFixed(1)}
          </div>
        ),
      }),
      columnHelper.accessor("is_eligible", {
        id: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <div
            className={
              row.original.is_eligible
                ? "text-center font-medium text-green-700"
                : "text-center font-medium text-red-700"
            }
          >
            {row.original.is_eligible ? "Apto" : "Fora dos critérios"}
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={ranking}
      isLoading={isLoading}
      isFetching={isFetching}
      sorting={sorting}
      onSortingChange={setSorting}
      manualSorting
      emptyMessage="Não foram encontrados discentes"
      pagination={{ pageIndex: page - 1, pageSize: perPage }}
      pageCount={pagination?.meta.last_page ?? 0}
      manualPagination
      onPaginationChange={
        ((updater) => {
          const current = { pageIndex: page - 1, pageSize: perPage };
          const next =
            typeof updater === "function" ? updater(current) : updater;

          if (next.pageSize !== perPage) {
            setPerPage(next.pageSize);
            setPage(1);
          } else {
            setPage(next.pageIndex + 1);
          }
        }) as OnChangeFn<PaginationState>
      }
    />
  );
}
