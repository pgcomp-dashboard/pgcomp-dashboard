import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

export function UnifiedApprovalTable({
  userType,
}: {
  userType?: "student" | "professor";
}) {
  const {
    requests,
    isLoading,
    error,
    approveMutation,
    rejectMutation,
    approvingId,
    rejectingId,
  } = useUnifiedRequests();
  const visibleRequests = userType
    ? requests.filter(
        (request) =>
          request.type === userType && request.request_type === "registration",
      )
    : requests;
  const showStudentDetails = userType === "student";
  const isAnyPending = approvingId !== null || rejectingId !== null;

  const columns = useMemo<ColumnDef<ApprovalRequest, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Nome",
        cell: (info) => (
          <div className="text-center font-medium">{info.getValue()}</div>
        ),
      }),
      ...(showStudentDetails
        ? [
            columnHelper.accessor("email", {
              header: "E-mail",
              cell: (info) => (
                <div
                  className="max-w-56 truncate text-center"
                  title={info.getValue()}
                >
                  {info.getValue() || "—"}
                </div>
              ),
            }),
            columnHelper.accessor("registration", {
              header: "Matrícula",
              cell: (info) => (
                <div className="text-center">{info.getValue() ?? "—"}</div>
              ),
            }),
            columnHelper.accessor("advisor", {
              header: "Orientador",
              cell: (info) => (
                <div
                  className="max-w-48 truncate text-center"
                  title={info.getValue() ?? "—"}
                >
                  {info.getValue() ?? "—"}
                </div>
              ),
            }),
          ]
        : []),
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
          const isApprovingThis = approvingId === request.id;
          const isRejectingThis = rejectingId === request.id;

          return (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                disabled={isAnyPending}
                onClick={() =>
                  approveMutation.mutate({
                    id: request.id,
                    requestType: request.request_type,
                  })
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isApprovingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Aprovar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isAnyPending}
                  >
                    {isRejectingThis ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Rejeitar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja rejeitar a solicitação de{" "}
                      <strong>{request.name}</strong>? Esta ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() =>
                        rejectMutation.mutate({
                          id: request.id,
                          requestType: request.request_type,
                        })
                      }
                    >
                      Rejeitar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        },
      }),
    ],
    [
      approveMutation,
      rejectMutation,
      approvingId,
      rejectingId,
      isAnyPending,
      showStudentDetails,
    ],
  );

  const renderMobileCard = (row: Row<ApprovalRequest>) => {
    const request = row.original;
    const isApprovingThis = approvingId === request.id;
    const isRejectingThis = rejectingId === request.id;

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
              {request.request_type === "registration"
                ? "Novo Cadastro"
                : "Privilégio Admin"}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <p className="font-medium truncate">{request.email || "N/A"}</p>
          </div>
          {showStudentDetails && request.type === "student" && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Matrícula
                </Label>
                <p className="font-medium">{request.registration ?? "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Orientador
                </Label>
                <p className="font-medium truncate">
                  {request.advisor || "Não informado"}
                </p>
              </div>
            </>
          )}
        </div>

        <CardFooter className="flex gap-2 pt-2 border-t p-0 mt-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isAnyPending}
            onClick={() =>
              approveMutation.mutate({
                id: request.id,
                requestType: request.request_type,
              })
            }
          >
            {isApprovingThis ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Aprovar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isAnyPending}
              >
                {isRejectingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Rejeitar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja rejeitar a solicitação de{" "}
                  <strong>{request.name}</strong>? Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    rejectMutation.mutate({
                      id: request.id,
                      requestType: request.request_type,
                    })
                  }
                >
                  Rejeitar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
      data={visibleRequests}
      renderMobileCard={renderMobileCard}
      emptyMessage="Nenhuma solicitação pendente."
    />
  );
}
