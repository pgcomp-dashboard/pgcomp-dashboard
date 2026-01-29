import { Ranking } from '@/types/academic';
import { Advisor } from '@/types/user';
import { apiClient } from '../http-client';

export const dashboardService = {
  async totalStudentsPerAdvisor(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?user_type=${filter}` : '';
    return apiClient.get<{ [key: string]: Advisor }>(`/api/admin/dashboard/total_students_per_advisor${query}`);
  },

  async totalProductionsPerYear(filter?: 'journal' | 'conference') {
    const query = filter ? `?publisher_type=${filter}` : '';
    return apiClient.get<{ [key: string]: number }>(`/api/admin/dashboard/all_production${query}`);
  },

  async studentsPerField(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?selectedFilter=${filter}` : '';
    return apiClient.get<{ [key: string]: number }>(`/api/admin/dashboard/fields${query}`);
  },

  async studentsPerSubfield(filter?: 'mestrando' | 'doutorando' | 'completed') {
    const query = filter ? `?selectedFilter=${filter}` : '';
    return apiClient.get<{ [key: string]: number }>(`/api/admin/dashboard/subfields${query}`);
  },

  async productionPerQualis() {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/production_per_qualis');
  },

  async defensesPerYear(filter?: 'mestrado' | 'doutorado') {
    const query = filter ? `?filter=${filter}` : '';
    return apiClient.get<{ [key: string]: number }>(`/api/admin/dashboard/defenses_per_year${query}`);
  },

  async enrollmentsPerYear(filter?: 'mestrado' | 'doutorado') {
    const query = filter ? `?filter=${filter}` : '';
    return apiClient.get<{ [key: string]: number }>(`/api/admin/dashboard/enrollments_per_year${query}`);
  },

  async professors() {
    const response = await apiClient.get<{ data: { id: number; name: string }[] }>('/api/admin/dashboard/professors');
    return response.data;
  },

  async professorProductionPerYear(professorId: number, startYear?: number, endYear?: number) {
    const year = new Date().getFullYear();
    const from = startYear ?? year - 2;
    const to = endYear ?? year;
    const response = await apiClient.get<{ productions: { [key: string]: number } }>(
      `/api/admin/dashboard/professor/${professorId}/productions?anoInicial=${from}&anoFinal=${to}`,
    );
    return response.productions;
  },

  async numberOfStudents(): Promise<{ category: string; amount: number }[]> {
    const response = (await apiClient.get('/api/admin/dashboard/students')) as Record<
      string,
      {
        in_progress: number,
        completed: number,
      }
    >;

    return Object.entries(response).map(([ course, students ]) => [
      { category: `${course} - Alunos atuais`, amount: students.in_progress },
      { category: `${course} - Alunos concluídos`, amount: students.completed },
    ]).flat();
  },

  async getRankingProductionsOfUser(year1?: number, year2?: number) {
    let response;
    if (year1 && year2) {
      response = await apiClient.get<{ data: Ranking[] }>(`/api/portal/ranking?year1=${year1}&year2=${year2}`);
    } else {
      response = await apiClient.get<{ data: Ranking[] }>('/api/portal/ranking');
    }
    return response.data;
  },
};
