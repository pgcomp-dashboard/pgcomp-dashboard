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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminRequests } from '@/features/professors/hooks/useAdminRequests';
import { AdminRequest } from '@/types/user';
import { AlertCircle, Check, Loader2, ShieldPlus, X } from 'lucide-react';

function RequestActions({
  request,
  isProcessing,
  isApproving,
  isRejecting,
  mobile = false,
  onApprove,
  onReject,
}: {
  request: AdminRequest;
  isProcessing: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  mobile?: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className={
        mobile
          ? 'grid grid-cols-2 gap-2 border-t pt-3'
          : 'flex items-center justify-end gap-2'
      }
    >
      <Button
        size="sm"
        disabled={isProcessing}
        onClick={onApprove}
        className={
          mobile
            ? 'h-10 w-full bg-green-600 hover:bg-green-700'
            : 'h-9 min-w-24 bg-green-600 hover:bg-green-700'
        }
      >
        {isApproving ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-1 h-4 w-4" />
        )}
        Aprovar
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isProcessing}
            className={mobile ? 'h-10 w-full' : 'h-9 min-w-24'}
          >
            {isRejecting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-1 h-4 w-4" />
            )}
            Rejeitar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Rejeitar pedido de acesso admin?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O pedido de <strong>{request.name}</strong> será rejeitado. Essa
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onReject}
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminRequestsPage() {
  const {
    data: requestData,
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  } = useAdminRequests();
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;
  const requests: AdminRequest[] = Array.isArray(requestData)
    ? requestData
    : [];

  const renderMobileCard = (request: AdminRequest) => (
    <Card key={request.id} className="w-full min-w-0">
      <CardContent className="p-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Solicitante
              </p>
              <h2 className="break-words font-semibold">{request.name}</h2>
            </div>
          </div>
          <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">E-mail</p>
            <p className="break-all text-sm">{request.email || '—'}</p>
          </div>
          <RequestActions
            request={request}
            isProcessing={isProcessing}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
            mobile
            onApprove={() => approveMutation.mutate(request.id)}
            onReject={() => rejectMutation.mutate(request.id)}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-10 text-center">Carregando pedidos de acesso...</div>
    );
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex items-start gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
          <ShieldPlus className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Pedidos de acesso admin
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Analise e aprove ou rejeite pedidos de privilégio de administrador.
          </p>
        </div>
      </header>
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 pl-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Solicitante
              </TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                E-mail
              </TableHead>
              <TableHead className="h-12 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length ? (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <ShieldPlus className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{request.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {request.email || '—'}
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <RequestActions
                      request={request}
                      isProcessing={isProcessing}
                      isApproving={approveMutation.isPending}
                      isRejecting={rejectMutation.isPending}
                      onApprove={() => approveMutation.mutate(request.id)}
                      onReject={() => rejectMutation.mutate(request.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-32 text-center text-muted-foreground"
                >
                  Nenhum pedido de acesso admin pendente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex min-w-0 flex-col gap-3 md:hidden">
        {requests.length ? (
          requests.map(renderMobileCard)
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-xl border px-4 text-center text-sm text-muted-foreground">
            Nenhum pedido de acesso admin pendente.
          </div>
        )}
      </div>
    </div>
  );
}
