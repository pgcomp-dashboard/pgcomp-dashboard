import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { StudentRanking } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import {
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  PaginationState,
  Row,
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
      ...(
        ["ja1", "ja2", "ja3", "ja4", "ca1", "ca2", "ca3", "ca4"] as const
      ).map((field) =>
        columnHelper.accessor(field, {
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title={`#${field.toUpperCase()}`}
            />
          ),
          cell: (info) => (
            <div className="text-center font-medium">{info.getValue()}</div>
          ),
        }),
      ),
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

  const renderMobileCard = (row: Row<StudentRanking>) => {
    const student = row.original;

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-2xl font-bold text-primary">
              {student.position}º
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">
                {student.registration ?? "Matrícula não informada"}
              </p>
            </div>
          </div>
          <span
            className={
              student.is_eligible
                ? "shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-800"
                : "shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-medium text-red-800"
            }
          >
            {student.is_eligible ? "Apto" : "Fora dos critérios"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Curso
            </span>
            <span className="max-w-[65%] text-right font-medium">
              {student.course_name ?? "Não informado"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {(
              ["ja1", "ja2", "ja3", "ja4", "ca1", "ca2", "ca3", "ca4"] as const
            ).map((field) => (
              <div
                key={field}
                className="rounded-md border border-border/50 bg-background p-2 text-center"
              >
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                  #{field.toUpperCase()}
                </span>
                <span className="font-bold">{student[field]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pontuação
          </span>
          <span className="text-lg font-black text-primary">
            {student.total_score.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

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
      renderMobileCard={renderMobileCard}
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
