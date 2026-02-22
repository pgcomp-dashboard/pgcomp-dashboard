import { queryClient } from "@/lib/query-client";
import { professorService } from "@/services/modules/professor.service";
import { Professor } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useProfessors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"name" | "category" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch all professors once — no pagination, no server-side filters
  const { data, isLoading, error } = useQuery<{ data: Professor[] }, Error>({
    queryKey: ["professors"],
    queryFn: () => professorService.fetchProfessors({ paginate: "false" }),
  });

  const allProfessors = useMemo<Professor[]>(() => data?.data || [], [data]);

  // Counts always reflect the full unfiltered dataset
  const counts = useMemo(
    () => ({
      permanente: allProfessors.filter(
        (p) => p.category?.toLowerCase() === "permanente",
      ).length,
      colaborador: allProfessors.filter(
        (p) => p.category?.toLowerCase() === "colaborador",
      ).length,
      visitante: allProfessors.filter(
        (p) => p.category?.toLowerCase() === "visitante",
      ).length,
    }),
    [allProfessors],
  );

  // Client-side filter + sort
  const professors = useMemo<Professor[]>(() => {
    let list = [...allProfessors];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term));
    }

    if (categoryFilter !== "all") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    if (sortField) {
      list.sort((a, b) => {
        const aVal = (a[sortField] ?? "").toString().toLowerCase();
        const bVal = (b[sortField] ?? "").toString().toLowerCase();
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [allProfessors, searchTerm, categoryFilter, sortField, sortOrder]);

  const handleSort = (field: "name" | "category") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => professorService.deleteProfessor(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professor excluído com sucesso!");

      // Mostrar warnings se houver
      if (response.warnings && response.warnings.length > 0) {
        setTimeout(() => {
          response.warnings?.forEach((warning) => {
            toast.warning(warning, { duration: 5000 });
          });
        }, 500);
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        toast.error("Não é possível excluir usuário protegido");
      } else {
        toast.error("Erro ao excluir professor. Por favor, tente novamente.");
      }
    },
  });

  return {
    professors,
    allProfessors,
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
    perPage,
    setPerPage,
    deleteMutation,
  };
}
