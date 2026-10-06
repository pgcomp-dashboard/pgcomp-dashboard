import { queryClient } from "@/lib/query-client";
import { awardService, myAwardService } from "@/services/modules/award.service";
import { parseApiError } from "@/services/http-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const AWARDS_KEY = ["awards"];
const CATEGORIES_KEY = ["award-categories"];
const DASHBOARD_KEY = ["awards-dashboard"];

function useAwardMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
  keys: string[][],
  successMessage: string,
) {
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      toast.success(successMessage);
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useAwards() {
  const awardsQuery = useQuery({
    queryKey: AWARDS_KEY,
    queryFn: awardService.listAwards,
  });
  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: awardService.listCategories,
  });

  // Categorias mostram a contagem de prêmios; o dashboard depende de ambos.
  const awardKeys = [AWARDS_KEY, CATEGORIES_KEY, DASHBOARD_KEY];

  return {
    awards: awardsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: awardsQuery.isLoading || categoriesQuery.isLoading,
    awardActions: {
      update: useAwardMutation(awardService.updateAward, awardKeys, "Prêmio atualizado com sucesso!"),
      remove: useAwardMutation(awardService.deleteAward, awardKeys, "Prêmio excluído com sucesso!"),
    },
    categoryActions: {
      add: useAwardMutation(awardService.createCategory, [CATEGORIES_KEY], "Categoria cadastrada com sucesso!"),
      update: useAwardMutation(awardService.updateCategory, [CATEGORIES_KEY, AWARDS_KEY, DASHBOARD_KEY], "Categoria atualizada com sucesso!"),
      remove: useAwardMutation(awardService.deleteCategory, [CATEGORIES_KEY], "Categoria excluída com sucesso!"),
    },
  };
}

export function useAwardsDashboard(year: number | undefined) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, year ?? "all"],
    queryFn: () => awardService.getDashboard(year),
    placeholderData: (previous) => previous,
  });
}

const MY_AWARDS_KEY = ["my-awards"];
const MY_CATEGORIES_KEY = ["my-award-categories"];

/** Prêmios do próprio usuário logado (área do portal). */
export function useMyAwards() {
  const awardsQuery = useQuery({
    queryKey: MY_AWARDS_KEY,
    queryFn: myAwardService.listAwards,
  });
  const categoriesQuery = useQuery({
    queryKey: MY_CATEGORIES_KEY,
    queryFn: myAwardService.listCategories,
  });

  // Mudanças aqui também alteram o que a coordenação vê.
  const keys = [MY_AWARDS_KEY, AWARDS_KEY, CATEGORIES_KEY, DASHBOARD_KEY];

  return {
    awards: awardsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: awardsQuery.isLoading || categoriesQuery.isLoading,
    actions: {
      add: useAwardMutation(myAwardService.createAward, keys, "Prêmio cadastrado com sucesso!"),
      update: useAwardMutation(myAwardService.updateAward, keys, "Prêmio atualizado com sucesso!"),
      remove: useAwardMutation(myAwardService.deleteAward, keys, "Prêmio excluído com sucesso!"),
    },
  };
}
