import { Production } from '@/types/academic';
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

  async getProductionsOfUser() {
    const response = await apiClient.get<{ data: Production[] }>('/api/portal/productions');
    return response.data;
  },
};
