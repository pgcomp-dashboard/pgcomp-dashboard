import { ProjectDashboardSummary, ProjectDashboardRow, ProjectDashboardProfessor } from '@/features/projects/types';
import { apiClient } from '../http-client';

export const projectDashboardService = {
  async getSummary(params?: { professor_id?: number; year?: number; status?: string }) {
    return await apiClient.get<ProjectDashboardSummary>(
      '/api/admin/projects-dashboard/summary',
      params,
    );
  },

  async getTable(params?: { professor_id?: number; year?: number; status?: string }) {
    const response = await apiClient.get<{ data: ProjectDashboardRow[] }>(
      '/api/admin/projects-dashboard/table',
      params,
    );
    return response.data;
  },

  async getProfessors() {
    const response = await apiClient.get<{ data: ProjectDashboardProfessor[] }>(
      '/api/admin/projects-dashboard/professors',
    );
    return response.data;
  },
};