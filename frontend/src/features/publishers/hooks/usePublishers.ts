import { publisherService } from "@/services/modules/publisher.service";
import { qualisService } from "@/services/modules/qualis.service";
import { Publisher, StratumQualis } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";

export function usePublishers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [qualisFilter, setQualisFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("approved");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Reset to page 1 when filters or perPage change
  const handleSetPerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleSetSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleSetTypeFilter = (newType: string) => {
    setTypeFilter(newType);
    setPage(1);
  };

  const handleSetQualisFilter = (newQualis: string) => {
    setQualisFilter(newQualis);
    setPage(1);
  };

  const handleSetApprovalFilter = (newApproval: string) => {
    setApprovalFilter(newApproval);
    setPage(1);
  };

  const { data: qualisOptions = [] } = useQuery<StratumQualis[], Error>({
    queryKey: ["qualis"],
    queryFn: () => qualisService.getAllQualis(),
  });

  const { data: publishersData, isLoading, isError, isFetching, refetch } = useQuery<PaginatedResponse<Publisher>, Error>({
    queryKey: ["publishers", page, perPage, search, typeFilter, qualisFilter, approvalFilter, sorting],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
        filter: {},
      };

      if (search.trim()) {
        params.filter.search = search.trim();
      }

      if (typeFilter !== 'all') {
        params.filter.publisher_type = typeFilter;
      }

      if (approvalFilter !== 'all') {
        params.filter.status = approvalFilter;
      }

      if (qualisFilter !== 'all') {
        params.filter.qualis_code = qualisFilter;
      }

      if (sorting.length > 0) {
        const sort = sorting[0];
        params.sort = sort.desc ? `-${sort.id}` : sort.id;
      }

      const response = await publisherService.getAllPublishers(params);

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
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      toast.success("Veículo excluído com sucesso");
    },
    onError: () => toast.error("Erro ao excluir veículo"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => publisherService.approvePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      toast.success("Veículo aprovado com sucesso!");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erro ao aprovar veículo";
      toast.error(message);
    },
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

  const deletePendingMutation = useMutation({
    mutationFn: () => publisherService.deleteAllPending(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-summary"] });
      toast.success("Todos os veículos pendentes foram excluídos");
    },
    onError: () => toast.error("Erro ao excluir veículos pendentes"),
  });

  return {
    publishers: publishersData?.data || [],
    pagination: publishersData || null,
    isLoading,
    isFetching,
    isError,
    page,
    setPage,
    perPage,
    setPerPage: handleSetPerPage,
    search,
    setSearch: handleSetSearch,
    typeFilter,
    setTypeFilter: handleSetTypeFilter,
    qualisFilter,
    setQualisFilter: handleSetQualisFilter,
    approvalFilter,
    setApprovalFilter: handleSetApprovalFilter,
    sorting,
    setSorting,
    qualisOptions,
    createMutation,
    updateMutation,
    deleteMutation,
    approveMutation,
    importMutation,
    deletePendingMutation,
    refetch,
  };
}
