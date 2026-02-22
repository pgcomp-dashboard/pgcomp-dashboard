import { PaginatedResponse } from "@/types/common";
import { Professor } from "@/types/user";
import { apiClient } from "../http-client";

export const professorService = {
  async fetchProfessors(params: Record<string, any> = {}): Promise<PaginatedResponse<Professor>> {
    const response = await apiClient.get<PaginatedResponse<Professor>>(
      "/api/admin/professors",
      params
    );
    return response;
  },

  async getProfessorById(id: number): Promise<Professor> {
    const response = await apiClient.get<Professor>(
      `/api/admin/professors/${id}`,
    );
    return response;
  },

  async updateProfessor(id: number, data: Partial<Professor>){
    return await apiClient.put<Professor>(`/api/admin/professors/${id}`, data);
  },

  async deleteProfessor(id: number): Promise<{ message: string; warnings?: string[] }> {
    return await apiClient.delete<{ message: string; warnings?: string[] }>(`/api/admin/professors/${id}`);
  }
};
