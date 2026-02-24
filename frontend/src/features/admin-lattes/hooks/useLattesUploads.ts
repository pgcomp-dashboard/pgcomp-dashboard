import { adminService } from "@/services/modules/admin.service";
import { Professor } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function useLattesUploads() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, refetch } = useQuery<{ data: Professor[]; meta: any }, Error>({
    queryKey: ["lattes-uploads", page, perPage],
    queryFn: () => adminService.getLattesUploads({ page, per_page: perPage }),
    placeholderData: (previousData) => previousData,
  });

  const uploads = useMemo<Professor[]>(() => {
    let list = data?.data || [];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(term));
    }
    return list;
  }, [data, searchTerm]);

  const handleDownload = async (userId: number, userName: string) => {
    try {
      await adminService.downloadLattesXml(userId, userName);
      toast.success("Download iniciado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar arquivo XML.");
    }
  };

  return {
    uploads,
    isLoading,
    isError,
    page,
    setPage,
    perPage,
    setPerPage,
    searchTerm,
    setSearchTerm,
    meta: data?.meta,
    handleDownload,
    refresh: refetch,
  };
}
