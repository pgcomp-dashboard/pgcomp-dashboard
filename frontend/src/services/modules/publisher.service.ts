import { Publisher } from "@/types/academic";
import { apiClient } from "../http-client";
import { PaginatedResponse } from "@/types/common";

export const publisherService = {
  async getAllPublishers(page: number = 1) {
    const params = {
      page,
    };
    return await apiClient.get<PaginatedResponse<Publisher>>('/api/admin/publishers', params);
  },

  async createPublishersFromSpreadsheet(body: FormData, type: 'journal' | 'conference') {
    body.append('type', type);
    const url = '/api/admin/publishers/import';

    const response = await apiClient.post<{ data: string }>(url, body);
    return response.data;
  },

  async getJournals() {
    const response = await apiClient.get<{ data: Publisher[] }>('/api/portal/journals');
    return response.data;
  },

  async getConferences() {
    return (await apiClient.get<{ data: Publisher[] }>('/api/portal/conferences')).data;
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
