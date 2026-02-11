import { PaginatedResponse } from '@/types/common';
import { Professor } from '@/types/user';
import { apiClient } from '../http-client';

export const professorService = {
  async fetchProfessors(
    page: number = 1,
    perPage: number = 15,
    filters?: Record<string, any>,
    orderBy: string = 'name',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const params = {
      page,
      per_page: perPage,
      order_by: orderBy,
      dir: direction,
      ...filters,
    };

    return await apiClient.get<PaginatedResponse<Professor>>('/api/admin/professors', params);
  },

  async getProfessorById(id: number): Promise<Professor> {
    const response = await apiClient.get<Professor>(`/api/admin/professors/${id}`);
    return response;
  },
};
