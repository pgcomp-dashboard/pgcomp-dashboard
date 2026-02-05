import { Production } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const productionService = {
  //Types of production creation
  //USER
  //Create manually sending all info
  async createProduction(body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string, data: Production }>('/api/portal/productions', body);
  },

  //Create by uploading a lattes xml or zip file taken from the lattes page
  async uploadLattes(body: RequestBodyType) {
    return apiClient.post<{ data: string }>('/api/portal/lattes-update', body);
  },

  //Create from a api by sending the DOI link or code, both work
  async createProductionFromDoi(body: RequestBodyType) {
    return apiClient.post<{ status: number, message: string, data: Production }>('/api/portal/productions/doi', body);
  },

  //Get productions of logged user.
  async getProductions() {
    const response = await apiClient.get<{ data: Production[] }>('/api/portal/productions');
    return response.data;
  },

  //Update a production manually
  async updateProduction(id: number, body: RequestBodyType) {
    return apiClient.put<{ status: string, message: string }>(`/api/portal/productions/${id}`, body);
  },

  //Delete a production
  async deleteProduction(id: number) {
    return apiClient.delete<{ status: string, message: string }>(`/api/portal/productions/${id}`);
  },

  //Delete all user productions
  async clearProductions() {
    return apiClient.delete<{ status: string, message: string }>('/api/portal/productions/all');
  },

  //ADMIN
  //Upload a lattes file for another user
  async uploadUserLattes(professorId: number, body: RequestBodyType) {
    return apiClient.post<{ data: string }>(`/api/admin/lattes-update/${professorId}`, body);
  },

  async createUserProduction(professorId: number, body: RequestBodyType) {
    return apiClient.post<{ status: string, message: string }>(`/api/admin/professors/${professorId}/productions`, body);
  },

  async getAllProduction() {
    return apiClient.get<{status: string, message: string}>('/api/admin/productions');
  },

  async getProduction(productionId: number) {
    return apiClient.get<{status: string, message: string}>(`/api/admin/productions/${productionId}`);
  },

  async getUserProductions(professorId: number) {
    const response = await apiClient.get<{ data: Production[] }>(`/api/admin/professors/${professorId}/productions/`);
    return response.data;
  },

  async updateUserProduction(productionId: number, body: RequestBodyType) {
    const response = await apiClient.put<{ data: Production }>(`/api/admin/production/${productionId}`, body);
    return response.data;
  }
};
