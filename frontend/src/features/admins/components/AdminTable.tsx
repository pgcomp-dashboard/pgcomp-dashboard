import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAdminRequests } from '../hooks/useAdminRequests';

const statusLabels = {
  approved: 'Aprovado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  notfound: 'Não Encontrado'
} as const;

export function AdminTable() {
  const { data, isLoading, error, approveMutation, rejectMutation } = useAdminRequests();

  const formatarData = (dataIso: string | null) => {
    if (!dataIso) return 'Não encontrado';

    return new Date(dataIso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="animate-spin mr-2" /> Carregando solicitações...
    </div>
  );

  if (error) return (
    <div className="text-red-500 flex items-center p-10">
      <AlertCircle className="mr-2" /> Erro ao carregar dados.
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Nome</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Data de solicitação</TableHead>
          <TableHead className="text-center">Analisado Por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell className="text-center">{admin.name}</TableCell>
            <TableCell className="text-center">{statusLabels[admin.admin_status ?? 'notfound']}</TableCell>
            <TableCell className="text-center">{formatarData(admin.admin_requested_at)}</TableCell>
            <TableCell className="text-center">
              {['approved', 'rejected'].includes(admin.admin_status ?? 'notfound') ? (
                admin.approver?.name || 'Não Encontrado'
              ) : (
                <div className="flex gap-2 justify-center">
                  <Button
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(admin.id)}
                  >
                    {approveMutation.isPending ? '...' : 'Aprovar'}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(admin.id)}
                  >
                    {rejectMutation.isPending ? '...' : 'Rejeitar'}
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
