import { Ranking } from "@/types/academic";
import { RequestBodyType } from "@/types/common";
import { Professor, User } from "@/types/user";
import { apiClient } from "../http-client";

export const userService = {
  async getUser() {
    return await apiClient.get<User>("/api/user");
  },

  async updateUser(body: RequestBodyType) {
    return await apiClient.put<{ status: number; data: Professor }>(
      "/api/portal/user",
      body,
    );
  },

  async getAccreditationRanking(year1?: number, year2?: number) {
    const response = await apiClient.get<{ data: Ranking[] }>(
      "/api/admin/accreditation",
      { year1, year2 },
    );
    return response.data;
  },

  async getAccreditationProductions(
    userId: number,
    year1?: number,
    year2?: number,
  ) {
    const response = await apiClient.get<{ data: Ranking }>(
      `/api/admin/accreditation/${userId}`,
      { year1, year2 },
    );
    return response.data;
  },

  async getPendingApprovals() {
    return await apiClient.get<{ data: User[] }>("/api/admin/users/pending");
  },

  async approveUser(userId: number) {
    return await apiClient.post(`/api/admin/users/${userId}/approve`, {});
  },
};
