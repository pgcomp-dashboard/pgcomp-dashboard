import { Professor } from "@/types/user";
import { apiClient } from "../http-client";

export const professorService = {
  async fetchProfessors(params: Record<string, any> = {}) {
    const response = await apiClient.get<{ data: Professor[] }>(
      "/api/admin/professors",
      params
    );
    return response.data;
  },

  async getProfessorById(id: number): Promise<Professor> {
    const response = await apiClient.get<Professor>(
      `/api/admin/professors/${id}`,
    );
    return response;
  },

  async updateProfessor(id: number, data: Partial<Professor>){
    return await apiClient.put<Professor>(`/api/admin/professors/${id}`, data);
  }
};
