import { queryClient } from "@/lib/query-client";
import { professorService } from "@/services/modules/professor.service";
import { Professor } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useProfessors() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery<Professor[], Error>({
    queryKey: ["professors"],
    queryFn: () => professorService.fetchProfessors(),
    placeholderData: (prevData) => prevData,
  });

  const filteredProfessors = useMemo(() => {
    if (!data) return [];
    return data.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const counts = useMemo(() => {
    if (!data) return { permanente: 0, colaborador: 0, visitante: 0 };
    return {
      permanente: data.filter((p) => p.category?.toLowerCase() === "permanente").length,
      colaborador: data.filter((p) => p.category?.toLowerCase() === "colaborador").length,
      visitante: data.filter((p) => p.category?.toLowerCase() === "visitante").length,
    };
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Professor> }) =>
      professorService.updateProfessor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Docente atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar docente. Por favor, tente novamente.");
    },
  });

  return {
    professors: filteredProfessors,
    allProfessors: data ?? [],
    isLoading,
    isError: !!error,
    searchTerm,
    setSearchTerm,
    counts,
    updateMutation,
  };
}
