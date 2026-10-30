import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
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
import { Trash } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

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
  blurNames: boolean;
  onDelete: (student: StudentRanking) => void;
}

const columnHelper = createColumnHelper<StudentRanking>();

const formatLattesUploadDate = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(new Date(date))
      .replace(',', ' às')
    : 'Não enviado';

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
  blurNames,
  onDelete,
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
        cell: (info) => (
          <div className="font-medium">
            <Link
              to={`/portal/student/productions?student=${info.row.original.user_id}`}
              className="block whitespace-nowrap text-primary hover:underline"
              style={
                blurNames
                  ? {
                      filter: "blur(6px)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }
                  : undefined
              }
            >
              {info.getValue()}
            </Link>
          </div>
        ),
      }),
      columnHelper.accessor("lattes_xml_uploaded_at", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Último envio Lattes" />
        ),
        cell: (info) => (
          <div className="whitespace-normal text-center">
            {formatLattesUploadDate(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("course_name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Curso" />
        ),
        cell: (info) => (
          <div className="truncate" title={info.getValue() ?? "Não informado"}>
            {info.getValue() ?? "Não informado"}
          </div>
        ),
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
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label={`Excluir discente ${row.original.name}`}
              title="Excluir discente"
              onClick={() => onDelete(row.original)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [blurNames, onDelete],
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
              <Link
                to={`/portal/student/productions?student=${student.user_id}`}
                className="block truncate font-semibold text-primary hover:underline"
                style={
                  blurNames
                    ? {
                        filter: "blur(6px)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }
                    : undefined
                }
              >
                {student.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                Lattes: {formatLattesUploadDate(student.lattes_xml_uploaded_at)}
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
        <div className="flex justify-end border-t pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            aria-label={`Excluir discente ${student.name}`}
            onClick={() => onDelete(student)}
          >
            <Trash className="h-4 w-4" />
            Excluir discente
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <label
            htmlFor="student-ranking-per-page"
            className="whitespace-nowrap text-sm text-muted-foreground"
          >
            Por página:
          </label>
          <select
            id="student-ranking-per-page"
            className="rounded border bg-background px-2 py-1 text-sm"
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 50, 100, 300, 500].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable
        className="[&_[data-slot=table-container]]:overflow-x-auto [&_[data-slot=table]]:table-auto [&_[data-slot=table]]:min-w-[1700px] [&_[data-slot=table-head]]:px-3 [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-cell]]:py-1 [&_[data-slot=table-head]:nth-child(2)]:w-px [&_[data-slot=table-cell]:nth-child(2)]:w-px [&_[data-slot=table-head]:nth-child(2)]:whitespace-nowrap [&_[data-slot=table-cell]:nth-child(2)]:whitespace-nowrap [&_[data-slot=table-head]_[data-slot=button]]:h-auto [&_[data-slot=table-head]_[data-slot=button]]:gap-0 [&_[data-slot=table-head]_[data-slot=button]]:whitespace-normal [&_[data-slot=table-head]_[data-slot=button]]:px-0 [&_[data-slot=table-head]_[data-slot=button]]:text-xs [&_[data-slot=table-head]_[data-slot=button]_svg]:ml-1 [&_[data-slot=table-head]_[data-slot=button]_svg]:size-3"
        desktopBreakpoint="lg"
        columns={columns}
        data={ranking}
        isLoading={isLoading}
        isFetching={isFetching}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting(updater);
          setPage(1);
        }}
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
    </div>
  );
}
