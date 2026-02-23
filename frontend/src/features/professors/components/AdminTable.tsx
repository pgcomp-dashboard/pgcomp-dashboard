import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { AdminRequest } from "@/types/user";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useMemo } from "react";
import { useAdminRequests } from "../hooks/useAdminRequests";

const statusLabels = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
  notfound: "Não Encontrado",
} as const;

const formatarData = (dataIso: string | null) => {
  if (!dataIso) return "Manual";

  return new Date(dataIso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const columnHelper = createColumnHelper<AdminRequest>();

export function AdminTable() {
  const { data, isLoading, error, approveMutation, rejectMutation } =
    useAdminRequests();

  const columns = useMemo<ColumnDef<AdminRequest, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Nome",
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("admin_status", {
        header: "Status",
        cell: (info) => (
          <div className="text-center">
            {
              statusLabels[
                (info.getValue() as keyof typeof statusLabels) || "notfound"
              ]
            }
          </div>
        ),
      }),
      columnHelper.accessor("admin_requested_at", {
        header: "Data de solicitação",
        cell: (info) => (
          <div className="text-center">{formatarData(info.getValue())}</div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Analisado Por / Ações",
        cell: ({ row }) => {
          const admin = row.original;
          if (
            ["approved", "rejected"].includes(admin.admin_status ?? "notfound")
          ) {
            return (
              <div className="text-center text-muted-foreground">
                {admin.approver?.name || "Não Encontrado"}
              </div>
            );
          }
          return (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(admin.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Aprovar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(admin.id)}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Rejeitar
              </Button>
            </div>
          );
        },
      }),
    ],
    [approveMutation, rejectMutation],
  );

  const renderMobileCard = (row: Row<AdminRequest>) => {
    const admin = row.original;
    const isProcessed = ["approved", "rejected"].includes(
      admin.admin_status ?? "notfound",
    );

    return (
      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Solicitante</Label>
          <h3 className="font-semibold text-base">{admin.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <p className="font-medium">
              {
                statusLabels[
                  (admin.admin_status as keyof typeof statusLabels) ||
                    "notfound"
                ]
              }
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Data</Label>
            <p className="font-medium">
              {formatarData(admin.admin_requested_at)}
            </p>
          </div>
        </div>

        {isProcessed ? (
          <div>
            <Label className="text-xs text-muted-foreground">
              Analisado Por
            </Label>
            <p className="font-medium">
              {admin.approver?.name || "Não Encontrado"}
            </p>
          </div>
        ) : (
          <CardFooter className="flex gap-2 pt-2 border-t p-0 mt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate(admin.id)}
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Aprovar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(admin.id)}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Rejeitar
            </Button>
          </CardFooter>
        )}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin mr-2" /> Carregando solicitações...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 flex items-center justify-center p-10">
        <AlertCircle className="mr-2" /> Erro ao carregar dados.
      </div>
    );

  return (
    <DataTable
      columns={columns}
      data={data || []}
      renderMobileCard={renderMobileCard}
      emptyMessage="Nenhuma solicitação encontrada."
    />
  );
}
