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

  async getRankingWithProductions(year1?: number, year2?: number) {
    let response;
    if (year1 && year2) {
      response = await apiClient.get<{ data: Ranking[] }>(`/api/admin/ranking?year1=${year1}&year2=${year2}`);
    } else {
      response = await apiClient.get<{ data: Ranking[] }>('/api/admin/ranking');
    }
    return response.data;
  },
};
