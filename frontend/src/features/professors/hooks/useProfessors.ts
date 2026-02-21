import { queryClient } from "@/lib/query-client";
import { professorService } from "@/services/modules/professor.service";
import { Professor } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useProfessors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "category" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading, error } = useQuery<Professor[], Error>({
    queryKey: ["professors"],
    queryFn: () => professorService.fetchProfessors({ per_page: 1000 }),
    placeholderData: (prevData) => prevData,
  });

  const handleSort = (field: "name" | "category") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredProfessors = useMemo(() => {
    if (!data) return [];
    let result = data.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = (sortField === "name" ? a.name : a.category) || "";
        const valB = (sortField === "name" ? b.name : b.category) || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return result;
  }, [data, searchTerm, categoryFilter, sortField, sortOrder]);

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
    categoryFilter,
    setCategoryFilter,
    sortField,
    sortOrder,
    handleSort,
    counts,
    updateMutation,
  };
}
