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
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      order_by: orderBy,
      dir: direction,
    });

    if (filters) {
      for (const [ key, value ] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
    }

    const url = `/api/admin/professors?${params.toString()}`;
    const response = await apiClient.get<PaginatedResponse<Professor>>(url);
    return response;
  },

  async getAllProfessors(searchTerm = ''): Promise<Professor[]> {
    const allProfessors: Professor[] = [];
    let currentPage = 1;
    let lastPage: number;

    do {
      const { data, last_page } = await apiClient.get(
        `/api/admin/professors?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`,
      ) as any;

      allProfessors.push(...data);
      lastPage = last_page;
      currentPage++;
    } while (currentPage <= lastPage);

    return allProfessors.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getProfessorById(id: number): Promise<Professor> {
    const response = await apiClient.get<Professor>(`/api/admin/professors/${id}`);
    return response;
  },
};
