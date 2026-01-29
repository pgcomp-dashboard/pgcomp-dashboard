import { Publisher } from '@/types/academic';
import { RequestBodyType } from '@/types/common';
import { apiClient } from '../http-client';

export const qualisService = {
  async createQualis(body: RequestBodyType, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = '/api/admin/qualis';
    const response = await apiClient.post(endpoint, body, headers);
    return response;
  },

  async getAllQualis() {
    const response = await apiClient.get<{ data: Array<{ id: number; type: string; code: string; score: number; created_at: string; updated_at: string }> }>(
      '/api/portal/qualis?per_page=20',
    );
    return response.data;
  },

  async updateQualis(id: number, body: RequestBodyType) {
    return apiClient.put(`/api/admin/qualis/${id}`, body);
  },

  async deleteQualis(id: number, headers: Record<string, string> = {}): Promise<unknown> {
    const endpoint = `/api/admin/qualis/${id}`;
    const response = await apiClient.delete(endpoint, headers);
    return response;
  },

  async createQualisBySpreadSheet(formData: FormData, type: 'journal' | 'conference') {
    // Note: This specific method in api.ts used fetch directly to handle formData?
    // Or just because it constructed the URL manually.
    // api.ts: this.baseUrl + "..."
    // The apiClient.request handles headers broadly.
    // However, for FormData, we usually do NOT want 'Content-Type': 'application/json'.
    // The apiClient logic sets 'Content-Type': 'application/json' by default BUT
    // "if (body && typeof body === 'object' && finalHeaders['Content-Type'] === 'application/json')"
    // We need to support FormData in HttpClient or override headers here.

    // For now, I will use fetch similarly but using apiClient.getBaseUrl() and apiClient.getAuthToken()
    // OR I can use apiClient.post but pass override headers.
    // If I pass 'Content-Type': undefined for FormData, browser sets it with boundary.

    const token = apiClient.getAuthToken();
    const baseUrl = apiClient.getBaseUrl();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // We rely on browser setting Content-Type for FormData
    const url = type === 'journal'
      ? '/api/admin/journal-qualis-spreadsheet'
      : '/api/admin/conference-qualis-spreadsheet';

    const response = await fetch(baseUrl + url, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
    return response;
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
};
