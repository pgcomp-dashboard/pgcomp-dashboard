import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { ApprovalRequest } from "@/types/user";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useMemo } from "react";
import { useUnifiedRequests } from "../hooks/useUnifiedRequests";

const columnHelper = createColumnHelper<ApprovalRequest>();

export function UnifiedApprovalTable() {
  const { requests, isLoading, error, approveMutation, rejectMutation } = useUnifiedRequests();

  const columns = useMemo<ColumnDef<ApprovalRequest, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Nome",
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("request_type", {
        header: "Tipo de Solicitação",
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="text-center capitalize">
              {val === "registration" ? "Novo Cadastro" : "Privilégio Admin"}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const request = row.original;
          const isPending = approveMutation.isPending || rejectMutation.isPending;

          return (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => approveMutation.mutate({ id: request.id, requestType: request.request_type })}
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
                disabled={isPending}
                onClick={() => rejectMutation.mutate({ id: request.id, requestType: request.request_type })}
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

  const renderMobileCard = (row: Row<ApprovalRequest>) => {
    const request = row.original;
    const isPending = approveMutation.isPending || rejectMutation.isPending;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Solicitante</Label>
          <h3 className="font-semibold text-base">{request.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <p className="font-medium">
              {request.request_type === "registration" ? "Novo Cadastro" : "Privilégio Admin"}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <p className="font-medium truncate">{request.email || "N/A"}</p>
          </div>
        </div>

        <CardFooter className="flex gap-2 pt-2 border-t p-0 mt-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isPending}
            onClick={() => approveMutation.mutate({ id: request.id, requestType: request.request_type })}
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
            disabled={isPending}
            onClick={() => rejectMutation.mutate({ id: request.id, requestType: request.request_type })}
          >
            {rejectMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Rejeitar
          </Button>
        </CardFooter>
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
      data={requests}
      renderMobileCard={renderMobileCard}
      emptyMessage="Nenhuma solicitação pendente."
    />
  );
}
