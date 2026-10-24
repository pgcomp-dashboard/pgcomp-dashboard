import { useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/modules/admin.service';
import { AdminRequest } from '@/types/user';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAdminRequests() {
  const queryKey = [ 'admin-requests' ];
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery<AdminRequest[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await adminService.getAdminRequests({ status: 'pending' });
      return response.data;
    },
  });

  const invalidateRequests = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: [ 'admin', 'pending-summary' ] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, { status: 'approved' }),
    onSuccess: () => {
      invalidateRequests();
      toast.success('Acesso de administrador aprovado.');
    },
    onError: () => toast.error('Erro ao aprovar o pedido de acesso admin.'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, { status: 'rejected' }),
    onSuccess: () => {
      invalidateRequests();
      toast.success('Pedido de acesso admin rejeitado.');
    },
    onError: () => toast.error('Erro ao rejeitar o pedido de acesso admin.'),
  });

  return {
    data,
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  };
}
