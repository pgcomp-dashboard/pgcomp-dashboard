import { apiClient } from '@/services/http-client';
import { Advisor } from '@/types/user';

export const dashboardService = {
  async totalStudentsPerAdvisor(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: Advisor }>('/api/admin/dashboard/total_students_per_advisor', { user_type: filter });
  },

  async totalProductionsPerYear(filter?: 'journal' | 'conference') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/all_production', { publisher_type: filter });
  },

  async studentsPerField(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/fields', { selectedFilter: filter });
  },

  async studentsPerSubfield(filter?: 'mestrando' | 'doutorando' | 'completed') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/subfields', { selectedFilter: filter });
  },

  async productionPerQualis() {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/production_per_qualis');
  },

  async defensesPerYear(filter?: 'mestrado' | 'doutorado') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/defenses_per_year', { filter });
  },

  async enrollmentsPerYear(filter?: 'mestrado' | 'doutorado') {
    return apiClient.get<{ [key: string]: number }>('/api/admin/dashboard/enrollments_per_year', { filter });
  },

  async professors() {
    const response = await apiClient.get<{ data: { id: number; name: string }[] }>('/api/admin/dashboard/professors');
    return response.data;
  },

  async professorProductionPerYear(professorId: number, startYear?: number, endYear?: number, publisherType?: 'journal' | 'conference') {
    const year = new Date().getFullYear();
    const from = startYear ?? year - 2;
    const to = endYear ?? year;
    const response = await apiClient.get<{ productions: { [key: string]: number } }>(
      `/api/admin/dashboard/professor/${professorId}/productions`,
      { anoInicial: from, anoFinal: to, publisher_type: publisherType },
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
  async getPendingSummary() {
    return apiClient.get<{
      registrations: number;
      admin_requests: number;
      publishers: number;
      total: number;
    }>('/api/admin/dashboard/pending-summary');
  },
};