import { apiClient } from "@/services/http-client";
import { Advisor, AdvisorStudent } from "@/types/user";

export interface ProductionStatistics {
  faculty: { id: number; name: string; total: number }[];
  faculty_summary: {
    faculty_count: number;
    faculty_with_productions_count: number;
    mean: number | null;
    median: number | null;
    standard_deviation: number | null;
    minimum: number | null;
    maximum: number | null;
  };
  conferences_by_qualis: QualisProductionStatistics[];
  journals_by_qualis: QualisProductionStatistics[];
  productions_per_year: { year: number; total: number }[];
}

export interface QualisProductionStatistics {
  qualis: string;
  total: number;
  percentage: number;
}

export const dashboardService = {
  async productionStatistics() {
    return apiClient.get<ProductionStatistics>(
      "/api/admin/dashboard/production-statistics",
    );
  },

  async totalStudentsPerAdvisor(
    filter?: "mestrando" | "doutorando" | "completed",
  ) {
    return apiClient.get<{ [key: string]: Advisor }>(
      "/api/admin/dashboard/total_students_per_advisor",
      { user_type: filter },
    );
  },

  async totalProductionsPerYear(
    filter?: "journal" | "conference",
    qualis?: string[],
  ) {
    return apiClient.get<{ [key: string]: number }>(
      "/api/admin/dashboard/all_production",
      {
        publisher_type: filter,
        qualis: qualis && qualis.length > 0 ? qualis.join(",") : undefined,
      },
    );
  },

  async studentsPerField(filter?: "mestrando" | "doutorando" | "completed") {
    return apiClient.get<{ [key: string]: number }>(
      "/api/admin/dashboard/fields",
      { selectedFilter: filter },
    );
  },

  async studentsPerSubfield(filter?: "mestrando" | "doutorando" | "completed") {
    return apiClient.get<{ [key: string]: number }>(
      "/api/admin/dashboard/subfields",
      { selectedFilter: filter },
    );
  },

  async productionPerQualis(
    publisherType?: "journal" | "conference",
    userType?: "docente" | "mestrando" | "doutorando",
    qualis?: string[],
  ) {
    return apiClient.get<{
      years: number[];
      data: { label: string; data: number[] }[];
    }>("/api/admin/dashboard/production_per_qualis", {
      publisher_type: publisherType,
      user_type: userType,
      qualis: qualis && qualis.length > 0 ? qualis.join(",") : undefined,
    });
  },

  async defensesPerYear(filter?: "mestrado" | "doutorado") {
    return apiClient.get<{ [key: string]: number }>(
      "/api/admin/dashboard/defenses_per_year",
      { filter },
    );
  },

  async enrollmentsPerYear(filter?: "mestrado" | "doutorado") {
    return apiClient.get<{ [key: string]: number }>(
      "/api/admin/dashboard/enrollments_per_year",
      { filter },
    );
  },

  async professors() {
    const response = await apiClient.get<{
      data: { id: number; name: string }[];
    }>("/api/admin/dashboard/professors");
    return response.data;
  },

  async professorProductionPerYear(
    professorId: number,
    startYear?: number,
    endYear?: number,
    publisherType?: "journal" | "conference",
    qualis?: string[],
  ) {
    const year = new Date().getFullYear();
    const from = startYear ?? year - 2;
    const to = endYear ?? year;
    const response = await apiClient.get<{
      productions: { [key: string]: number };
    }>(`/api/admin/dashboard/professor/${professorId}/productions`, {
      anoInicial: from,
      anoFinal: to,
      publisher_type: publisherType,
      qualis: qualis && qualis.length > 0 ? qualis.join(",") : undefined,
    });
    return response.productions;
  },

  async numberOfStudents(): Promise<{ category: string; amount: number }[]> {
    const response = (await apiClient.get(
      "/api/admin/dashboard/students",
    )) as Record<
      string,
      {
        in_progress: number;
        completed: number;
      }
    >;

    return Object.entries(response)
      .map(([course, students]) => [
        { category: `${course} - Alunos atuais`, amount: students.in_progress },
        {
          category: `${course} - Alunos concluídos`,
          amount: students.completed,
        },
      ])
      .flat();
  },

  async studentsByAdvisor(
    professorId: number,
    filter?: "mestrando" | "doutorando" | "completed",
  ) {
    const response = await apiClient.get<{ data: AdvisorStudent[] }>(
      `/api/admin/dashboard/advisor/${professorId}/students`,
      { user_type: filter },
    );
    return response.data;
  },

  async getPendingSummary() {
    return apiClient.get<{
      registrations: number;
      student_registrations?: number;
      admin_requests: number;
      publishers: number;
      total: number;
    }>("/api/admin/dashboard/pending-summary");
  },
};
