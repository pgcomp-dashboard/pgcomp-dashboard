import { Course } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { Professor } from '@/types/user';
import { apiClient } from '../http-client';

export const adminService = {
  // Courses
  async fetchCourses() {
    const response = await apiClient.get<{ data: Course[] }>('/api/admin/courses');
    return response.data;
  },

  // Scraping
  async executeScraping() {
    return apiClient.post('/api/admin/execute_scraping', {});
  },

  async executeScrapingForAProfessor(body: RequestBodyType) {
    return apiClient.post('/api/admin/execute_professor_scraping', body);
  },

  async getScrapingExecutions() {
    const response = await apiClient.get('/api/admin/scraping_execution') as {
      status: string,
      message: string,
      data: {
        id: number,
        command: string,
        executed_at: string,
      }[],
    };

    return response.data;
  },

  async getScrapingInterval() {
    const response = await apiClient.get('/api/admin/scraping_execution_interval');
    return response as {
      intervalDays: number,
    };
  },

  async setScrapingInterval(intervalDays: number) {
    return apiClient.post('/api/admin/scraping_execution_interval', { days: intervalDays });
  },

  // Admin Requests
  async requestAdmin() {
    return apiClient.post<{ message: string; status: string }>('/api/portal/admin-request', {});
  },

  async getAdminStatus() {
    return apiClient.get<{ data: string, status: string }>('api/portal/admin-status');
  },

  async getAdminRequests() {
    return await apiClient.get<{ data: Professor[], status: string }>('/api/admin/admin-request');
  },

  async approveAdmin(id: number) {
    return await apiClient.post<{ data: Professor, message: string }>(`/api/admin/admin-request/${id}/approve`, {})
  },

  async rejectAdmin(id: number) {
    return await apiClient.post<{ data: Professor, message: string }>(`/api/admin/admin-request/${id}/reject`, {})
  }
};
