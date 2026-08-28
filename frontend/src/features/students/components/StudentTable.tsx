import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import { Area, Course } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { Student } from "@/types/user";
import {
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  Row,
} from "@tanstack/react-table";
import { Pencil, Search, Trash } from "lucide-react";
import { useMemo } from "react";

interface StudentTableProps {
  students: Student[];
  areas: Area[];
  courses: Course[];
  pagination: PaginatedResponse<Student> | null;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  search: string;
  setSearch: (search: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

const columnHelper = createColumnHelper<Student>();

export function StudentTable({
  students,
  areas,
  courses,
  pagination,
  page,
  setPage,
  perPage,
  setPerPage,
  search,
  setSearch,
  onEdit,
  onDelete,
}: StudentTableProps) {
  const getAreaName = (id: number) =>
    areas.find((a) => a.id === id)?.name || "—";
  const getCourseName = (id: number) =>
    courses.find((c) => c.id === id)?.name || "—";

  const columns = useMemo<ColumnDef<Student, any>[]>(
    () => [
      columnHelper.accessor("registration", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Matrícula" />
        ),
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
      }),
      columnHelper.accessor("email", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: (info) => (
          <div className="text-center">{info.getValue() || "—"}</div>
        ),
      }),
      columnHelper.accessor("course_id", {
        header: "Curso",
        cell: (info) => (
          <div className="text-center">{getCourseName(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor("area_id", {
        header: "Área",
        cell: (info) => (
          <div className="text-center">{getAreaName(info.getValue() ?? 0)}</div>
        ),
      }),
      columnHelper.accessor("lattes_url", {
        header: "Lattes",
        cell: (info) => {
          const url = info.getValue();
          return (
            <div className="text-center">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Lattes
                </a>
              ) : (
                "—"
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("defended_at", {
        header: "Defesa",
        cell: (info) => (
          <div className="text-center">
            {info.getValue()
              ? new Date(info.getValue()!).toLocaleDateString("pt-BR")
              : "—"}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: (info) => (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(info.row.original)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [areas, courses, onEdit, onDelete],
  );

  const paginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: perPage,
    }),
    [page, perPage],
  );

  const handlePaginationChange: OnChangeFn<any> = (updater) => {
    const nextState =
      typeof updater === "function" ? updater(paginationState) : updater;
    if (nextState.pageSize !== perPage) {
      setPerPage(nextState.pageSize);
      setPage(1);
    } else {
      setPage(nextState.pageIndex + 1);
    }
  };

  const renderMobileCard = (row: Row<Student>) => {
    const student = row.original;
    return (
      <div className="flex flex-col">
        <div className="p-4 flex flex-col gap-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground mr-2">
              #{student.registration}
            </span>
            <h3 className="font-semibold text-base">{student.name}</h3>
            {student.email && (
              <p className="text-sm text-muted-foreground mt-1">
                {student.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Curso</span>
              <p className="font-medium">{getCourseName(student.course_id)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Área</span>
              <p className="font-medium">{getAreaName(student.area_id ?? 0)}</p>
            </div>
          </div>
          {student.lattes_url && (
            <a
              href={student.lattes_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Link Lattes
            </a>
          )}
        </div>

        <CardFooter className="flex border-t mt-auto items-stretch p-0">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm"
            onClick={() => onEdit(student)}
          >
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </Button>
          <div className="w-px bg-border self-stretch" />
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-11 text-sm text-destructive hover:text-destructive"
            onClick={() => onDelete(student)}
          >
            <Trash className="h-4 w-4 mr-2" /> Deletar
          </Button>
        </CardFooter>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar estudantes..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label
              htmlFor="perPageSelect"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Por página:
            </label>
            <select
              id="perPageSelect"
              className="border rounded px-2 py-1 text-sm bg-background"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50, 100].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        pagination={paginationState}
        pageCount={pagination?.meta.last_page ?? 1}
        onPaginationChange={handlePaginationChange}
        manualPagination={true}
        manualSorting={true}
        manualFiltering={true}
        renderMobileCard={renderMobileCard}
        emptyMessage="Nenhum estudante encontrado."
      />
    </div>
  );
}
