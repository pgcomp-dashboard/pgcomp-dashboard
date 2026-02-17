import { queryClient } from '@/lib/query-client';
import { adminService } from '@/services/modules/admin.service';
import { Professor } from '@/types/user';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useAdminRequests() {
  const queryKey = ['admin-requests'];

  const {
    data,
    isLoading,
    error,
  } = useQuery<Professor[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await adminService.getAdminRequests();
      return response.data;
    },
    placeholderData: (prevData) => prevData,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, { status: "approved" }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKey, (oldData: Professor[]) => {
        if (!oldData) return [];
        return oldData.map((prof) => prof.id === updatedUser.data.id ? updatedUser.data : prof);
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminService.avaliateAdminRequest(id, { status: "rejected" }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKey, (oldData: Professor[]) => {
        if (!oldData) return [];
        return oldData.map((prof) => prof.id === updatedUser.data.id ? updatedUser.data : prof);
      });
    }
  });

  return {
    data,
    isLoading,
    error,
    approveMutation,
    rejectMutation
  };
}
