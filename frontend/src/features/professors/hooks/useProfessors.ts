import { queryClient } from "@/lib/query-client";
import { professorService } from "@/services/modules/professor.service";
import { PaginatedResponse } from "@/types/common";
import { Professor } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useProfessors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [sortField, setSortField] = useState<"name" | "category" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading, error } = useQuery<
    PaginatedResponse<Professor>,
    Error
  >({
    queryKey: [
      "professors",
      page,
      perPage,
      searchTerm,
      categoryFilter,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      professorService.fetchProfessors({
        page,
        per_page: perPage,
        filter: {
          name: searchTerm || undefined,
          category: categoryFilter === "all" ? undefined : categoryFilter,
        },
        sort: sortField
          ? `${sortOrder === "desc" ? "-" : ""}${sortField}`
          : undefined,
      }),
    placeholderData: (prevData: any) => prevData,
  });

  const professorsList = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const handleSort = (field: "name" | "category") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const counts = useMemo(() => {
    // Note: These counts are only for the current page if not provided by API totals
    return {
      permanente: professorsList.filter(
        (p: any) => p.category?.toLowerCase() === "permanente",
      ).length,
      colaborador: professorsList.filter(
        (p: any) => p.category?.toLowerCase() === "colaborador",
      ).length,
      visitante: professorsList.filter(
        (p: any) => p.category?.toLowerCase() === "visitante",
      ).length,
    };
  }, [professorsList]);

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

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleSetCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setPage(1);
  };

  return {
    professors: professorsList,
    allProfessors: professorsList,
    isLoading,
    isError: !!error,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    categoryFilter,
    setCategoryFilter: handleSetCategoryFilter,
    sortField,
    sortOrder,
    handleSort,
    counts,
    updateMutation,
    page,
    setPage,
    perPage,
    setPerPage: (val: number) => {
      setPerPage(val);
      setPage(1);
    },
    pagination: data || null,
  };
}
