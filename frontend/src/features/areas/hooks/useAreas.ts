import { queryClient } from "@/lib/query-client";
import { areaService } from "@/services/modules/area.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useAreas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const {
    data,
    isLoading,
    error,
  } = useQuery<any, Error>({
    queryKey: ["areas", page, perPage, searchTerm],
    queryFn: () => areaService.fetchAreas({
      page,
      per_page: perPage,
      filter: { area: searchTerm || undefined }
    }),
    placeholderData: (prevData: any) => prevData,
  });

  const areasList = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["areas"] });
    toast.success(message);
  };

  const addAreaMutation = useMutation({
    mutationFn: areaService.createArea,
    onSuccess: () => handleSuccess("Área adicionada com sucesso!"),
    onError: () => toast.error("Erro ao adicionar área."),
  });

  const updateAreaMutation = useMutation({
    mutationFn: areaService.updateArea,
    onSuccess: () => handleSuccess("Área atualizada com sucesso!"),
    onError: () => toast.error("Erro ao atualizar área."),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: areaService.deleteArea,
    onSuccess: () => handleSuccess("Área excluída com sucesso!"),
    onError: () => toast.error("Erro ao excluir área."),
  });

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  return {
    areas: areasList,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    page,
    setPage,
    perPage,
    setPerPage: (val: number) => {
      setPerPage(val);
      setPage(1);
    },
    pagination: data || null,
    actions: {
      add: addAreaMutation,
      update: updateAreaMutation,
      remove: deleteAreaMutation,
    },
  };
}
