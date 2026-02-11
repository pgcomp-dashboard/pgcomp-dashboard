import { userService } from "@/services/modules/user.service";
import { normalizeUser } from "@/utils/auth-utils";
import { useQuery } from "@tanstack/react-query";

export function useUser(enabled: boolean) {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      return await userService.getUser();
    },
    enabled: enabled,
    retry: false,
    // Normaliza os dados aqui!
    select: (data) => normalizeUser(data),
  });
}
