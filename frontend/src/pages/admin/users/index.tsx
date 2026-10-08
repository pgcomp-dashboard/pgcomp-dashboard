import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import { AdminUserEditor } from "@/features/users/components/AdminUserEditor";
import { parseApiError } from "@/services/http-client";
import { areaService } from "@/services/modules/area.service";
import { courseService } from "@/services/modules/course.service";
import { userService } from "@/services/modules/user.service";
import { ApiError } from "@/types/common";
import { AdminUser, AdminUserUpdate } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  PaginationState,
  Row,
} from "@tanstack/react-table";
import { Pencil, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;
const columnHelper = createColumnHelper<AdminUser>();

function userTypeLabel(type: AdminUser["type"]) {
  if (type === "student") return "Discente";
  if (type === "professor") return "Docente";
  return "Administrador";
}

function getApiFieldError(error: unknown, field: string): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const apiError = error as unknown as ApiError;
  return apiError.fieldErrors?.[field]?.[0];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () =>
      userService.getAdminUsers({
        page,
        per_page: PAGE_SIZE,
        ...(search.trim() ? { filter: { name: search.trim() } } : {}),
      }),
  });

  const coursesQuery = useQuery({
    queryKey: ["admin-user-edit-courses"],
    queryFn: () => courseService.fetchCourses({ per_page: 100 }),
  });

  const areasQuery = useQuery({
    queryKey: ["admin-user-edit-areas"],
    queryFn: async () => (await areaService.fetchAreas({ per_page: 100 })).data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdate }) =>
      userService.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
      toast.success("Usuário atualizado com sucesso.");
    },
    onError: (error) => toast.error(parseApiError(error)),
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      type,
      isAdminRequest,
    }: {
      id: number;
      type: AdminUser["type"];
      isAdminRequest?: boolean;
    }) => {
      if (isAdminRequest) return userService.approveAdminRequest(id);
      return type === "student"
        ? userService.approveRegistration(id)
        : userService.approveUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      setSelectedUser(null);
      toast.success("Docente aprovado com sucesso.");
    },
    onError: (error) => toast.error(parseApiError(error)),
  });

  const emailServerError = getApiFieldError(updateMutation.error, "email");
  const saveError =
    updateMutation.error && !emailServerError
      ? parseApiError(updateMutation.error)
      : undefined;

  const columns = useMemo<ColumnDef<AdminUser, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nome" />
        ),
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      }),
      columnHelper.accessor("email", {
        header: "E-mail",
        cell: (info) => <div>{info.getValue() || "—"}</div>,
      }),
      columnHelper.accessor("type", {
        header: "Tipo",
        cell: (info) => <div>{userTypeLabel(info.getValue())}</div>,
      }),
      columnHelper.accessor("category", {
        header: "Categoria",
        cell: (info) => <div>{info.getValue() || "—"}</div>,
      }),
      columnHelper.accessor("is_approved", {
        header: "Aprovação",
        cell: (info) => (
          <div
            className={
              info.getValue()
                ? "font-medium text-green-700"
                : "font-medium text-amber-700"
            }
          >
            {info.getValue() ? "Aprovado" : "Pendente"}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              title={`Editar ${row.original.name}`}
              onClick={() => setSelectedUser(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const renderMobileCard = (row: Row<AdminUser>) => {
    const user = row.original;
    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email || "—"}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>{userTypeLabel(user.type)}</span>
          <span>{user.category || "Sem categoria"}</span>
          <span>{user.is_approved ? "Aprovado" : "Pendente"}</span>
        </div>
        <Button variant="outline" onClick={() => setSelectedUser(user)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar usuário
        </Button>
      </div>
    );
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const current = { pageIndex: page - 1, pageSize: PAGE_SIZE };
    const next = typeof updater === "function" ? updater(current) : updater;
    setPage(next.pageIndex + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Usuários
        </h1>
        <p className="mt-1 text-muted-foreground">
          Consulte e edite os dados das contas cadastradas.
        </p>
      </header>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pelo nome"
          className="pl-9"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {usersQuery.error ? (
        <p className="text-destructive">{parseApiError(usersQuery.error)}</p>
      ) : (
        <DataTable
          columns={columns}
          data={usersQuery.data?.data ?? []}
          isLoading={usersQuery.isLoading}
          isFetching={usersQuery.isFetching}
          emptyMessage="Nenhum usuário encontrado."
          pagination={{ pageIndex: page - 1, pageSize: PAGE_SIZE }}
          pageCount={usersQuery.data?.meta.last_page ?? 1}
          manualPagination
          onPaginationChange={handlePaginationChange}
          renderMobileCard={renderMobileCard}
        />
      )}

      <AdminUserEditor
        user={selectedUser}
        areas={areasQuery.data ?? []}
        courses={coursesQuery.data ?? []}
        isSaving={updateMutation.isPending}
        isApproving={approveMutation.isPending}
        emailServerError={emailServerError}
        saveError={saveError}
        onEmailChange={updateMutation.reset}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        onSave={(data) => {
          if (selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, data });
          }
        }}
        onApprove={(id, isAdminRequest) => {
          if (selectedUser) {
            approveMutation.mutate({
              id,
              type: selectedUser.type,
              isAdminRequest,
            });
          }
        }}
      />
    </div>
  );
}
