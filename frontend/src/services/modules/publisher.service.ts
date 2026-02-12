import { Publisher } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { apiClient } from "../http-client";

export const publisherService = {
  async getAllPublishers(page: number = 1, perPage: number = 10, filters: Record<string, any> = {}) {
    const params = {
      page,
      per_page: perPage,
      ...filters,
    };
    return await apiClient.get<PaginatedResponse<Publisher>>('/api/admin/publishers', params);
  },

  async createPublishersFromSpreadsheet(body: FormData, type: 'journal' | 'conference') {
    body.append('type', type);
    const url = '/api/admin/publishers/import';

    const response = await apiClient.post<{ data: string }>(url, body);
    return response.data;
  },

  async getConferenceByInitial(initial: string) {
    const response = await apiClient.get<{ data: Publisher }>(`/api/portal/conference?initial=${initial}`);
    return response.data;
  },

  async getJournalByIssn(issn: string) {
    const response = await apiClient.get<{ data: Publisher }>(`/api/portal/journal?issn=${issn}`);
    return response.data;
  },
}
