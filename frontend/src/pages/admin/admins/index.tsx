'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminService } from '@/services/modules/admin.service';
import { Professor } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';

const statusLabels = {
  approved: 'Aprovado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  notfound: 'Não Encontrado'
};

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const queryKey = ['admin-requests'];

  const {
    data,
    isLoading,
    error,
  } = useQuery<Professor[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await adminService.getAdminRequests();
      console.log(response.data)
      return response.data;
    },
    placeholderData: (prevData) => prevData,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, {status: "approved"}),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKey, (oldData: Professor[]) => {
        if (!oldData) return [];

        return oldData.map((prof) => prof.id === updatedUser.data.id ? (updatedUser.data) : prof
        );
      })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, {status: "rejected"}),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKey, (oldData: Professor[]) => {
        if (!oldData) return [];

        return oldData.map((prof) => prof.id === updatedUser.data.id ? (updatedUser.data) : prof
        );
      })
    }
  })

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
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Admins</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os pedidos para se tornar administrador do sistema.
        </p>
      </div>
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
          {
            data?.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="text-center">{admin.name}</TableCell>
                <TableCell className="text-center">{statusLabels[admin.admin_status ?? 'notfound']}</TableCell>
                <TableCell className="text-center">{formatarData(admin.admin_requested_at)}
                </TableCell>
                <TableCell className="text-center">
                  {
                    ['approved', 'rejected'].includes(admin.admin_status ?? 'notfound') ?
                      admin.approver?.name || 'Não Encontrado' :
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
                  }
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  );
}
