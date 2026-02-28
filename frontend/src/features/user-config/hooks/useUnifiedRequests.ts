import { adminService } from "@/services/modules/admin.service";
import { ApprovalRequest } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function useUnifiedRequests() {
  const queryClient = useQueryClient();
  const queryKey = ["unified-approval-requests"];
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

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
    onMutate: ({ id }) => setApprovingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Solicitação aprovada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao aprovar solicitação.");
    },
    onSettled: () => setApprovingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, requestType }: { id: number; requestType: string }) =>
      adminService.rejectRequest(id, requestType),
    onMutate: ({ id }) => setRejectingId(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      if (variables.requestType === "registration") {
        toast.success("Cadastro rejeitado e usuário removido.");
      } else {
        toast.success("Solicitação de admin rejeitada.");
      }
    },
    onError: () => {
      toast.error("Erro ao rejeitar solicitação.");
    },
    onSettled: () => setRejectingId(null),
  });

  return {
    requests: data || [],
    isLoading,
    error,
    approveMutation,
    rejectMutation,
    approvingId,
    rejectingId,
  };
}
