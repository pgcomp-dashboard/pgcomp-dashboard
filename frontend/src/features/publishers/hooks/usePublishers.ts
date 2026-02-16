import { FilterItem, transformFilters } from "@/lib/utils";
import { publisherService } from "@/services/modules/publisher.service";
import { qualisService } from "@/services/modules/qualis.service";
import { Publisher, StratumQualis } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function usePublishers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [qualisFilter, setQualisFilter] = useState("all");

  const { data: qualisOptions = [] } = useQuery<StratumQualis[], Error>({
    queryKey: ["qualis-options"],
    queryFn: () => qualisService.getAllQualis(),
  });

  const { data: publishersData, isLoading, isError } = useQuery<PaginatedResponse<Publisher>, Error>({
    queryKey: ["publishers", page, perPage, search, typeFilter, qualisFilter],
    queryFn: async () => {
      const filterList: FilterItem[] = [];

      if (search.trim()) {
        filterList.push({ field: 'name', value: search.trim(), operator: 'like' });
      }

      if (typeFilter !== 'all') {
        filterList.push({ field: 'publisher_type', value: typeFilter, operator: '=' });
      }

      if (qualisFilter !== 'all') {
        filterList.push({ field: 'qualis_code', value: qualisFilter, operator: '=' });
      }

      const filters = transformFilters(filterList);
      const response = await publisherService.getAllPublishers(page, perPage, filters);

      return {
        ...response,
        meta: {
          ...response.meta,
          last_page: Math.max(1, response.meta.last_page),
        },
      };
    },
    placeholderData: (prevData) => prevData,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Publisher>) => publisherService.createPublisher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      toast.success("Veículo criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar veículo"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Publisher> }) =>
      publisherService.updatePublisher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      toast.success("Veículo atualizado com sucesso");
    },
    onError: () => toast.error("Erro ao atualizar veículo"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publisherService.deletePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      toast.success("Veículo excluído com sucesso");
    },
    onError: () => toast.error("Erro ao excluir veículo"),
  });

  const importMutation = useMutation({
    mutationFn: ({ formData, type }: { formData: FormData; type: 'journal' | 'conference' }) =>
      publisherService.createPublishersFromSpreadsheet(formData, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      toast.success("Upload da planilha realizado com sucesso");
    },
    onError: () => toast.error("Erro ao realizar o upload da planilha"),
  });

  return {
    publishers: publishersData?.data || [],
    pagination: publishersData || null,
    isLoading,
    isError,
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    qualisFilter,
    setQualisFilter,
    qualisOptions,
    createMutation,
    updateMutation,
    deleteMutation,
    importMutation,
  };
}
