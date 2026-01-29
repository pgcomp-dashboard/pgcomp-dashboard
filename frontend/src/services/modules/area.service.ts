import { Area } from '@/types/academic';
import { apiClient } from '../http-client';

export const areaService = {
  async fetchAreas(): Promise<Area[]> {
    const response = await apiClient.get<{ data: { id: number; area: string }[] }>('/api/admin/areas');
    return response.data.map((item) => ({
      id: item.id,
      name: item.area,
      students: 0,
    }));
  },

  async createArea(area: { name: string }) {
    const response = await apiClient.post<{ data: { id: number; area: string } }>(
      '/api/admin/areas',
      { area: area.name },
    );
    return { id: response.data.id, name: response.data.area, students: 0 };
  },

  async updateArea(area: { id: number; name: string }) {
    const response = await apiClient.put<{ data: { id: number; area: string } }>(
      `/api/admin/areas/${area.id}`,
      { area: area.name },
    );
    return { id: response.data.id, name: response.data.area, students: 0 };
  },

  async deleteArea(id: number) {
    return apiClient.delete<{ message: string }>(`/api/admin/areas/${id}`);
  },
};
