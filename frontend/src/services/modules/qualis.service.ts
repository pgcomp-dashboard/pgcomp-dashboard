import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const qualisService = {
  async createQualis(body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = '/api/admin/qualis';
    const response = await apiClient.post(endpoint, body, headers);
    return response;
  },

  async getAllQualis() {
    const response = await apiClient.get<{ data: Array<{ id: number; type: string; code: string; score: number; created_at: string; updated_at: string }> }>(
      '/api/portal/qualis?per_page=20',
    );
    return response.data;
  },

  async updateQualis(id: number, body: RequestBodyType) {
    return apiClient.put(`/api/admin/qualis/${id}`, body);
  },

  async deleteQualis(id: number, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = `/api/admin/qualis/${id}`;
    const response = await apiClient.delete(endpoint, headers);
    return response;
  },
};
