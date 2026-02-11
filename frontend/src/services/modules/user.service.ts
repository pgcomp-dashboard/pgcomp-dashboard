import { Ranking } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { Professor } from '@/types/user';
import { apiClient } from '../http-client';

export const userService = {
  async getUserInfo() {
    return await apiClient.get<{ data: Professor }>('/api/portal/user');
  },

  async updateUserInfo(body: RequestBodyType) {
    return await apiClient.put<{ status: number, data: Professor }>('/api/portal/user', body);
  },

  async getAccreditationRanking(year1?: number, year2?: number) {
    const response = await apiClient.get<{ data: Ranking[] }>('/api/admin/accreditation', { year1, year2 });
    return response.data;
  },

  async getAccreditationProductions(userId: number, year1?: number, year2?: number) {
    const response = await apiClient.get<{ data: Ranking }>(`/api/admin/accreditation/${userId}`, { year1, year2 });
    return response.data;
  },
};
