import { adminService } from '@/services/modules/admin.service';
import { PaginatedResponse } from '@/types/common';
import { Professor } from '@/types/user';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function useLattesUploads() {
  const [ page, setPage ] = useState(1);
  const [ perPage, setPerPage ] = useState(15);
  const [ searchTerm, setSearchTerm ] = useState('');

  const { data, isLoading, isFetching, isError, refetch } = useQuery<PaginatedResponse<Professor>, Error>({
    queryKey: [ 'lattes-uploads', page, perPage, searchTerm ],
    queryFn: () =>
      adminService.getLattesUploads({
        page,
        per_page: perPage,
        search: searchTerm.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleDownload = async (userId: number, userName: string) => {
    try {
      await adminService.downloadLattesXml(userId, userName);
      toast.success('Download iniciado com sucesso!');
    } catch {
      toast.error('Erro ao baixar arquivo XML.');
    }
  };

  return {
    uploads: data?.data ?? [],
    isLoading: isLoading || (isFetching && !data),
    isFetching,
    isError,
    page,
    setPage,
    perPage,
    setPerPage,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    meta: data?.meta,
    handleDownload,
    refresh: refetch,
  };
}
