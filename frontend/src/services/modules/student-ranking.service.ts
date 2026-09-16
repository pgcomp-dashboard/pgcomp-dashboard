import { StudentRanking } from "@/types/academic";
import { PaginatedResponse } from "@/types/common";
import { apiClient } from "../http-client";

export const studentRankingService = {
  async getRanking(
    year1: number,
    year2: number,
    courseId: number | null,
    page: number,
    perPage: number,
    sort: string,
    direction: "asc" | "desc",
  ) {
    const response = await apiClient.get<PaginatedResponse<StudentRanking>>(
      "/api/admin/student-ranking",
      {
        year1,
        year2,
        course_id: courseId || undefined,
        page,
        per_page: perPage,
        sort,
        direction,
      },
    );

    return response;
  },
};
