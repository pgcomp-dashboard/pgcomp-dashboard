import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { apiClient } from "../http-client";

export const publisherService = {
  async getAllPublishers(params: Record<string, any> = {}) {
    return await apiClient.get<PaginatedResponse<Publisher>>(
      "/api/admin/publishers",
      params,
    );
  },

  async searchPublishers(params: Record<string, any> = {}) {
    return await apiClient.get<PaginatedResponse<Publisher>>(
      "/api/portal/publishers",
      params,
    );
  },

  async createPortalPublisher(data: Partial<Publisher>) {
    const response = await apiClient.post<{ data: Publisher }>(
      "/api/portal/publishers",
      data,
    );
    return response.data;
  },

  async createPublishersFromSpreadsheet(
    body: FormData,
    type: "journal" | "conference",
  ) {
    body.append("type", type);
    const url = "/api/admin/publishers/import";

    const response = await apiClient.post<{ data: string }>(url, body);
    return response.data;
  },

  async getConferenceByInitial(initial: string) {
    const response = await apiClient.get<{ data: Publisher }>(
      `/api/portal/conference?initial=${initial}`,
    );
    return response.data;
  },

  async getJournalByIssn(issn: string) {
    const response = await apiClient.get<{ data: Publisher }>(
      `/api/portal/journal?issn=${issn}`,
    );
    return response.data;
  },

  async createPublisher(data: Partial<Publisher>) {
    const response = await apiClient.post<{ data: Publisher }>(
      "/api/admin/publishers",
      data,
    );
    return response.data;
  },

  async updatePublisher(id: number, data: Partial<Publisher>) {
    const response = await apiClient.put<{ data: Publisher }>(
      `/api/admin/publishers/${id}`,
      data,
    );
    return response.data;
  },

  async deletePublisher(id: number) {
    return await apiClient.delete<{ message: string }>(
      `/api/admin/publishers/${id}`,
    );
  },

  async approvePublisher(id: number) {
    return await apiClient.post<{ message: string }>(
      `/api/admin/publishers/${id}/approve`,
      {}
    );
  },
};
