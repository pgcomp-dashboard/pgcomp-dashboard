import { adminService } from "@/services/modules/admin.service";
import { ApprovalRequest } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUnifiedRequests() {
  const queryClient = useQueryClient();
  const queryKey = ["unified-approval-requests"];

  const { data, isLoading, error } = useQuery<ApprovalRequest[]>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await adminService.getUnifiedRequests();
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, requestType }: { id: number; requestType: string }) =>
      adminService.approveRequest(id, requestType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      toast.success("Solicitação aprovada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao aprovar solicitação.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, requestType }: { id: number; requestType: string }) =>
      adminService.rejectRequest(id, requestType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      if (variables.requestType === "registration") {
        toast.success("Cadastro rejeitado e usuário removido.");
      } else {
        toast.success("Solicitação de admin rejeitada.");
      }
    },
    onError: () => {
      toast.error("Erro ao rejeitar solicitação.");
    },
  });

  return {
    requests: data || [],
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  };
}
