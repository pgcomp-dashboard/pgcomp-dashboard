import { qualisService } from "@/services/modules/qualis.service";
import { StratumQualis } from "@/types/academic";
import { ApiError } from "@/types/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export interface QualisFormData {
  type: string;
  code: string;
  score: number;
}

export function useQualis() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery<StratumQualis[], Error>({
    queryKey: ["qualis"],
    queryFn: () => qualisService.getAllQualis(),
    placeholderData: (prevData) => prevData,
  });

  const filteredQualis = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.code.toLowerCase().startsWith(searchTerm.trim().toLowerCase())
    );
  }, [data, searchTerm]);

  const createMutation = useMutation({
    mutationFn: (newQualis: QualisFormData) => qualisService.createQualis(newQualis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualis"] });
      toast.success("Qualis criado com sucesso!");
    },
    onError: (e: any) => {
      const error = e as ApiError;
      toast.error(error.errors?.[0]?.description || "Erro ao criar Qualis.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: QualisFormData }) =>
      qualisService.updateQualis(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualis"] });
      toast.success("Qualis atualizado com sucesso!");
    },
    onError: (e: any) => {
      const error = e as ApiError;
      toast.error(error.errors?.[0]?.description || "Erro ao atualizar Qualis.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => qualisService.deleteQualis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualis"] });
      toast.success("Qualis deletado com sucesso!");
    },
    onError: (e: any) => {
      const error = e as ApiError;
      toast.error(error.errors?.[0]?.description || "Erro ao deletar Qualis.");
    },
  });

  return {
    qualis: filteredQualis,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
