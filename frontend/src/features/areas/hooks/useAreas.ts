import { queryClient } from "@/lib/query-client";
import { areaService } from "@/services/modules/area.service";
import { Area } from "@/types/academic";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useAreas() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: areas = [], isLoading, error } = useQuery<Area[], Error>({
    queryKey: ["areas"],
    queryFn: () => areaService.fetchAreas(),
  });

  const filteredAreas = useMemo(() => {
    if (!searchTerm.trim()) return areas;
    return areas.filter((area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [areas, searchTerm]);

  const addAreaMutation = useMutation({
    mutationFn: (area: { name: string }) => areaService.createArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área adicionada com sucesso!");
    },
    onError: () => toast.error("Erro ao adicionar área."),
  });

  const updateAreaMutation = useMutation({
    mutationFn: (area: { id: number; name: string }) => areaService.updateArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área atualizada com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar área."),
  });

  const deleteAreaMutation = useMutation({
    mutationFn: (id: number) => areaService.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área excluída com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir área."),
  });

  return {
    areas: filteredAreas,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addAreaMutation,
    updateAreaMutation,
    deleteAreaMutation,
  };
}
