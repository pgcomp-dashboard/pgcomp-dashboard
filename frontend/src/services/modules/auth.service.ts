import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const authService = {
  async login(email: string, password: string) {
    return apiClient.post<{ token: string, name: string, role: string }>('/api/login', { email, password });
  },

  async forgotPassword(body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string }>('/api/forgot-password', body);
  },

  async resetUserPassword(body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string }>('/api/reset-password', body);
  },

  async updateUserPassword(body: RequestBodyType) {
    return apiClient.put<{ status: string, message: string }>('/api/portal/user/update', body);
  },
};
