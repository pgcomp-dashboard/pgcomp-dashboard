import { StratumQualis } from "@/types/academic";
import { RequestBodyType } from "@/types/common";
import { apiClient } from "../http-client";

export const qualisService = {
  async createQualis(
    body: RequestBodyType,
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const response = await apiClient.post(
      "/api/admin/stratum_qualis",
      body,
      headers,
    );
    return response;
  },

  async getAllQualis() {
    const response = await apiClient.get<{ data: StratumQualis[] }>(
      "/api/portal/stratum_qualis",
    );
    return response.data;
  },

  async updateQualis(id: number, body: RequestBodyType) {
    return apiClient.put(`/api/admin/stratum_qualis/${id}`, body);
  },

  async deleteQualis(
    id: number,
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const endpoint = `/api/admin/stratum_qualis/${id}`;
    const response = await apiClient.delete(endpoint, headers);
    return response;
  },
};
