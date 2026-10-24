import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useAdminRequests } from '@/features/professors/hooks/useAdminRequests';
import { AdminRequest } from '@/types/user';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';

const columnHelper = createColumnHelper<AdminRequest>();

export default function AdminRequestsPage() {
  const {
    data: requests = [],
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  } = useAdminRequests();
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  const columns: ColumnDef<AdminRequest, string>[] = [
    columnHelper.accessor('name', {
      header: 'Solicitante',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor((request) => request.email || '—', {
      id: 'email',
      header: 'E-mail',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor(() => '', {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={() => approveMutation.mutate(request.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1 h-4 w-4" />
              )}
              Aprovar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isProcessing}>
                  {rejectMutation.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-1 h-4 w-4" />
                  )}
                  Rejeitar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rejeitar pedido de acesso admin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O pedido de <strong>{request.name}</strong> será rejeitado.
                    Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => rejectMutation.mutate(request.id)}
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
  ];

  if (isLoading) {
    return <div className="p-10 text-center">Carregando pedidos de acesso...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-red-500">
        <AlertCircle className="h-4 w-4" />
        Erro ao carregar pedidos de acesso admin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Pedidos de acesso admin
        </h1>
        <p className="text-muted-foreground">
          Analise e aprove ou rejeite pedidos de privilégio de administrador.
        </p>
      </header>
      <DataTable
        columns={columns}
        data={requests}
        emptyMessage="Nenhum pedido de acesso admin pendente."
      />
    </div>
  );
}
