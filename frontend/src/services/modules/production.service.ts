import { Production } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const productionService = {
  async createUserProduction(body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string, data: Production }>('/api/portal/productions', body);
  },

  async createProductionXML(body: RequestBodyType) {
    return apiClient.post<{ data: string }>('/api/portal/lattes-update', body);
  },

  async createProductionDoi(body: RequestBodyType) {
    return apiClient.post<{ status: number, message: string, data: Production }>('/api/portal/productions/doi', body);
  },

  // async indexProduction() {
  //   return apiClient.get<>();
  // }

  // async showProduction(id: number) {
  //   return apiClient.get<>();
  // }

  async updateProduction(id: number, body: RequestBodyType) {
    return apiClient.put<{ status: string, message: string }>(`/api/portal/productions/${id}`, body);
  },

  async deleteProduction(id: number) {
    return apiClient.delete<{ status: string, message: string }>(`/api/portal/productions/${id}`);
  },

  async clearProduction() {
    return apiClient.delete<{ status: string, message: string }>('/api/portal/productions/all');
  },
};
