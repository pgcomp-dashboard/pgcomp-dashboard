import { Project } from '@/types/academic';
import { apiClient } from '../http-client';

export const projectService = {

  async getUserProjects(professorId: number, params: Record<string, any> = {}) {
    const response = await apiClient.get<{ data: Project[] }>(
      `/api/admin/professors/${professorId}/projects`,
      params
    );
    return response.data;
  },

  async createUserProject(professorId: number, body: Record<string, any>) {
    return apiClient.post<{ data: Project }>(
      `/api/admin/professors/${professorId}/projects`,
      body
    );
  },

  async updateUserProject(professorId: number, projectId: number, body: Record<string, any>) {
    const response = await apiClient.put<{ data: Project }>(
      `/api/admin/professors/${professorId}/projects/${projectId}`,
      body
    );
    return response.data;
  },

  async deleteUserProject(professorId: number, projectId: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/professors/${professorId}/projects/${projectId}`
    );
  },

  async clearUserProjects(professorId: number) {
    return apiClient.delete<{ message: string }>(
      `/api/admin/professors/${professorId}/projects-all`
    );
  },

  async importLattesFile(professorId: number, body: Record<string, any>) {
    return apiClient.post<{ data: string }>(
      `/api/admin/professors/${professorId}/projects/import-lattes`,
      body
    );
  },
};