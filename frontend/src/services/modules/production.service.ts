import { Production } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const productionService = {
  async createUserProduction(body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string, data: Production }>('/api/portal/user/productions', body);
  },

  async createProductionXML(body: FormData, headers: Record<string, string> = {}) {
    return apiClient.post<{ status: string, message: string }>('/api/portal/user/lattes-update', body, headers);
  },

  async createProductionDoi(body: RequestBodyType) {
    return apiClient.post<{ status: number, message: string, data: Production }>('/api/portal/user/productions/doi', body);
  },

  async updateProduction(id: number, body: RequestBodyType) {
    return apiClient.put<{ status: string, message: string }>(`/api/portal/user/productions/${id}`, body);
  },

  async deleteProduction(id: number) {
    return apiClient.delete<{ status: string, message: string }>(`/api/portal/user/productions/${id}`);
  },

  async clearProduction() {
    return apiClient.delete<{ status: string, message: string }>('/api/portal/user/productions/all');
  },
};
