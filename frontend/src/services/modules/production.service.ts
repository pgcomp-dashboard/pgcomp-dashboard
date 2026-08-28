import { Production } from "@/types/academic";
import { RequestBodyType } from "@/types/common";
import { apiClient } from "../http-client";

export const productionService = {
  //Types of production creation
  //USER
  //Create manually sending all info
  async createProduction(body: RequestBodyType) {
    return apiClient.post<{
      status: string;
      message: string;
      data: Production;
    }>("/api/portal/productions", body);
  },

  //Create by uploading a lattes xml or zip file taken from the lattes page
  async uploadLattes(body: RequestBodyType) {
    return apiClient.post<{ data: string }>("/api/portal/lattes-update", body);
  },

  //Create from a api by sending the DOI link or code, both work
  async createProductionFromDoi(body: RequestBodyType) {
    return apiClient.post<{
      status: number;
      message: string;
      data: Production;
    }>("/api/portal/productions/doi", body);
  },

  //Get productions of logged user.
  async getProductions(params: Record<string, any> = {}) {
    const response = await apiClient.get<{ data: Production[] }>(
      "/api/portal/productions",
      params,
    );
    return response.data;
  },

  //Update a production manually
  async updateProduction(id: number, body: RequestBodyType) {
    return apiClient.put<{ status: string; message: string }>(
      `/api/portal/productions/${id}`,
      body,
    );
  },

  //Delete a production
  async deleteProduction(id: number) {
    return apiClient.delete<{ status: string; message: string }>(
      `/api/portal/productions/${id}`,
    );
  },

  //Delete all user productions
  async clearProductions() {
    return apiClient.delete<{ status: string; message: string }>(
      "/api/portal/productions/all",
    );
  },

  async toggleFeatured(id: number) {
    return apiClient.post<{ production_id: number; is_featured: boolean }>(
      `/api/portal/productions/${id}/featured`,
      {},
    );
  },

  async getFeaturedGrouped(params: Record<string, any> = {}) {
    return apiClient.get<FeaturedProductionsResponse>(
      "/api/admin/productions/featured",
      params,
    );
  },

  //ADMIN
  //Upload a lattes file for another user
  async uploadUserLattes(professorId: number, body: RequestBodyType) {
    return apiClient.post<{ data: string }>(
      `/api/admin/lattes-update/${professorId}`,
      body,
    );
  },

  async createUserProduction(professorId: number, body: RequestBodyType) {
    return apiClient.post<{ status: string; message: string }>(
      `/api/admin/professors/${professorId}/productions`,
      body,
    );
  },

  async getAllProduction(params: Record<string, any> = {}) {
    return apiClient.get<{ status: string; message: string }>(
      "/api/admin/productions",
      params,
    );
  },

  async getProduction(productionId: number) {
    return apiClient.get<{ status: string; message: string }>(
      `/api/admin/productions/${productionId}`,
    );
  },

  async getUserProductions(
    professorId: number,
    params: Record<string, any> = {},
  ) {
    const response = await apiClient.get<{ data: Production[] }>(
      `/api/admin/professors/${professorId}/productions/`,
      params,
    );
    return response.data;
  },

  async updateUserProduction(
    professorId: number,
    productionId: number,
    body: RequestBodyType,
  ) {
    const response = await apiClient.put<{ data: Production }>(
      `/api/admin/professors/${professorId}/productions/${productionId}`,
      body,
    );
    return response.data;
  },

  async clearUserProductions(professorId: number) {
    return apiClient.delete<{ status: string; message: string }>(
      `/api/admin/professors/${professorId}/productions-all`,
    );
  },

  async deleteUserProduction(professorId: number, productionId: number) {
    return apiClient.delete<{ status: string; message: string }>(
      `/api/admin/professors/${professorId}/productions/${productionId}`,
    );
  },

  async createProfessorProductionFromDoi(
    professorId: number,
    body: RequestBodyType,
  ) {
    return apiClient.post<{
      status: number;
      message: string;
      data: Production;
    }>(`/api/admin/professors/${professorId}/productions/doi`, body);
  },
};

export interface FeaturedProductionsResponse {
  data: Array<{
    professor: { id: number; name: string };
    productions: Array<{
      id: number;
      production_id: number;
      production: {
        id: number;
        title: string;
        year: number;
        type: string;
        publisher: string | null;
      };
    }>;
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
