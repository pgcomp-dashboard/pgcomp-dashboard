import { RequestBodyType } from '@/types/common';
import { Professor } from '@/types/user';
import { apiClient } from '../http-client';

export const adminService = {
  // Admin Requests
  async requestAdmin() {
    return apiClient.post<{ message: string; status: string }>('/api/portal/admin-request', {});
  },

  async getAdminStatus() {
    return apiClient.get<{ data: string, status: string }>('/api/portal/admin-status');
  },

  async getAdminRequests() {
    return await apiClient.get<{ data: Professor[], status: string }>('/api/admin/admin-request');
  },

  async avaliateAdminRequest(id: number, body: RequestBodyType) {
    return await apiClient.post<{ data: Professor, message: string }>(`/api/admin/admin-request/${id}`, body)
  },

  // Unified Approval Requests
  async getUnifiedRequests() {
    return await apiClient.get<{ data: any[] }>('/api/admin/approval-requests');
  },

  async approveRequest(id: number, requestType: string) {
    return await apiClient.post(`/api/admin/approval-requests/${id}/approve`, { request_type: requestType });
  },

  async rejectRequest(id: number, requestType: string) {
    return await apiClient.post(`/api/admin/approval-requests/${id}/reject`, { request_type: requestType });
  },
};
