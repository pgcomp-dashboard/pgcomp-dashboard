import { queryClient } from "@/lib/query-client";
import { parseApiError } from "@/services/http-client";
import {
  internationalizationService,
  myInternationalizationService,
} from "@/services/modules/internationalization.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const ACTIONS_KEY = ["intl-actions"];
const CATEGORIES_KEY = ["intl-categories"];
const DASHBOARD_KEY = ["intl-dashboard"];
const MY_ACTIONS_KEY = ["my-intl-actions"];
const MY_CATEGORIES_KEY = ["my-intl-categories"];

function useMutationWithToast<TVars>(
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

/** Coordenação: todas as ações + CRUD de categorias. */
export function useInternationalization() {
  const actionsQuery = useQuery({
    queryKey: ACTIONS_KEY,
    queryFn: internationalizationService.listActions,
  });
  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: internationalizationService.listCategories,
  });

  // Categorias mostram a contagem de ações; o dashboard depende de ambos.
  const actionKeys = [ACTIONS_KEY, CATEGORIES_KEY, DASHBOARD_KEY, MY_ACTIONS_KEY];

  return {
    actions: actionsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: actionsQuery.isLoading || categoriesQuery.isLoading,
    actionMutations: {
      update: useMutationWithToast(internationalizationService.updateAction, actionKeys, "Ação atualizada com sucesso!"),
      remove: useMutationWithToast(internationalizationService.deleteAction, actionKeys, "Ação excluída com sucesso!"),
    },
    categoryMutations: {
      add: useMutationWithToast(internationalizationService.createCategory, [CATEGORIES_KEY, MY_CATEGORIES_KEY], "Categoria cadastrada com sucesso!"),
      update: useMutationWithToast(internationalizationService.updateCategory, [CATEGORIES_KEY, MY_CATEGORIES_KEY, ACTIONS_KEY, DASHBOARD_KEY], "Categoria atualizada com sucesso!"),
      remove: useMutationWithToast(internationalizationService.deleteCategory, [CATEGORIES_KEY, MY_CATEGORIES_KEY], "Categoria excluída com sucesso!"),
    },
  };
}

export function useInternationalizationDashboard(year: number | undefined) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, year ?? "all"],
    queryFn: () => internationalizationService.getDashboard(year),
    placeholderData: (previous) => previous,
  });
}

/** Usuário logado: as próprias ações. */
export function useMyInternationalization() {
  const actionsQuery = useQuery({
    queryKey: MY_ACTIONS_KEY,
    queryFn: myInternationalizationService.listActions,
  });
  const categoriesQuery = useQuery({
    queryKey: MY_CATEGORIES_KEY,
    queryFn: myInternationalizationService.listCategories,
  });

  // Mudanças aqui também alteram o que a coordenação vê.
  const keys = [MY_ACTIONS_KEY, ACTIONS_KEY, CATEGORIES_KEY, DASHBOARD_KEY];

  return {
    actions: actionsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: actionsQuery.isLoading || categoriesQuery.isLoading,
    mutations: {
      add: useMutationWithToast(myInternationalizationService.createAction, keys, "Ação cadastrada com sucesso!"),
      update: useMutationWithToast(myInternationalizationService.updateAction, keys, "Ação atualizada com sucesso!"),
      remove: useMutationWithToast(myInternationalizationService.deleteAction, keys, "Ação excluída com sucesso!"),
    },
  };
}
