import { userService } from "@/services/modules/user.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUserApprovals() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const response = await userService.getPendingApprovals({ paginate: "false" });
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (userId: number) => userService.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast.success("Usuário aprovado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao aprovar usuário.");
    },
  });

  return {
    users: data || [],
    isLoading,
    error,
    approveMutation,
  };
}
