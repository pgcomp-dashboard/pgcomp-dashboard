import { queryClient } from "@/lib/query-client";
import { STATUS_CREATED_MESSAGE } from "@/features/defense-requests/types";
import { defenseRequestService } from "@/services/modules/defense-request.service";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FORMS_KEY = ["defense-request-forms"];
const MINE_KEY = ["defense-requests", "mine"];
const ALL_KEY = ["defense-requests", "all"];

export function useDefenseRequestForms() {
  return useQuery({
    queryKey: FORMS_KEY,
    queryFn: defenseRequestService.listForms,
    staleTime: Infinity,
  });
}

export function useMyDefenseRequests() {
  const list = useQuery({ queryKey: MINE_KEY, queryFn: defenseRequestService.listMine });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["defense-requests"] });
  // O wizard mostra o erro no lugar certo; aqui só atualiza a lista (pode ter mudado por fora).
  const onError = () => refresh();

  const create = useMutation({
    mutationFn: defenseRequestService.create,
    meta: { skipGlobalErrorToast: true },
    onSuccess: (request) => {
      refresh();
      toast.success(STATUS_CREATED_MESSAGE[request.status](request));
    },
    onError,
  });

  const review = useMutation({
    mutationFn: defenseRequestService.review,
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      refresh();
      toast.success("Solicitação revisada e enviada à coordenação!");
    },
    onError,
  });

  return { requests: list.data ?? [], isLoading: list.isLoading, isError: list.isError, refetch: list.refetch, create, review, refresh };
}

export function useAllDefenseRequests() {
  const list = useQuery({ queryKey: ALL_KEY, queryFn: defenseRequestService.listAll });
  return { requests: list.data ?? [], isLoading: list.isLoading, isError: list.isError, refetch: list.refetch };
}

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Discentes para o autocompletar (sem busca: os orientandos de quem está logado). */
export function useStudentLookup(q: string, enabled = true) {
  const term = useDebounced(q.trim());
  return useQuery({
    queryKey: ["defense-lookup", "students", term],
    queryFn: () => defenseRequestService.lookupStudents(term),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Membros de banca: docentes do PGCOMP e externos de bancas anteriores. */
export function useMemberLookup(q: string, enabled = true) {
  const term = useDebounced(q.trim());
  return useQuery({
    queryKey: ["defense-lookup", "members", term],
    queryFn: () => defenseRequestService.lookupMembers(term),
    placeholderData: keepPreviousData,
    enabled,
  });
}
