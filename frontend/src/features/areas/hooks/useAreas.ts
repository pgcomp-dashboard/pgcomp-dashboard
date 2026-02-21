import { queryClient } from "@/lib/query-client";
import { areaService } from "@/services/modules/area.service";
import { Area } from "@/types/academic";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useAreas() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: areas = [],
    isLoading,
    error,
  } = useQuery<Area[], Error>({
    queryKey: ["areas"],
    queryFn: () => areaService.fetchAreas({ per_page: 100 }),
  });

  const filteredAreas = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return areas;
    return areas.filter((area) => area.name.toLowerCase().includes(term));
  }, [areas, searchTerm]);

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

  return {
    areas: filteredAreas,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    actions: {
      add: addAreaMutation,
      update: updateAreaMutation,
      remove: deleteAreaMutation,
    },
  };
}
