import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { useUserApprovals } from "@/features/user-config/hooks/useUserApprovals";
import { User } from "@/types/user";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useMemo } from "react";

const columnHelper = createColumnHelper<User>();

export default function UserApprovalPage() {
  const { users, isLoading, error, approveMutation } = useUserApprovals();

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Nome",
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("email", {
        header: "E-mail",
        cell: (info) => (
          <div className="text-center">{info.getValue() || "N/A"}</div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Tipo",
        cell: (info) => (
          <div className="text-center capitalize">{info.getValue()}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(user.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Aprovar
              </Button>
            </div>
          );
        },
      }),
    ],
    [approveMutation],
  );

  const renderMobileCard = (row: Row<User>) => {
    const user = row.original;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Usuário</Label>
          <h3 className="font-semibold text-base">{user.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <p className="font-medium truncate">{user.email || "N/A"}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <p className="font-medium capitalize">{user.type}</p>
          </div>
        </div>

        <CardFooter className="flex gap-2 pt-2 border-t p-0 mt-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={approveMutation.isPending}
            onClick={() => approveMutation.mutate(user.id)}
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Aprovar
          </Button>
        </CardFooter>
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Carregando aprovações...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 flex items-center justify-center p-10">
        <AlertCircle className="mr-2" /> Erro ao carregar dados.
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Aprovação de Cadastros
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os novos usuários que se cadastraram no sistema e aguardam liberação.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={users}
        renderMobileCard={renderMobileCard}
        emptyMessage="Nenhum cadastro pendente de aprovação."
      />
    </div>
  );
}
