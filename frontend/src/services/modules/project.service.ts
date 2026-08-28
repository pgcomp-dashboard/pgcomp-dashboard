import { Project } from '@/types/academic';
import { apiClient } from '../http-client';

type ProjectBody = {
  name: string;
  home_page?: string | null;
  start_year: number;
  end_year?: number | null;
  status?: string | null;
  nature?: string | null;
  workload?: number | null;
  value?: number | null;
  funding_source?: string | null;
  role?: string;
};

export const projectService = {
  // ADMIN

  async getUserProjects(professorId: number, params: Record<string, string> = {}) {
    const response = await apiClient.get<{ data: Project[] }>(
      `/api/admin/professors/${professorId}/projects`,
      params,
    );
    return response.data;
  },

  async createUserProject(professorId: number, body: ProjectBody) {
    return apiClient.post<{ data: Project }>(
      `/api/admin/professors/${professorId}/projects`,
      body,
    );
  },

  async updateUserProject(professorId: number, projectId: number, body: ProjectBody) {
    const response = await apiClient.put<{ data: Project }>(
      `/api/admin/professors/${professorId}/projects/${projectId}`,
      body,
    );
    return response.data;
  },

  async deleteUserProject(professorId: number, projectId: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/professors/${professorId}/projects/${projectId}`,
    );
  },

  async clearUserProjects(professorId: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/professors/${professorId}/projects-all`,
    );
  },

  async importLattesFile(professorId: number, body: FormData) {
    return apiClient.post<{ data: string }>(
      `/api/admin/professors/${professorId}/projects/import-lattes`,
      body,
    );
  },

  async importLattesFilePortal(formData: FormData) {
    return await apiClient.post(
      '/api/portal/projects/import-lattes', formData);
  },

  async getMyProjects() {
    const response = await apiClient.get<{ data: Project[] }>('/api/portal/projects');
    return response.data;
  },
};